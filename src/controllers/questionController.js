const Question = require('../models/Question');
const Subject = require('../models/Subject');
const Exam = require('../models/Exam');
const QuestionType = require('../models/QuestionType');
const Difficulty = require('../models/Difficulty');

// Get questions with filtering
const getQuestions = async (req, res) => {
  try {
    const { subject, exam, type, difficulty, search, page = 1, limit = 10, subject_name, exam_name, chapter, file_name } = req.query;
    
    const query = {};
    
    // Add filters if provided (support both ID and name-based filtering)
    if (subject) query['subject._id'] = subject;
    if (exam) query['exam._id'] = exam;
    if (type) query['type._id'] = type;
    if (difficulty) query['difficulty._id'] = difficulty;
    
    // Add name-based filters
    if (subject_name) query['subject_name'] = subject_name;
    if (exam_name) query['exam_name'] = exam_name;
    if (chapter) query['chapter'] = chapter;
    
    // Add file_name filter if provided
    if (file_name) query['file_name'] = file_name;
    
    // Add text search if provided (search in both text and question_text fields)
    if (search) {
      query.$or = [
        { text: { $regex: search, $options: 'i' } },
        { question_text: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get questions with pagination
    const questions = await Question.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const total = await Question.countDocuments(query);
    
    res.json({
      questions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new question
const createQuestion = async (req, res) => {
  try {
    // Check if we're receiving an array of questions
    if (Array.isArray(req.body)) {
      const questions = [];
      const errors = [];

      // Process each question in the array
      for (const questionData of req.body) {
        try {
          const {
            question_number,
            file_name,
            question_text,
            isQuestionImage,
            question_image,
            isOptionImage,
            options,
            option_images,
            section_name,
            question_type,
            topic,
            exam_name,
            subject,
            chapter,
            answer
          } = questionData;
          
          // Validate required fields
          if (!question_text) {
            errors.push(`Question ${question_number}: Question text is required`);
            continue;
          }
          
          // Create the question data object
          const newQuestionData = {
            question_number,
            file_name,
            question_text,
            isQuestionImage,
            question_image,
            isOptionImage,
            option_images,
            section_name,
            question_type,
            topic,
            exam_name,
            subject_name: subject, // Store subject name
            chapter,
            answer
          };
          
          // Process options if provided
          if (options && Array.isArray(options)) {
            // Convert string options to the required format
            const processedOptions = options.map((option, index) => {
              const isCorrect = answer === String.fromCharCode(65 + index); // A=0, B=1, etc.
              return {
                text: option,
                is_correct: isCorrect
              };
            });
            
            newQuestionData.options = processedOptions;
          }
          
          // Try to find and link to reference documents if possible
          try {
            if (subject) {
              const subjectDoc = await Subject.findOne({ name: { $regex: new RegExp(`^${subject}$`, 'i') } });
              if (subjectDoc) {
                newQuestionData.subject = {
                  _id: subjectDoc._id,
                  name: subjectDoc.name
                };
              }
            }
            
            if (exam_name) {
              const examDoc = await Exam.findOne({ name: { $regex: new RegExp(`^${exam_name}$`, 'i') } });
              if (examDoc) {
                newQuestionData.exam = {
                  _id: examDoc._id,
                  name: examDoc.name
                };
              }
            }
            
            if (question_type) {
              const typeDoc = await QuestionType.findOne({ name: { $regex: new RegExp(`^${question_type}$`, 'i') } });
              if (typeDoc) {
                newQuestionData.type = {
                  _id: typeDoc._id,
                  name: typeDoc.name
                };
              }
            }
          } catch (err) {
            console.error(`Error linking reference documents for question ${question_number}:`, err);
            // Continue without linking - this is not critical
          }
          
          const question = new Question(newQuestionData);
          await question.save();
          questions.push(question);
        } catch (err) {
          errors.push(`Error processing question ${questionData.question_number || 'unknown'}: ${err.message}`);
        }
      }
      
      return res.status(201).json({
        success: true,
        count: questions.length,
        questions,
        errors: errors.length > 0 ? errors : undefined
      });
    } else {
      // Check if we're using the new format or the old format
      const isNewFormat = req.body.question_text !== undefined;
      
      if (isNewFormat) {
        // Handle the new format
        const {
          question_number,
          file_name,
          question_text,
          isQuestionImage,
          question_image,
          isOptionImage,
          options,
          option_images,
          section_name,
          question_type,
          topic,
          exam_name,
          subject,
          chapter,
          answer
        } = req.body;
        
        // Validate required fields for new format
        if (!question_text) {
          return res.status(400).json({ message: 'Question text is required' });
        }
        
        // Create the question with the new format
        const questionData = {
          question_number,
          file_name,
          question_text,
          isQuestionImage,
          question_image,
          isOptionImage,
          option_images,
          section_name,
          question_type,
          topic,
          exam_name,
          subject_name: subject, // Store subject name
          chapter,
          answer
        };
        
        // Process options if provided
        if (options && Array.isArray(options)) {
          // Convert string options to the required format
          const processedOptions = options.map((option, index) => {
            const isCorrect = answer === String.fromCharCode(65 + index); // A=0, B=1, etc.
            return {
              text: option,
              is_correct: isCorrect
            };
          });
          
          questionData.options = processedOptions;
        }
        
        // Try to find and link to reference documents if possible
        try {
          if (subject) {
            const subjectDoc = await Subject.findOne({ name: { $regex: new RegExp(`^${subject}$`, 'i') } });
            if (subjectDoc) {
              questionData.subject = {
                _id: subjectDoc._id,
                name: subjectDoc.name
              };
            }
          }
          
          if (exam_name) {
            const examDoc = await Exam.findOne({ name: { $regex: new RegExp(`^${exam_name}$`, 'i') } });
            if (examDoc) {
              questionData.exam = {
                _id: examDoc._id,
                name: examDoc.name
              };
            }
          }
          
          if (question_type) {
            const typeDoc = await QuestionType.findOne({ name: { $regex: new RegExp(`^${question_type}$`, 'i') } });
            if (typeDoc) {
              questionData.type = {
                _id: typeDoc._id,
                name: typeDoc.name
              };
            }
          }
        } catch (err) {
          console.error('Error linking reference documents:', err);
          // Continue without linking - this is not critical
        }
        
        const question = new Question(questionData);
        await question.save();
        
        res.status(201).json(question);
      } else {
        // Handle the old format
        const { subject, exam, type, difficulty, text, image_path, options } = req.body;
        
        // Validate required fields
        if (!subject || !exam || !type || !difficulty || !text) {
          return res.status(400).json({ 
            message: 'Subject, exam, type, difficulty, and text are required' 
          });
        }
        
        // Fetch reference documents to get their names
        const subjectDoc = await Subject.findById(subject);
        const examDoc = await Exam.findById(exam);
        const typeDoc = await QuestionType.findById(type);
        const difficultyDoc = await Difficulty.findById(difficulty);
        
        if (!subjectDoc || !examDoc || !typeDoc || !difficultyDoc) {
          return res.status(404).json({ message: 'One or more references not found' });
        }
        
        // Create the question with embedded reference data
        const questionData = {
          subject: {
            _id: subjectDoc._id,
            name: subjectDoc.name
          },
          exam: {
            _id: examDoc._id,
            name: examDoc.name
          },
          type: {
            _id: typeDoc._id,
            name: typeDoc.name
          },
          difficulty: {
            _id: difficultyDoc._id,
            level: difficultyDoc.level
          },
          text,
          options: options || []
        };
        
        // Add image path if provided
        if (image_path) {
          questionData.image_path = image_path;
        }
        
        const question = new Question(questionData);
        await question.save();
        
        res.status(201).json(question);
      }
    }
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a question
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the question
    const question = await Question.findById(id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // Check if we're using the new format or the old format
    const isNewFormat = req.body.question_text !== undefined;
    
    if (isNewFormat) {
      // Handle the new format
      const {
        question_number,
        file_name,
        question_text,
        isQuestionImage,
        question_image,
        isOptionImage,
        options,
        option_images,
        section_name,
        question_type,
        topic,
        exam_name,
        subject,
        chapter,
        answer
      } = req.body;
      
      // Update fields if provided
      const updates = {};
      
      if (question_number !== undefined) updates.question_number = question_number;
      if (file_name !== undefined) updates.file_name = file_name;
      if (question_text !== undefined) updates.question_text = question_text;
      if (isQuestionImage !== undefined) updates.isQuestionImage = isQuestionImage;
      if (question_image !== undefined) updates.question_image = question_image;
      if (isOptionImage !== undefined) updates.isOptionImage = isOptionImage;
      if (option_images !== undefined) updates.option_images = option_images;
      if (section_name !== undefined) updates.section_name = section_name;
      if (question_type !== undefined) updates.question_type = question_type;
      if (topic !== undefined) updates.topic = topic;
      if (exam_name !== undefined) updates.exam_name = exam_name;
      if (subject !== undefined) updates.subject_name = subject;
      if (chapter !== undefined) updates.chapter = chapter;
      if (answer !== undefined) updates.answer = answer;
      
      // Process options if provided
      if (options && Array.isArray(options)) {
        // Convert string options to the required format
        const processedOptions = options.map((option, index) => {
          const isCorrect = answer === String.fromCharCode(65 + index); // A=0, B=1, etc.
          return {
            text: option,
            is_correct: isCorrect
          };
        });
        
        updates.options = processedOptions;
      }
      
      // Try to find and link to reference documents if possible
      try {
        if (subject) {
          const subjectDoc = await Subject.findOne({ name: { $regex: new RegExp(`^${subject}$`, 'i') } });
          if (subjectDoc) {
            updates.subject = {
              _id: subjectDoc._id,
              name: subjectDoc.name
            };
          }
        }
        
        if (exam_name) {
          const examDoc = await Exam.findOne({ name: { $regex: new RegExp(`^${exam_name}$`, 'i') } });
          if (examDoc) {
            updates.exam = {
              _id: examDoc._id,
              name: examDoc.name
            };
          }
        }
        
        if (question_type) {
          const typeDoc = await QuestionType.findOne({ name: { $regex: new RegExp(`^${question_type}$`, 'i') } });
          if (typeDoc) {
            updates.type = {
              _id: typeDoc._id,
              name: typeDoc.name
            };
          }
        }
      } catch (err) {
        console.error('Error linking reference documents:', err);
        // Continue without linking - this is not critical
      }
      
      // Update the question
      const updatedQuestion = await Question.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
      );
      
      res.json(updatedQuestion);
    } else {
      // Handle the old format
      const { subject, exam, type, difficulty, text, image_path, options } = req.body;
      
      // Update fields if provided
      const updates = {};
      
      if (subject) {
        const subjectDoc = await Subject.findById(subject);
        if (!subjectDoc) {
          return res.status(404).json({ message: 'Subject not found' });
        }
        updates.subject = {
          _id: subjectDoc._id,
          name: subjectDoc.name
        };
      }
      
      if (exam) {
        const examDoc = await Exam.findById(exam);
        if (!examDoc) {
          return res.status(404).json({ message: 'Exam not found' });
        }
        updates.exam = {
          _id: examDoc._id,
          name: examDoc.name
        };
      }
      
      if (type) {
        const typeDoc = await QuestionType.findById(type);
        if (!typeDoc) {
          return res.status(404).json({ message: 'Question type not found' });
        }
        updates.type = {
          _id: typeDoc._id,
          name: typeDoc.name
        };
      }
      
      if (difficulty) {
        const difficultyDoc = await Difficulty.findById(difficulty);
        if (!difficultyDoc) {
          return res.status(404).json({ message: 'Difficulty not found' });
        }
        updates.difficulty = {
          _id: difficultyDoc._id,
          level: difficultyDoc.level
        };
      }
      
      if (text) updates.text = text;
      if (image_path !== undefined) updates.image_path = image_path;
      if (options) updates.options = options;
      
      // Update the question
      const updatedQuestion = await Question.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
      );
      
      res.json(updatedQuestion);
    }
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a question
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and delete the question
    const question = await Question.findByIdAndDelete(id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // TODO: Also remove this question from any question sets that reference it
    
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
};