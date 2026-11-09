// src/config/db.js
import mongoose from 'mongoose';
import config from './env.js';
import logger from '../utils/logger.js';

export async function connectDB() {
  try {
    // Falls back to direct process.env if your config wrapper didn't map the key correctly
    const dbUri = config.mongoUri || process.env.MONGODB_URI;

    await mongoose.connect(dbUri, {
      autoIndex: config.env === 'development',
    });

    logger.info({ env: config.env }, 'MongoDB connected');
  } catch (err) {
    logger.error({ err }, 'MongoDB connection error');
    process.exit(1);
  }
}
