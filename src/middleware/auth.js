const jwt = require('jsonwebtoken');
const User = require('../models/User');
const supabase = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Authorization token required',
        code: 'TOKEN_MISSING'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('Supabase auth error:', error);
      // Send more specific error for frontend handling
      return res.status(401).json({ 
        message: 'Invalid authentication token', 
        code: 'TOKEN_INVALID',
        details: error.message
      });
    }

    const user = data.user;
    if (!user) {
      return res.status(401).json({ 
        message: 'User not found in token',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if the user exists in our MongoDB
    let dbUser = await User.findOne({ supabase_id: user.id });

    // Add user information to the request
    req.user = {
      id: user.id,
      email: user.email,
      dbUser, // This might be null if the user doesn't have a profile yet
      userNeedsProfile: !dbUser
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Authentication failed',
      code: 'AUTH_ERROR',
      details: error.message
    });
  }
};

module.exports = authMiddleware; 