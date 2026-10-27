const express = require('express');
const { createGame, getGames, getGameById, updateGame, deleteGame } = require('../controllers/gameController');

const router = express.Router();

router.post('/', createGame);
router.get('/', getGames);
router.get('/:id', getGameById);
router.put('/:id', updateGame);
router.delete('/:id', deleteGame);

module.exports = router;
