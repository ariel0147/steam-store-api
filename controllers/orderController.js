const Order = require('../models/Order');
const Game = require('../models/Game');
const User = require('../models/User');
const { createOrderSchema } = require('../validations/schemas');
const formatZodError = require('../utils/formatZodError');

const populateOrder = (query) =>
  query.populate('user', 'username email fullName country').populate({
    path: 'items.game',
    select: 'title developer price platforms category',
    populate: { path: 'category', select: 'name' }
  });

// gives the keys back to the games (used on rollback and on cancel)
const restoreStock = async (items) => {
  for (const item of items) {
    await Game.updateOne({ _id: item.game }, { $inc: { stock: item.quantity } });
  }
};

// POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const result = createOrderSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: 'Invalid order data', errors: formatZodError(result.error) });
    }

    const { user, items } = result.data;

    const userExists = await User.exists({ _id: user });
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // if the same game was sent twice - merge the quantities
    const quantities = new Map();
    for (const item of items) {
      quantities.set(item.game, (quantities.get(item.game) || 0) + item.quantity);
    }
    const gameIds = [...quantities.keys()];

    const games = await Game.find({ _id: { $in: gameIds } });

    // check that all games exist
    if (games.length !== gameIds.length) {
      const foundIds = games.map((g) => g._id.toString());
      const missing = gameIds.filter((id) => !foundIds.includes(id));
      return res.status(404).json({ message: 'Some games were not found', missing });
    }

    // check stock
    const notEnough = games
      .filter((g) => g.stock < quantities.get(g._id.toString()))
      .map((g) => ({
        game: g.title,
        requested: quantities.get(g._id.toString()),
        available: g.stock
      }));

    if (notEnough.length > 0) {
      return res.status(400).json({ message: 'Not enough keys in stock', items: notEnough });
    }

    // update stock - the condition on stock makes sure we never go below 0
    const updated = [];
    for (const game of games) {
      const quantity = quantities.get(game._id.toString());
      const updateResult = await Game.updateOne(
        { _id: game._id, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } }
      );

      if (updateResult.modifiedCount === 0) {
        await restoreStock(updated);
        return res.status(409).json({ message: `Stock of ${game.title} changed, please try again` });
      }
      updated.push({ game: game._id, quantity });
    }

    // price is calculated here and not taken from the client
    const orderItems = games.map((game) => ({
      game: game._id,
      quantity: quantities.get(game._id.toString()),
      unitPrice: game.price
    }));

    const total = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const totalPrice = Math.round(total * 100) / 100;

    let order;
    try {
      order = await Order.create({ user, items: orderItems, totalPrice });
    } catch (err) {
      await restoreStock(updated);
      throw err;
    }

    const fullOrder = await populateOrder(Order.findById(order._id));
    res.status(201).json(fullOrder);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'username email')
      .populate('items.game', 'title price')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await populateOrder(Order.findById(req.params.id));
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:id/cancel
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // status condition prevents cancelling the same order twice
    const cancelled = await Order.findOneAndUpdate(
      { _id: order._id, status: 'completed' },
      { status: 'cancelled' },
      { returnDocument: 'after' }
    );
    if (!cancelled) {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    await restoreStock(cancelled.items);

    const fullOrder = await populateOrder(Order.findById(cancelled._id));
    res.status(200).json({ message: 'Order cancelled, stock restored', order: fullOrder });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getOrders, getOrderById, cancelOrder };
