const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'quantity must be at least 1']
    },
    // price at the moment of purchase, so later price changes won't affect old orders
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user is required']
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'order must contain at least one item'
      }
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['completed', 'cancelled'],
      default: 'completed'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
