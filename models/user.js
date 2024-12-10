var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var debug = require('debug')('dogdaycare:user-model');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
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
    unique: true
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
    debug(`Hashing password for user: ${this.username}`);
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  debug(`Comparing password for user: ${this.username}`);
  if (!this.password) {
    debug('No password set for user');
    return false;
  }
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  debug(`Password match result: ${isMatch}`);
  return isMatch;
};

module.exports = mongoose.model('User', userSchema);


