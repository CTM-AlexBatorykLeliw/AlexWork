var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var router = express.Router();

/* PASSPORT LOCAL AUTH */
router.get('/register', function(req, res){
	res.render('register', { info: "Please enter your details" });
});

router.post('/register', function(req, res){
	User.register(new User({ email: req.body.email }), req.body.password, function(err, user){
		if(err)
			return res.render('register', { info: err });

		passport.authenticate('local')(req, res, function(){
			res.render('home', { user: req.user, title: "Home" });
		});
	});
});

router.get('/login', function(req, res){
	res.render('login', { user: req.user, title: 'Login Page' });
});

router.post('/login', passport.authenticate('local'), function(req, res){
	res.render('home', { user: req.user, title: 'Home' });
});

router.get('/logout', function(req, res){
	req.logout();
	res.redirect('/auth/login');
});

router.get('/reset', function(req, res){
	res.render('reset', { authenticated: false });
});

module.exports = router;