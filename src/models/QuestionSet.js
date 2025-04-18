const mongoose = require('mongoose');

const questionReferenceSchema = new mongoose.Schema({
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  order: {
    type: Number,
    required: false
  }
});

const questionSetSchema = new mongoose.Schema({
  teacher_id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  questions: {
    type: [questionReferenceSchema],
    default: []
  }
});

// Create index for frequently queried fields
questionSetSchema.index({ teacher_id: 1 });

const QuestionSet = mongoose.model('QuestionSet', questionSetSchema);

module.exports = QuestionSet; 