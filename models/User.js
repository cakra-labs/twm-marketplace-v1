const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  private_key: {
    type: String,
  },
  public_key: {
    type: String,
  },
  phone: {
    type: String,
  },
  role: { type: Number, default: 2 },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked', 'reset']
  },
  paypal: {
    type: String,
  }
});

module.exports = mongoose.model('user', UserSchema);
