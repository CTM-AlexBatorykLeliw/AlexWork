var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var router = express.Router();

/* PASSPORT LOCAL AUTH */
router.get('/', function(req, res){
	res.render('index', { user: req.user, title: "Index" });
});

router.get('/register', function(req, res){
	res.render('register', { info: "Please enter your details" });
});

router.post('/register', function(req, res){
	User.register(new User({ username: req.body.username }), req.body.password, function(err, user){
		if(err)
			return res.render('register', { info: "Sorry that username already exists." });

		passport.authenticate('local')(req, res, function(){
			console.log("test");
		});
	});
});

router.get('/login', function(req, res){
	res.render('login', { user: req.user, title: 'Login Page' });
});

router.post('/login', passport.authenticate('local'), function(req, res){
	res.redirect('/');
});

router.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

module.exports = router;