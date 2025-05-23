const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
require('dotenv').config();

// Import routes
const userRoutes = require('./src/routes/users');
const questionRoutes = require('./src/routes/questions');
const setRoutes = require('./src/routes/sets');

// Initialize Express
const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:8080', 'http://localhost:5173'
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Default route
app.get('/', (req, res) => {
  res.send('Teacher API is running...');
});

// Setup server and connect to MongoDB
const startServer = async () => {
  try {
    // Connect to MongoDB
    const connection = await connectDB();
    
    // If there was a connection error, we can still start the server
    // but we won't add the API routes that require MongoDB
    if (!connection.error) {
      // Routes that require MongoDB
      app.use('/api/users', userRoutes);
      app.use('/api/questions', questionRoutes);
      app.use('/api/sets', setRoutes);
      
      console.log('API routes initialized with MongoDB connection');
    } else {
      // Add a message for API routes that they're unavailable
      app.use('/api/users', (req, res) => {
        res.status(503).json({ message: 'Database connection unavailable' });
      });
      app.use('/api/questions', (req, res) => {
        res.status(503).json({ message: 'Database connection unavailable' });
      });
      app.use('/api/sets', (req, res) => {
        res.status(503).json({ message: 'Database connection unavailable' });
      });
      
      console.log('API routes initialized in limited mode (no MongoDB connection)');
    }
    
    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send('Something broke!');
    });
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer(); 
