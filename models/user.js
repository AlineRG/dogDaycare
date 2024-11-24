var mongoose = require('mongoose');
var bcrypt = require('bcryptjs'); // Encrypte password
var Schema = mongoose.Schema;

// Define user schema
var userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Encripte password
userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next();

  bcrypt.hash(user.password, 10, function(err, hashedPassword) {
    if (err) return next(err);
    user.password = hashedPassword;
    next();
  });
});

// Compare password it has to be unique
userSchema.methods.comparePassword = function(password, cb) {
    bcrypt.compare(password, this.password, cb);
  };

// Create the user model
var User = mongoose.model('User', userSchema);

module.exports = User;
