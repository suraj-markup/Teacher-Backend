const mongoose = require('mongoose');

const questionTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

const QuestionType = mongoose.model('QuestionType', questionTypeSchema);

module.exports = QuestionType; 