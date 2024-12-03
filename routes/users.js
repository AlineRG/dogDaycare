var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var bcrypt = require('bcryptjs');

// Route to user model
router.get('/register', function(req, res, next) {
  res.render('register');
});

// Route for user registration
router.post('/register', async function(req, res, next) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render('register', { message: 'Please enter all the fields' });
  }

  // Create a new user
  var newUser = new User({
    username: username,
    password: password
  });

  // Save user 
  newUser.save(function(err) {
    if (err) {
      return res.render('register', { message: 'There was an error registering the user' });
    }
    res.redirect('/users/login');  // Redirect to login after registering
  });
});

// Route to show log in form
router.get('/login', function(req, res, next) {
  res.render('login');
});

// Route to log in 
router.post('/login', passport.authenticate('local', {
  successRedirect: '/home',   //Succesful login
  failureRedirect: '/users/login',  // Fail login
}));

module.exports = router;
