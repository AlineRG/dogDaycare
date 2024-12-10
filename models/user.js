var mongoose = require('mongoose');
var bcrypt = require('bcryptjs'); // Used for password encryption

// Define user schema
var userSchema = new mongoose.Schema({
  // Username field: must be provided, and must be unique across all users
  username: { type: String, required: true, unique: true },
  // Password field: must be provided (will be encrypted before saving)
  password: {
    type: String,
    required: function() {
      return this.authType === 'local';
    }
  },
  // GitHub ID field: optional, used for OAuth authentication with GitHub
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export the User model
module.exports = mongoose.model('User', userSchema);