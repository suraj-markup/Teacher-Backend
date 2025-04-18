const express = require('express');
const router = express.Router();
const { 
  getSets, 
  getSetById, 
  createSet, 
  updateSet, 
  addQuestionsToSet,
  removeQuestionFromSet,
  downloadSet
} = require('../controllers/questionSetController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all sets for the current user
router.get('/', getSets);

// Get a specific set with its questions
router.get('/:id', getSetById);

// Create a new set
router.post('/', createSet);

// Update a set
router.put('/:id', updateSet);

// Add questions to a set
router.post('/:id/questions', addQuestionsToSet);

// Remove a question from a set
router.delete('/:id/questions/:questionId', removeQuestionFromSet);

// Generate a downloadable version of a set
router.get('/:id/download', downloadSet);

module.exports = router; 