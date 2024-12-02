var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose'); //Connection to mongoose
var User = require('./models/user'); 
var LocalStrategy = require('passport-local').Strategy; //To login and register with form
var router = express.Router();
var { engine } = require('express-handlebars');
var Handlebars = require('handlebars');
var petsRouter = require('./routes/pets');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var reservationsRouter = require('./routes/reservations');

// Passport config
var passport = require('passport');
var session = require('express-session')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); //// Configure middleware to serve static files

app.engine('hbs', engine({
  extname: '.hbs',
//Handlebars is a template engine that allows to create dynamic HTML views in the Node.js application.
  handlebars: Handlebars,
  defaultLayout: false,
  helpers: {
// This helper is called "eq" (short for "equal"). It checks if two values are the same.
    eq: function (a, b) {  
      return a === b;
    },
// This helper "json." It converts any data (like an object or array) into a JSON string.
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

//Passport config
app.use(session({
  secret: 'hi',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/pets', isAuthenticated, petsRouter);
app.use('/reservations', isAuthenticated, reservationsRouter);

//Login and register config
app.get('/login',(req, res) =>{
  res.render('index')
})

app.get('/register',(req, res) =>{
  res.render('index')
})

app.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true
}));

app.post('/register', (req, res) => {
  User.create({ username: req.body.username, password: req.body.password })
    .then(user => {
      res.redirect('/home');
    })
    .catch(err => {
      res.send('Error registering user: ' + err);
    });
});

app.get('/home', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('home');
  } else {
    res.redirect('/login');
  }
});

//New route for landing page
app.get('/', (req, res) => {
  res.send("Welcome to Dog DayCare!");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

//Mongoose 
var configurations = require('./configs/globals');
mongoose.connect(configurations.ConnectionStrings.MongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Successful Connection to mongoose'))
  .catch((err) => console.error('Error Connections a MongoDB:', err));

// Configuration Passport local strategy
passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({ username: username })
    .then(user => {
      if (!user) {
        return done(null, false, { message: 'Incorrect username' });
      }
      user.comparePassword(password, (err, isMatch) => {
        if (err) return done(err);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password' });
        }
        return done(null, user);
      });
    })
    .catch(err => done(err));
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

//Link from pet page to home page
app.get('/home', (req, res) => {
  res.render('home', { title: 'Home' });
});