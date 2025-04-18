const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  supabase_id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  institute: {
    type: String,
    required: false
  },
  subject: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    name: String
  },
  place: {
    type: String,
    required: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User; 