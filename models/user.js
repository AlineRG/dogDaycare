var mongoose = require('mongoose');
var bcrypt = require('bcryptjs'); // Encrypte password
var Schema = mongoose.Schema;

// Define user schema
var userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

