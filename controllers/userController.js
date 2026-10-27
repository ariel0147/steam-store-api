const User = require('../models/User');
const Order = require('../models/Order');
const { createUserSchema } = require('../validations/schemas');
const formatZodError = require('../utils/formatZodError');

// POST /api/users
const createUser = async (req, res, next) => {
  try {
    const result = createUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: 'Invalid user data', errors: formatZodError(result.error) });
    }

    const user = await User.create(result.data);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

// GET /api/users
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id/orders
const getUserOrders = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const orders = await Order.find({ user: user._id })
      .populate('items.game', 'title price platforms')
      .sort({ createdAt: -1 });

    res.status(200).json({
      user: { _id: user._id, username: user.username, email: user.email },
      count: orders.length,
      orders
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createUser, getUsers, getUserById, getUserOrders };
