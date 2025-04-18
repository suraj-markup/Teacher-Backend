const mongoose = require('mongoose');

const difficultySchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    unique: true,
    enum: ['easy', 'medium', 'hard']
  }
});

const Difficulty = mongoose.model('Difficulty', difficultySchema);

module.exports = Difficulty; 