const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam; 