const mongoose = require('mongoose');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Exam = require('../models/Exam');
const QuestionType = require('../models/QuestionType');
const Difficulty = require('../models/Difficulty');
const Question = require('../models/Question');
const QuestionSet = require('../models/QuestionSet');
const connectDB = require('../config/db');
require('dotenv').config();

// Sample data
const mockUsers = [
  {
    supabase_id: 'mock-user-1',
    email: 'teacher1@example.com',
    name: 'John Smith',
    institute: 'Excel Academy',
    place: 'Delhi'
  },
  {
    supabase_id: 'mock-user-2',
    email: 'teacher2@example.com',
    name: 'Priya Sharma',
    institute: 'Pinnacle Institute',
    place: 'Mumbai'
  },
  {
    supabase_id: 'mock-user-3',
    email: 'teacher3@example.com',
    name: 'Rajesh Kumar',
    institute: 'Bright Future Coaching',
    place: 'Bangalore'
  }
];

// Generate mock multiple choice questions
const generateMockQuestions = (subjects, exams, types, difficulties, count = 20) => {
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    // Pick random references
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const exam = exams[Math.floor(Math.random() * exams.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    
    // Question text based on subject
    let questionText = '';
    let options = [];
    
    if (subject.name === 'Maths') {
      const mathQuestions = [
        'Solve for x: 2x + 5 = 15',
        'If f(x) = x² + 3x + 2, find f(4)',
        'Find the derivative of y = x³ + 2x² - x + 5',
        'Evaluate ∫(x² + 2x) dx from 0 to 2',
        'If a triangle has sides of length 3, 4, and 5, what is its area?'
      ];
      questionText = mathQuestions[Math.floor(Math.random() * mathQuestions.length)];
      
      if (type.name === 'multiple-choice') {
        if (questionText.includes('2x + 5 = 15')) {
          options = [
            { text: 'x = 5', is_correct: true },
            { text: 'x = 10', is_correct: false },
            { text: 'x = 7.5', is_correct: false },
            { text: 'x = 3', is_correct: false }
          ];
        } else if (questionText.includes('f(x) = x² + 3x + 2')) {
          options = [
            { text: '30', is_correct: true },
            { text: '28', is_correct: false },
            { text: '32', is_correct: false },
            { text: '26', is_correct: false }
          ];
        } else {
          options = [
            { text: Math.floor(Math.random() * 100), is_correct: Math.random() > 0.75 },
            { text: Math.floor(Math.random() * 100), is_correct: Math.random() > 0.75 },
            { text: Math.floor(Math.random() * 100), is_correct: Math.random() > 0.75 },
            { text: Math.floor(Math.random() * 100), is_correct: true }
          ];
          // Ensure at least one correct answer
          if (!options.some(o => o.is_correct)) {
            options[0].is_correct = true;
          }
          // Make sure only one is correct if it's a single-select MCQ
          if (options.filter(o => o.is_correct).length > 1) {
            for (let j = 1; j < options.length; j++) {
              options[j].is_correct = false;
            }
          }
        }
      }
    } else if (subject.name === 'Physics') {
      const physicsQuestions = [
        'What is the SI unit of force?',
        'Calculate the kinetic energy of a 2kg object moving at 5m/s',
        'What is the formula for Newton\'s second law of motion?',
        'Calculate the wavelength of a photon with energy 3.0 eV',
        'If a car accelerates from 0 to 60 km/h in 5 seconds, what is its acceleration?'
      ];
      questionText = physicsQuestions[Math.floor(Math.random() * physicsQuestions.length)];
      
      if (type.name === 'multiple-choice') {
        if (questionText.includes('SI unit of force')) {
          options = [
            { text: 'Newton', is_correct: true },
            { text: 'Joule', is_correct: false },
            { text: 'Watt', is_correct: false },
            { text: 'Pascal', is_correct: false }
          ];
        } else if (questionText.includes('kinetic energy')) {
          options = [
            { text: '25 J', is_correct: true },
            { text: '10 J', is_correct: false },
            { text: '50 J', is_correct: false },
            { text: '5 J', is_correct: false }
          ];
        } else {
          options = [
            { text: 'Option A', is_correct: Math.random() > 0.75 },
            { text: 'Option B', is_correct: Math.random() > 0.75 },
            { text: 'Option C', is_correct: Math.random() > 0.75 },
            { text: 'Option D', is_correct: true }
          ];
          // Ensure at least one correct answer
          if (!options.some(o => o.is_correct)) {
            options[0].is_correct = true;
          }
          // Make sure only one is correct
          if (options.filter(o => o.is_correct).length > 1) {
            for (let j = 1; j < options.length; j++) {
              options[j].is_correct = false;
            }
          }
        }
      }
    } else if (subject.name === 'Chemistry') {
      const chemistryQuestions = [
        'What is the chemical symbol for gold?',
        'Balance this equation: H₂ + O₂ → H₂O',
        'What is the pH of a neutral solution?',
        'What is the molecular formula of glucose?',
        'Which element has the atomic number 6?'
      ];
      questionText = chemistryQuestions[Math.floor(Math.random() * chemistryQuestions.length)];
      
      if (type.name === 'multiple-choice') {
        if (questionText.includes('chemical symbol for gold')) {
          options = [
            { text: 'Au', is_correct: true },
            { text: 'Ag', is_correct: false },
            { text: 'Fe', is_correct: false },
            { text: 'Cu', is_correct: false }
          ];
        } else if (questionText.includes('pH of a neutral solution')) {
          options = [
            { text: '7', is_correct: true },
            { text: '0', is_correct: false },
            { text: '14', is_correct: false },
            { text: '1', is_correct: false }
          ];
        } else {
          options = [
            { text: 'Option A', is_correct: Math.random() > 0.75 },
            { text: 'Option B', is_correct: Math.random() > 0.75 },
            { text: 'Option C', is_correct: Math.random() > 0.75 },
            { text: 'Option D', is_correct: true }
          ];
          // Ensure at least one correct answer
          if (!options.some(o => o.is_correct)) {
            options[0].is_correct = true;
          }
          // Make sure only one is correct
          if (options.filter(o => o.is_correct).length > 1) {
            for (let j = 1; j < options.length; j++) {
              options[j].is_correct = false;
            }
          }
        }
      }
    }
    
    // Create the question object
    questions.push({
      subject: {
        _id: subject._id,
        name: subject.name
      },
      exam: {
        _id: exam._id,
        name: exam.name
      },
      type: {
        _id: type._id,
        name: type.name
      },
      difficulty: {
        _id: difficulty._id,
        level: difficulty.level
      },
      text: questionText,
      options: type.name === 'multiple-choice' ? options : []
    });
  }
  
  return questions;
};

// Generate mock question sets
const generateMockSets = (users, questions, count = 5) => {
  const sets = [];
  
  for (let i = 0; i < count; i++) {
    // Pick a random user
    const user = users[Math.floor(Math.random() * users.length)];
    
    // Generate a name
    const names = [
      'Weekly Test', 'Practice Questions', 'Exam Prep', 
      'Revision Set', 'Important Questions', 'Mock Test',
      'Chapter Review', 'Quiz Set', 'Challenge Questions'
    ];
    const name = `${names[Math.floor(Math.random() * names.length)]} ${i + 1}`;
    
    // Pick random questions (5-10 per set)
    const questionCount = 5 + Math.floor(Math.random() * 6);
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, questionCount);
    
    // Create question references with order
    const questionRefs = selectedQuestions.map((question, idx) => ({
      question_id: question._id,
      order: idx + 1
    }));
    
    // Create the set
    sets.push({
      teacher_id: user.supabase_id,
      name,
      questions: questionRefs
    });
  }
  
  return sets;
};

