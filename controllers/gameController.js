const Game = require('../models/Game');
const Category = require('../models/Category');
const { createGameSchema, updateGameSchema } = require('../validations/schemas');
const formatZodError = require('../utils/formatZodError');

// POST /api/games
const createGame = async (req, res, next) => {
  try {
    const result = createGameSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: 'Invalid game data', errors: formatZodError(result.error) });
    }

    const category = await Category.findById(result.data.category);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const game = await Game.create(result.data);
    await game.populate('category', 'name');
    res.status(201).json(game);
  } catch (err) {
    next(err);
  }
};

// GET /api/games  (optional ?category=<id>)
const getGames = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const games = await Game.find(filter).populate('category', 'name').sort({ title: 1 });
    res.status(200).json(games);
  } catch (err) {
    next(err);
  }
};

// GET /api/games/:id
const getGameById = async (req, res, next) => {
  try {
    const game = await Game.findById(req.params.id).populate('category', 'name description');
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.status(200).json(game);
  } catch (err) {
    next(err);
  }
};

// PUT /api/games/:id
const updateGame = async (req, res, next) => {
  try {
    const result = updateGameSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: 'Invalid game data', errors: formatZodError(result.error) });
    }

    if (result.data.category) {
      const category = await Category.findById(result.data.category);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
    }

    const game = await Game.findByIdAndUpdate(req.params.id, result.data, {
      returnDocument: 'after',
      runValidators: true
    }).populate('category', 'name');

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.status(200).json(game);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/games/:id
const deleteGame = async (req, res, next) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.status(200).json({ message: 'Game deleted', game });
  } catch (err) {
    next(err);
  }
};

module.exports = { createGame, getGames, getGameById, updateGame, deleteGame };
