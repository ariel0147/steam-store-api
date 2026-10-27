const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'category name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'category name must be at least 2 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
