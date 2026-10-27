const express = require('express');
const {
  createCategory,
  getCategories,
  getCategoryStats,
  getGamesByCategory
} = require('../controllers/categoryController');

const router = express.Router();

router.post('/', createCategory);
router.get('/', getCategories);
router.get('/stats', getCategoryStats); // must be before /:id
router.get('/:id/games', getGamesByCategory);

module.exports = router;
