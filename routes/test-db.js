const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const debug = require('debug')('dogdaycare:test-db');

router.get('/', async (req, res) => {
  const timeoutDuration = 5000; // 5 seconds timeout
  let isConnected = false;

  try {
    // Set a timeout for the connection attempt
    const connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: timeoutDuration,
      socketTimeoutMS: timeoutDuration,
      connectTimeoutMS: timeoutDuration,
      maxPoolSize: 1
    });

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Connection attempt timed out'));
      }, timeoutDuration);
    });

    // Race between connection and timeout
    await Promise.race([connectionPromise, timeoutPromise]);
    
    // Quick ping to verify connection
    await mongoose.connection.db.admin().ping();
    isConnected = true;

    debug('Database connection successful');
    res.status(200).json({ 
      status: 'success',
      message: 'Database connection successful',
      connectionString: process.env.MONGODB_URI ? 'URI is set' : 'URI is missing',
      mongooseState: mongoose.connection.readyState
    });
  } catch (error) {
    debug('Database connection error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      connectionString: process.env.MONGODB_URI ? 'URI is set' : 'URI is missing',
      mongooseState: mongoose.connection.readyState
    });
  } finally {
    if (isConnected) {
      try {
        await mongoose.disconnect();
        debug('Disconnected from database');
      } catch (error) {
        debug('Error disconnecting from database:', error);
      }
    }
  }
});

module.exports = router;

