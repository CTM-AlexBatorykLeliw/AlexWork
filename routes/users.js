var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var LocalStrategy = require('passport-local').Strategy;
var router = express.Router();

/* PASSPORT LOCAL AUTH */
passport.use(new LocalStrategy(
	function(username, password, done){
		User.findOne({ username: username }, function(err, user){
			if(err)
				return done(err);
			if(!user)
				return done(null, false);
			if(!user.verifyPassword(password))
				return done(null, false);

			passport.serializeUser(function(user, done){
				done(null, user.id);
				return done(null, user);
			});
		});
	}
));

/* POST authentication */
router.post('/',
	passport.authenticate('local', { failureRedirect: '/'}),
	function(req, res){
		res.redirect('/');
	}
);

/* Register User */
router.post('/')

router.get('/', function(req, res, next) {
  res.render('users', { title: 'Express' });
});

module.exports = router;