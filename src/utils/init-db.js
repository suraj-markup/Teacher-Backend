const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Exam = require('../models/Exam');
const QuestionType = require('../models/QuestionType');
const Difficulty = require('../models/Difficulty');
const connectDB = require('../config/db');
require('dotenv').config();

// Initial data
const subjects = [
  { name: 'Maths' },
  { name: 'Chemistry' },
  { name: 'Physics' }
];

const exams = [
  { name: 'Boards' },
  { name: 'Jee Mains' },
  { name: 'Jee Advanced' },
  { name: 'Neet' }
];

const questionTypes = [
  { name: 'multiple-choice' },
  { name: 'short-answer' },
  { name: 'long-answer' }
];

const difficulties = [
  { level: 'easy' },
  { level: 'medium' },
  { level: 'hard' }
];

// Function to initialize the database
const initializeDB = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Promise.all([
      Subject.deleteMany({}),
      Exam.deleteMany({}),
      QuestionType.deleteMany({}),
      Difficulty.deleteMany({})
    ]);
    
    console.log('Cleared existing data');
    
    // Insert new data
    await Promise.all([
      Subject.insertMany(subjects),
      Exam.insertMany(exams),
      QuestionType.insertMany(questionTypes),
      Difficulty.insertMany(difficulties)
    ]);
    
    console.log('Inserted initial data');
    
    // Verify data
    const subjectCount = await Subject.countDocuments();
    const examCount = await Exam.countDocuments();
    const typeCount = await QuestionType.countDocuments();
    const difficultyCount = await Difficulty.countDocuments();
    
    console.log(`Database initialized with:`);
    console.log(`- ${subjectCount} subjects`);
    console.log(`- ${examCount} exams`);
    console.log(`- ${typeCount} question types`);
    console.log(`- ${difficultyCount} difficulty levels`);
    
    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Run the initialization
initializeDB(); 