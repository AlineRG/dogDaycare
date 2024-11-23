var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose'); //Connection to mongoose

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// Passport config
var passport = require('passport');
var session = require('express-session')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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
    res.send("Welcome to the Home Page!");
  } else {
    res.redirect('/login');
  }
});

//New route for landing page
app.get('/', (req, res) => {
  res.send("Welcome to Dog DayCare!");
});

//Passport config login
app.post('/',passport.authenticate('local',{
  successRedirect: '/home',
  failureRedirect: '/',
  }));

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
