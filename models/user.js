var mongoose = require('mongoose');
var bcrypt = require('bcryptjs'); // Used for password encryption
var Schema = mongoose.Schema;

// Define user schema
var userSchema = new Schema({
  // Username field: must be provided, and must be unique across all users
  username: { type: String, required: true, unique: true },
  // Password field: must be provided (will be encrypted before saving)
  password: { type: String, required: true },
  // GitHub ID field: optional, used for OAuth authentication with GitHub
  githubId: { type: String }
});

// Pre-save hook: runs before saving the user to the database
userSchema.pre('save', function(next) {
  var user = this;
  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // Generate a salt
  // Create a unique "salt" for this password
  // A salt is like a secret ingredient that makes each scrambled password unique
  // The number 10 determines how complex the salt should be
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    // This part takes the user's password and makes it unreadable
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      // Override the plaintext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

// Method to compare a given password with the user's hashed password
userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

// Create and export the User model
module.exports = mongoose.model('User', userSchema);