var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var bcrypt = require('bcryptjs');

// Route to show registration form
router.get('/register', function(req, res, next) {
  res.render('register');
});

// Route for user registration
router.post('/register', async function(req, res, next) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render('register', { message: 'Please enter all the fields' });
  }

  try {
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res.render('register', { message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: username,
      password: hashedPassword
    });

    await newUser.save();
    res.redirect('/users/login');
  } catch (err) {
    res.render('register', { message: 'There was an error registering the user' });
  }
});

// Route to show login form
router.get('/login', function(req, res, next) {
  res.render('login');
});

// Route for user login
router.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/users/login',
  failureFlash: true
}));

// Route for user logout
router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;