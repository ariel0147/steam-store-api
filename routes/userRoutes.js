const express = require('express');
const { createUser, getUsers, getUserById, getUserOrders } = require('../controllers/userController');

const router = express.Router();

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.get('/:id/orders', getUserOrders);

module.exports = router;
