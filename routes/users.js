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
