const mongoose = require('mongoose');

const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Switch'];

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    developer: {
      type: String,
      required: [true, 'developer is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'price is required'],
      min: [0, 'price cannot be negative']
    },
    // number of activation keys left
    stock: {
      type: Number,
      required: [true, 'stock is required'],
      min: [0, 'stock cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'stock must be a whole number'
      }
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'category is required']
    },
    platforms: {
      type: [{ type: String, enum: PLATFORMS }],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'game must have at least one platform'
      }
    },
    releaseDate: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Game', gameSchema);
module.exports.PLATFORMS = PLATFORMS;
