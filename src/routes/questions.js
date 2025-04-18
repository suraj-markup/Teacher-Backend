const express = require('express');
const router = express.Router();
const { getQuestions, createQuestion, updateQuestion, deleteQuestion } = require('../controllers/questionController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes

// Get questions with filtering
router.get('/', getQuestions);

router.use(authMiddleware);
// Create a new question
router.post('/', createQuestion);

// Update a question
router.put('/:id', updateQuestion);

// Delete a question
router.delete('/:id', deleteQuestion);

module.exports = router; 