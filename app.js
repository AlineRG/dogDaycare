require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var User = require('./models/user');
var LocalStrategy = require('passport-local').Strategy;
var GitHubStrategy = require('passport-github2').Strategy;
var { engine } = require('express-handlebars');
var Handlebars = require('handlebars');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var configurations = require('./configs/globals');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var petsRouter = require('./routes/pets');
var reservationsRouter = require('./routes/reservations');
var authRouter = require('./routes/auth');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', engine({
  extname: '.hbs',
  handlebars: Handlebars,
  defaultLayout: false,
  helpers: {
    eq: function (a, b) {  
      return a === b;
    },
    json: function(context) {
      return JSON.stringify(context, null, 2);
    },
    formatDate: function(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
}));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your secret here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Flash messages
app.use(flash());

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username: username, authType: 'local' });
    if (!user) {
      return done(null, false, { message: 'Incorrect username' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect password' });
    }
    
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Passport GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: configurations.Authentication.GitHub.ClientId,
  clientSecret: configurations.Authentication.GitHub.ClientSecret,
  callbackURL: configurations.Authentication.GitHub.CallbackURL
},
async function(accessToken, refreshToken, profile, done) {
  try {
    let user = await User.findOne({ githubId: profile.id });
    if (user) {
      return done(null, user);
    }
    
    // Create new user with GitHub profile
    user = new User({
      username: profile.username,
      githubId: profile.id,
      authType: 'github'
    });
    
    await user.save();
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Make user available to all routes
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/pets', isAuthenticated, petsRouter);
app.use('/reservations', isAuthenticated, reservationsRouter);

// Login and register routes
app.get('/login', (req, res) => {
  res.render('login', { message: req.flash('error') });
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  try {
    const user = await User.create({ 
      username: req.body.username, 
      password: req.body.password,
      authType: 'local'
    });
    req.login(user, (err) => {
      if (err) {
        return res.send('Error logging in after registration: ' + err);
      }
      return res.redirect('/home');
    });
  } catch (err) {
    res.send('Error registering user: ' + err);
  }
});

// GitHub auth routes
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/home');
  }
);

app.get('/home', isAuthenticated, (req, res) => {
  res.render('home', { title: 'Home', user: req.user });
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// MongoDB connection
mongoose.connect(configurations.ConnectionStrings.MongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

module.exports = app;
