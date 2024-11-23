// Import passport and session modules
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// Import user model
var User = require('./models/user');

// Config authentication
passport.use(new LocalStrategy(
    function(username, password, done) {
      User.findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Incorrect username.' }); }
        if (user.password !== password) { return done(null, false, { message: 'Incorrect password.' }); }
        return done(null, user);
      });
    }
  ));
  
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });