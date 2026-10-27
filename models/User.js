const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'username must be at least 3 characters'],
      maxlength: [30, 'username must be at most 30 characters']
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'email is not valid']
    },
    fullName: {
      type: String,
      required: [true, 'fullName is required'],
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'Israel'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
