// Import passport and session modules
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// Import user model
var User = require('./models/user');

// Configure the local strategy for use by Passport.
// The local strategy requires a `verify` function which receives the credentials
// (username and password) submitted by the user.  The function must verify
// that the password is correct and then invoke `done` with a user object, which
// will be set at `req.user` in route handlers after authentication.
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
  // Configure Passport authenticated session persistence.
  // Serialize user instance to the session
  passport.serializeUser(function(user, done) {
    done(null, user.id); // Only save the user id in the session
  });
  // Deserialize user instance from the session
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user); // Find user by id and return user object
    });
  });