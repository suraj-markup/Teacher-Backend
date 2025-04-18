const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection function
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB...');
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    // More descriptive error messages based on error code
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any MongoDB server. Please check:');
      console.error('1. Is MongoDB running on your machine?');
      console.error('2. Is the connection string correct in your .env file?');
      console.error('3. If using MongoDB Atlas, is your IP address whitelisted?');
    }
    
    if (error.message.includes('bad auth')) {
      console.error('Authentication failed. Please check your username and password in the connection string.');
    }
    
    // Don't crash the server, but return the error
    return { error };
  }
};

module.exports = connectDB; 