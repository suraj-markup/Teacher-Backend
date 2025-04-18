const User = require('../models/User');
const Subject = require('../models/Subject');
const mongoose = require('mongoose');

// Get the current user's profile
const getUserProfile = async (req, res) => {
  try {
    if (!req.user.dbUser) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(req.user.dbUser);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create or update the user's profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, institute, subject, place } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    // If subject is provided, validate it
    let subjectData = null;
    if (subject) {
      let subjectDoc;
      
      // Check if subject is a valid ObjectId
      const isValidObjectId = mongoose.Types.ObjectId.isValid(subject);
      
      if (isValidObjectId) {
        // If it's a valid ObjectId, search by _id
        subjectDoc = await Subject.findById(subject);
      } else {
        // If it's not a valid ObjectId, assume it's a subject name
        subjectDoc = await Subject.findOne({ name: subject });
      }
      
      if (!subjectDoc) {
        // If subject doesn't exist yet, create it
        try {
          // Only create if it's a string (name)
          if (!isValidObjectId) {
            subjectDoc = new Subject({ name: subject });
            await subjectDoc.save();
            console.log(`Created new subject: ${subject}`);
          } else {
            return res.status(404).json({ message: 'Subject not found' });
          }
        } catch (err) {
          console.error('Error creating subject:', err);
          return res.status(400).json({ message: 'Invalid subject name' });
        }
      }
      
      subjectData = {
        _id: subjectDoc._id,
        name: subjectDoc.name
      };
    }
    
    // Update or create user profile
    const userData = {
      supabase_id: req.user.id,
      email: req.user.email,
      name,
      institute,
      place
    };
    
    if (subjectData) {
      userData.subject = subjectData;
    }
    
    let user;
    
    if (req.user.dbUser) {
      // Update existing user
      user = await User.findByIdAndUpdate(
        req.user.dbUser._id,
        { $set: userData },
        { new: true }
      );
    } else {
      // Create new user
      user = new User(userData);
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user profile is complete
const checkUserProfile = async (req, res) => {
  try {
    // Check if user exists in our database
    if (!req.user.dbUser) {
      return res.json({ 
        complete: false,
        message: 'Profile not found' 
      });
    }
    
    // Check if all required fields are present
    const { name, subject } = req.user.dbUser;
    const isComplete = name && subject;
    
    res.json({
      complete: !!isComplete,
      user: req.user.dbUser
    });
  } catch (error) {
    console.error('Error checking user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  checkUserProfile
}; 