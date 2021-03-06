var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var mongoose = require('mongoose');
var localStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

// Mongoose connection
mongoose.connect('mongodb://AlexBatorykLeliw:Kingducky2008@ds013931.mlab.com:13931/alex-work');

// Schema models
var User = require('./models/user');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // Set up EJS for templating

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev')); // Log every request to the console
app.use(cookieParser()); // Read cookies (needed for auth)
app.use(bodyParser.json()); // Get information from HTML forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));
// Serve npm modules
app.use('/mod', express.static(__dirname + '/node_modules'));

app.use(session({
    secret: 'Alex',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session()); // Persistent login sessions

// Configure passport
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());

// Routes
app.use('/', require('./routes/home'));
app.use('/auth', require('./routes/auth'));
app.use('/profile/', require('./routes/profile'));

// ERR handlers
// Development error handler, will print stacktrace
if(app.get('env') === 'development')
    app.use(function(err, req, res, next){
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });

// Production error handler, no stacktraces leaked to user
app.use(function(err, req, res, next){
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;