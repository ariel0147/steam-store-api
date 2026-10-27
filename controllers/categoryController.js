const Category = require('../models/Category');
const Game = require('../models/Game');
const { createCategorySchema } = require('../validations/schemas');
const formatZodError = require('../utils/formatZodError');

// POST /api/categories
const createCategory = async (req, res, next) => {
  try {
    const result = createCategorySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: 'Invalid category data', errors: formatZodError(result.error) });
    }

    const category = await Category.create(result.data);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

// GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
};

// GET /api/categories/stats - how many games in every category
const getCategoryStats = async (req, res, next) => {
  try {
    const stats = await Category.aggregate([
      {
        $lookup: {
          from: 'games',
          localField: '_id',
          foreignField: 'category',
          as: 'games'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          gamesCount: { $size: '$games' }
        }
      },
      { $sort: { gamesCount: -1, name: 1 } }
    ]);

    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
};

// GET /api/categories/:id/games
const getGamesByCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const games = await Game.find({ category: category._id }).sort({ title: 1 });
    res.status(200).json({ category: category.name, count: games.length, games });
  } catch (err) {
    next(err);
  }
};

module.exports = { createCategory, getCategories, getCategoryStats, getGamesByCategory };