// Function to generate and save mock data
const generateMockData = async () => {
  try {
    // Connect to MongoDB
    const connection = await connectDB();
    if (connection.error) {
      console.error('Failed to connect to MongoDB');
      process.exit(1);
    }
    
    console.log('Connected to MongoDB');
    
    // Get reference data
    const subjects = await Subject.find();
    const exams = await Exam.find();
    const types = await QuestionType.find();
    const difficulties = await Difficulty.find();
    
    if (!subjects.length || !exams.length || !types.length || !difficulties.length) {
      console.error('Reference data not found. Run npm run init-db first');
      await mongoose.disconnect();
      process.exit(1);
    }
    
    console.log('Retrieved reference data');
    
    // Clear existing mock data
    await Promise.all([
      User.deleteMany({ supabase_id: { $in: mockUsers.map(u => u.supabase_id) } }),
      Question.deleteMany({}),
      QuestionSet.deleteMany({})
    ]);
    
    console.log('Cleared existing mock data');
    
    // Create users with subject references
    const createdUsers = [];
    for (const userData of mockUsers) {
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
      const user = new User({
        ...userData,
        subject: {
          _id: randomSubject._id,
          name: randomSubject.name
        }
      });
      await user.save();
      createdUsers.push(user);
    }
    
    console.log(`Created ${createdUsers.length} mock users`);
    
    // Generate and save questions
    const mockQuestions = generateMockQuestions(subjects, exams, types, difficulties, 30);
    const createdQuestions = await Question.insertMany(mockQuestions);
    
    console.log(`Created ${createdQuestions.length} mock questions`);
    
    // Generate and save question sets
    const mockSets = generateMockSets(createdUsers, createdQuestions, 10);
    const createdSets = await QuestionSet.insertMany(mockSets);
    
    console.log(`Created ${createdSets.length} mock question sets`);
    
    // Summary
    console.log('\nMock Data Summary:');
    console.log(`- ${createdUsers.length} users`);
    console.log(`- ${createdQuestions.length} questions`);
    console.log(`- ${createdSets.length} question sets`);
    
    // Verification
    const userCount = await User.countDocuments();
    const questionCount = await Question.countDocuments();
    const setCount = await QuestionSet.countDocuments();
    
    console.log('\nTotal data in database:');
    console.log(`- ${userCount} users`);
    console.log(`- ${questionCount} questions`);
    console.log(`- ${setCount} question sets`);
    
    // Print example data for reference
    console.log('\nSample data for reference:');
    console.log('User:', createdUsers[0].email, '(ID:', createdUsers[0].supabase_id, ')');
    console.log('User has subject:', createdUsers[0].subject.name);
    
    const userSets = await QuestionSet.find({ teacher_id: createdUsers[0].supabase_id });
    console.log(`User has ${userSets.length} question sets`);
    
    if (userSets.length > 0) {
      console.log('First set name:', userSets[0].name);
      console.log('First set has', userSets[0].questions.length, 'questions');
    }
    
    // Disconnect
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    console.log('Mock data generation complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error generating mock data:', error);
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
};

// Run the script
generateMockData(); 