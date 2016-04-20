var express = require('express');
var app = express.Router();
var passport = require('passport');
var User = require('../models/user');

/* GET routes */
app.get('/login', function(req, res){
	res.render('auth/login', { errMsg: ""});
});

app.get('/register', function(req, res){
	res.render('auth/register', {errMsg: ""});
});

app.get('/status', function(req, res){
	if(!req.isAuthenticated())
		return res.status(200).json({
			status: false
		});
	res.status(200).json({
		status: true
	});
});

/* POST routes */
app.post('/login', function(req, res, next){
  	passport.authenticate('local', function(err, user, info){
	    if(err || !user)
	      	res.render('auth/login', {errMsg: info.message});
	    req.login(user, function(err, user){
	      	if(err)
		        res.render('auth/login', {errMsg: "Could not login. Please try again."});

	      	res.redirect('../home', {user: user});
	    });
  	})(req, res, next);
});

app.post('/register', function(req, res){
  	User.register(new User({ email: req.body.email }), req.body.password, function(err, account){
		if(err)
  			return res.status(500).json({
    			err: err
  			});
		passport.authenticate('local')(req, res, function(){
 			return res.status(200).json({
    			status: 'Registration successful'
  			});
		});
  	});
});

module.exports = app;