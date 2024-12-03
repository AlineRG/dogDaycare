var express = require('express');
var router = express.Router();
var passport = require('passport');

// GitHub authentication route
router.get('/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }));

// GitHub authentication callback route
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/home');
  });

module.exports = router;
