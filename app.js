require('dotenv').config();
var debug = require('debug')('dogdaycare:server');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var User = require('./models/user');
var LocalStrategy = require('passport-local').Strategy;
var GitHubStrategy = require('passport-github2').Strategy;
var exphbs = require('express-handlebars');
var Handlebars = require('handlebars');
var cookieSession = require('cookie-session');
var passport = require('passport');
var flash = require('connect-flash');
var configurations = require('./configs/globals');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var petsRouter = require('./routes/pets');
var reservationsRouter = require('./routes/reservations');
var authRouter = require('./routes/auth');
var testDbRouter = require('./routes/test-db');

var app = express();

// MongoDB connection function
async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  
  try {
    var conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      maxPoolSize: 10,
      minPoolSize: 0,
      maxIdleTimeMS: 10000,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB connected successfully');
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', exphbs.engine({
  extname: '.hbs',
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

app.set('trust proxy', 1);

// Make sure to call this function before setting up the session
connectToDatabase().then(() => {
  // Session configuration
  app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET],
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }));

  app.use((req, res, next) => {
    if (!req.session) {
      return next(new Error('Session initialization failed'));
    }
    next();
  });

  // Flash messages
  app.use(flash());

  // Passport initialization
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport Local Strategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      debug(`Attempting to authenticate user: ${username}`);
      var user = await User.findOne({ username: username.toLowerCase() });
      if (!user) {
        debug(`User not found: ${username}`);
        return done(null, false, { message: 'Incorrect username or password' });
      }
      
      var isMatch = await user.comparePassword(password);
      if (!isMatch) {
        debug(`Incorrect password for user: ${username}`);
        return done(null, false, { message: 'Incorrect username or password' });
      }
      
      debug(`User authenticated successfully: ${username}`);
      return done(null, user);
    } catch (err) {
      debug(`Error in authentication: ${err}`);
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
      var user = await User.findOne({ githubId: profile.id });
      if (user) {
        return done(null, user);
      }
      
      // Create new user with GitHub profile
      user = new User({
        username: profile.username.toLowerCase(),
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
      var user = await User.findById(id);
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

  // Connect to database before handling routes
  app.use(async (req, res, next) => {
    try {
      await connectToDatabase();
      next();
    } catch (error) {
      next(error);
    }
  });

  // Routes
  app.use('/', indexRouter);
  app.use('/users', usersRouter);
  app.use('/auth', authRouter);
  app.use('/pets', isAuthenticated, petsRouter);
  app.use('/reservations', isAuthenticated, reservationsRouter);
  app.use('/test-db', testDbRouter);

  // Login routes
  app.get('/login', (req, res) => {
    debug('GET /login route hit');
    res.render('login', { title: 'Login', message: req.flash('error') });
  });

  app.post('/login', (req, res, next) => {
    debug('POST /login route hit');
    debug(`Login attempt for username: ${req.body.username}`);
    passport.authenticate('local', (err, user, info) => {
      if (err) { 
        debug(`Login error: ${err}`);
        return next(err); 
      }
      if (!user) { 
        debug(`Login failed: ${info.message}`);
        req.flash('error', info.message);
        return res.redirect('/login'); 
      }
      req.logIn(user, (err) => {
        if (err) { 
          debug(`Login error: ${err}`);
          return next(err); 
        }
        debug(`User logged in successfully: ${user.username}`);
        return res.redirect('/home');
      });
    })(req, res, next);
  });

  // Register routes
  app.get('/register', (req, res) => {
    debug('GET /register route hit');
    res.render('register', { title: 'Register', message: req.flash('error') });
  });

  app.post('/register', async (req, res) => {
    debug('POST /register route hit');
    try {
      var { username, password } = req.body;
      var lowercaseUsername = username.toLowerCase();
      debug(`Attempting to register user: ${lowercaseUsername}`);
      var existingUser = await User.findOne({ username: lowercaseUsername });
      if (existingUser) {
        debug(`Username already exists: ${lowercaseUsername}`);
        req.flash('error', 'Username already exists');
        return res.redirect('/register');
      }
      var user = new User({ username: lowercaseUsername, authType: 'local' });
      await user.setPassword(password);
      await user.save();
      debug(`User registered successfully: ${lowercaseUsername}`);
      req.login(user, (err) => {
        if (err) {
          debug(`Error logging in after registration: ${err}`);
          req.flash('error', 'Error logging in after registration');
          return res.redirect('/login');
        }
        return res.redirect('/home');
      });
    } catch (err) {
      debug(`Registration error: ${err}`);
      req.flash('error', 'Error registering user');
      res.redirect('/register');
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

  // Test routes
  app.get('/test-db', async (req, res) => {
    try {
      await mongoose.connection.db.admin().ping();
      res.send('Conexión a la base de datos exitosa');
    } catch (error) {
      res.status(500).send('Error de conexión a la base de datos: ' + error.message);
    }
  });

  app.get('/test-session', (req, res) => {
    if (req.session.views) {
      req.session.views++;
      res.send(`Has visitado esta página ${req.session.views} veces`);
    } else {
      req.session.views = 1;
      res.send('Bienvenido a esta página por primera vez');
    }
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

  module.exports = app;
}).catch(error => {
  console.error('Failed to connect to the database:', error);
  process.exit(1);
});

