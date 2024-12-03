var mongoose = require('mongoose');
var bcrypt = require('bcryptjs'); // Encrypte password
var Schema = mongoose.Schema;

// Define user schema
var userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  githubId: { type: String }
});

// Encripte password
userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// Compare password it has to be unique
userSchema.methods.comparePassword = function(password, cb) {
    bcrypt.compare(password, this.password, cb);
  };

// Create the user model
var User = mongoose.model('User', userSchema);

module.exports = User;
