const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  is_correct: {
    type: Boolean,
    required: true
  },
  image_path: {
    type: String,
    required: false
  }
});

const questionSchema = new mongoose.Schema({
  // Original fields with ObjectIDs
  subject: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    name: String
  },
  exam: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam'
    },
    name: String
  },
  type: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuestionType'
    },
    name: String
  },
  difficulty: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Difficulty'
    },
    level: String
  },
  // New fields for the simplified format
  question_number: {
    type: String,
    required: false
  },
  file_name: {
    type: String,
    required: false
  },
  question_text: {
    type: String,
    required: true
  },
  isQuestionImage: {
    type: Boolean,
    default: false
  },
  question_image: {
    type: String,
    required: false
  },
  isOptionImage: {
    type: Boolean,
    default: false
  },
  options: {
    type: [optionSchema],
    default: []
  },
  option_images: {
    type: [String],
    default: []
  },
  section_name: {
    type: String,
    required: false
  },
  question_type: {
    type: String,
    required: false
  },
  topic: {
    type: String,
    required: false
  },
  exam_name: {
    type: String,
    required: false,
    default:null

  },
  subject_name: {
    type: String,
    required: false,
    default:null
  },
  chapter: {
    type: String,
    required: false,
    default:null

  },
  answer: {
    type: String,
    required: false,
    default:null
  },
  // Original text field (kept for backward compatibility)
  text: {
    type: String,
    required: false
  },
  image_path: {
    type: String,
    required: false
  }
});

// Create indexes for frequently queried fields
questionSchema.index({ 'subject._id': 1 });
questionSchema.index({ 'exam._id': 1 });
questionSchema.index({ 'type._id': 1 });
questionSchema.index({ 'difficulty._id': 1 });
questionSchema.index({ 'subject_name': 1 });
questionSchema.index({ 'exam_name': 1 });
questionSchema.index({ 'chapter': 1 });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question; 