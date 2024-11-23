var express = require('express');
var router = express.Router();
var User = require('../models/user');  // Import user model
var passport = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// Route to log in 
router.post('/login', passport.authenticate('local', {
  successRedirect: '/home',   //Succesful login
  failureRedirect: '/users/login',  // Fail login
}));

module.exports = router;
