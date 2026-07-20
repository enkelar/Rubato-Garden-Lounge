import mongoose from 'mongoose';
import logger from './utils/logger.js';

export default async function connectDB(options = {}) {
  const connectionString = options.connectionString || process.env.DB_URI || process.env.DB_URL;
  
  if (!connectionString) {
    const error = new Error('Database connection string is missing.');
    console.error(error.message);
    throw error;
  }

  try {
    await mongoose.connect(connectionString, {
       maxPoolSize: 20,
       serverSelectionTimeoutMS: 5000,
      ...options.mongooseOptions
    });
    logger.info('Connected to MongoDB successfully');
    return mongoose.connection;
  } catch (error) {
    logger.error({ err: error }, 'Error connecting to MongoDB');

    throw error; 
  }
};