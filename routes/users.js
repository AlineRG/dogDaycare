var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
// Import bcrypt, a tool that helps keep passwords safe
// It turns passwords into scrambled code that's hard to unscramble
// This way, even if someone sees the scrambled version, they can't figure out the real password
var bcrypt = require('bcryptjs');

// GET /users/register
// Display the registration form
router.get('/register', function(req, res, next) {
  res.render('register');
});

// POST /users/register
// Handle user registration
router.post('/register', async function(req, res, next) {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.render('register', { message: 'Please enter all the fields' });
  }

  try {
    // Check if the username already exists in the database
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res.render('register', { message: 'Username already exists' });
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create a new user with the provided username and hashed password
    const newUser = new User({
      username: username,
      password: hashedPassword
    });

    // Save the new user to the database
    await newUser.save();
    
    // Redirect to the login page after successful registration
    res.redirect('/users/login');
  } catch (err) {
    // If there's an error, render the registration page with an error message
    res.render('register', { message: 'There was an error registering the user' });
  }
});

// GET /users/login
// Display the login form
router.get('/login', function(req, res, next) {
  res.render('login');
});

// POST /users/login
// Handle user login
router.post('/login', passport.authenticate('local', {
  successRedirect: '/home', // Redirect to home page on successful login
  failureRedirect: '/users/login', // Redirect back to login page on failed login
  failureFlash: true // Allow flash messages for failed login attempts
}));

// GET /users/logout
// Handle user logout
router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    // Redirect to the home page after successful logout
    res.redirect('/');
  });
});

module.exports = router;