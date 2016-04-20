var express = require('express');
var app = express.Router();
var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');

/* PASSPORT strategy */
var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
}

// passport/login.js
passport.use('login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the errMsg
            if (!user)
                return done(null, false, req.flash('errMsg', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('errMsg', 'Oops! Wrong password.')); // create the errMsg and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));

passport.use('register', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('errMsg', 'That email is already taken.'));
            } else {

                // if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.email    = email;
                newUser.password = newUser.generateHash(password);

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });    

        });

    }));

var createHash = function(password){
 return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}


/* GET login page. */
  app.get('/login', function(req, res) {
    res.render('auth/login', { errMsg: req.flash('errMsg') });
  });
 
  /* Handle Login POST */
  app.post('/login', passport.authenticate('login', {
    successRedirect: '../main/home',
    failureRedirect: 'login',
    failureFlash : true 
  }));
 
  /* GET Registration Page */
  app.get('/register', function(req, res){
    res.render('auth/register', { errMsg: req.flash('errMsg') });
  });
 
  /* Handle Registration POST */
  app.post('/register', passport.authenticate('register', {
    successRedirect: '../main/home',
    failureRedirect: 'register',
    failureFlash : true 
  }));

module.exports = app;