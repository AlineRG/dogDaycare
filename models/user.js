const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const debug = require('debug')('dogdaycare:user-model');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: function() {
      return this.authType === 'local';
    }
  },
  githubId: {
    type: String,
    sparse: true,
    unique: true,
    index: true
  },
  authType: {
    type: String,
    required: true,
    enum: ['local', 'github'],
    default: 'local'
  }
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
      debug(`Error hashing password: ${error}`);
      return next(error);
    }
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    debug(`Comparing passwords for user: ${this.username}`);
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    debug(`Password match result: ${isMatch}`);
    return isMatch;
  } catch (error) {
    debug(`Error comparing passwords: ${error}`);
    throw error;
  }
};

userSchema.methods.setPassword = async function(password) {
  debug(`Setting password for user: ${this.username}`);
  try {
    this.password = await bcrypt.hash(password, 10);
  } catch (error) {
    debug(`Error setting password: ${error}`);
    throw error;
  }
};

userSchema.statics.findByUsername = async function(username) {
  debug(`Finding user by username: ${username}`);
  try {
    return await this.findOne({ username: username.toLowerCase() });
  } catch (error) {
    debug(`Error finding user by username: ${error}`);
    throw error;
  }
};

const User = mongoose.model('User', userSchema);
module.exports = User;









