const mongoose = require('mongoose');
require('dotenv').config();

const checkMongoDBConnection = async () => {
  console.log('Checking MongoDB connection...');
  console.log(`Connection string: ${maskConnectionString(process.env.MONGODB_URI)}`);
  
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
    });
    
    console.log('\n✅ MongoDB Connection Success!');
    console.log(`Connected to: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);
    
    // Get list of collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:');
    if (collections.length === 0) {
      console.log('- No collections found. Run "npm run init-db" to initialize the database.');
    } else {
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
    return true;
  } catch (error) {
    console.error('\n❌ MongoDB Connection Failed!');
    console.error(`Error: ${error.message}`);
    
    // More specific error messages for common issues
    if (error.name === 'MongoServerSelectionError') {
      console.error('\nTroubleshooting tips:');
      console.error('1. Check if your MongoDB server is running');
      console.error('2. Verify your connection string is correct');
      console.error('3. If using Atlas, make sure your IP address is whitelisted');
      console.error('4. Check if any firewall is blocking the connection');
    }
    
    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error('\nAuthentication error:');
      console.error('- Double-check your username and password in the connection string');
      console.error('- Make sure the user has the correct database permissions');
    }
    
    return false;
  }
};

// Helper function to mask sensitive parts of the connection string
function maskConnectionString(uri) {
  if (!uri) return 'Not configured';
  
  try {
    // Replace password with asterisks if present
    return uri.replace(/:([^@]+)@/, ':********@');
  } catch (err) {
    return 'Invalid connection string format';
  }
}

// Run the check
checkMongoDBConnection(); 