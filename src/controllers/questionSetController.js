const QuestionSet = require('../models/QuestionSet');
const Question = require('../models/Question');

// Get all sets for the current user
const getSets = async (req, res) => {
  try {
    const sets = await QuestionSet.find({ teacher_id: req.user.id })
      .sort({ created_at: -1 });
    
    res.json(sets);
  } catch (error) {
    console.error('Error fetching question sets:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific set with its questions
const getSetById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the set
    const set = await QuestionSet.findById(id);
    
    if (!set) {
      return res.status(404).json({ message: 'Question set not found' });
    }
    
    // Check if the set belongs to the user
    if (set.teacher_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this set' });
    }
    
    // Get the questions in the set
    const questionIds = set.questions.map(q => q.question_id);
    const questions = await Question.find({ _id: { $in: questionIds } });
    
    // Map questions to include order
    const questionsWithOrder = questions.map(question => {
      const setQuestion = set.questions.find(q => q.question_id.toString() === question._id.toString());
      return {
        ...question.toObject(),
        order: setQuestion ? setQuestion.order : null
      };
    });
    
    // Sort by order if present
    questionsWithOrder.sort((a, b) => {
      if (a.order === null && b.order === null) return 0;
      if (a.order === null) return 1;
      if (b.order === null) return -1;
      return a.order - b.order;
    });
    
    res.json({
      ...set.toObject(),
      questions: questionsWithOrder
    });
  } catch (error) {
    console.error('Error fetching question set:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new set
const createSet = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const set = new QuestionSet({
      teacher_id: req.user.id,
      name,
      questions: []
    });
    
    await set.save();
    
    res.status(201).json(set);
  } catch (error) {
    console.error('Error creating question set:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a set
const updateSet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    // Find the set
    const set = await QuestionSet.findById(id);
    
    if (!set) {
      return res.status(404).json({ message: 'Question set not found' });
    }
    
    // Check if the set belongs to the user
    if (set.teacher_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this set' });
    }
    
    // Update the set
    set.name = name;
    await set.save();
    
    res.json(set);
  } catch (error) {
    console.error('Error updating question set:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add questions to a set
const addQuestionsToSet = async (req, res) => {
  try {
    const { id } = req.params;
    const { questions } = req.body;
    
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: 'Questions array is required' });
    }
    
    // Find the set
    const set = await QuestionSet.findById(id);
    
    if (!set) {
      return res.status(404).json({ message: 'Question set not found' });
    }
    
    // Check if the set belongs to the user
    if (set.teacher_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this set' });
    }
    
    // Validate all question IDs
    const questionIds = questions.map(q => q.question_id);
    const existingQuestions = await Question.find({ _id: { $in: questionIds } });
    
    if (existingQuestions.length !== questionIds.length) {
      return res.status(404).json({ message: 'One or more questions not found' });
    }
    
    // Add questions to the set (avoid duplicates)
    const existingIds = set.questions.map(q => q.question_id.toString());
    
    for (const question of questions) {
      if (!existingIds.includes(question.question_id.toString())) {
        set.questions.push({
          question_id: question.question_id,
          order: question.order || null
        });
      }
    }
    
    await set.save();
    
    res.json(set);
  } catch (error) {
    console.error('Error adding questions to set:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove a question from a set
const removeQuestionFromSet = async (req, res) => {
  try {
    const { id, questionId } = req.params;
    
    // Find the set
    const set = await QuestionSet.findById(id);
    
    if (!set) {
      return res.status(404).json({ message: 'Question set not found' });
    }
    
    // Check if the set belongs to the user
    if (set.teacher_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this set' });
    }
    
    // Remove the question from the set
    set.questions = set.questions.filter(q => q.question_id.toString() !== questionId);
    
    await set.save();
    
    res.json(set);
  } catch (error) {
    console.error('Error removing question from set:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate a downloadable version of a set
const downloadSet = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the set
    const set = await QuestionSet.findById(id);
    
    if (!set) {
      return res.status(404).json({ message: 'Question set not found' });
    }
    
    // Check if the set belongs to the user
    if (set.teacher_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this set' });
    }
    
    // Get the questions in the set
    const questionIds = set.questions.map(q => q.question_id);
    const questions = await Question.find({ _id: { $in: questionIds } });
    
    // Map questions to include order
    const questionsWithOrder = questions.map(question => {
      const setQuestion = set.questions.find(q => q.question_id.toString() === question._id.toString());
      return {
        ...question.toObject(),
        order: setQuestion ? setQuestion.order : null
      };
    });
    
    // Sort by order if present
    questionsWithOrder.sort((a, b) => {
      if (a.order === null && b.order === null) return 0;
      if (a.order === null) return 1;
      if (b.order === null) return -1;
      return a.order - b.order;
    });
    
    // Create a downloadable format (for now, just JSON)
    const downloadData = {
      name: set.name,
      created_at: set.created_at,
      questions: questionsWithOrder
    };
    
    res.json(downloadData);
    
    // TODO: Implement actual PDF or document generation
  } catch (error) {
    console.error('Error generating downloadable set:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSets,
  getSetById,
  createSet,
  updateSet,
  addQuestionsToSet,
  removeQuestionFromSet,
  downloadSet
}; 