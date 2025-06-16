// config/db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv')

dotenv.config();


const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('MongoDB URI not configured - running without database');
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);

    
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('Continuing without database connection...');
  }
};

module.exports = {
  connectDB,
  url : process.env.MONGODB_URI
};
