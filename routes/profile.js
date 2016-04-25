var express = require('express');
var app = express.Router();
var common = require('./common');
var User = require('../models/user');

/* GET requests */
app.get('/', common.isLogged(), function(req, res){
	res.render('main/profile', {
		user: req.user,
		errMsg: req.flash('errMsg'),
		sucMsg: req.flash('sucMsg'),
		infoMsg: req.flash('infoMsg')
	});
});

/* DELETE requests */
app.delete('/profile/delete/:id', function(req, res, next){
	User.findById(req.params.id, function(err, user){
		if(err)
			return next(err);

		user.remove({}, function(err){
			if(err)
				return next(err);

			res.redirect('logout');
		});
	});
});

/* PUT requests */
app.put('/profile/edit/:id', function(req, res, next){

});

/* POST requests */
app.post('/profile/edit/pw/:id', function(req, res, next){
	User.findById(req.params.id, function(err, user){
		if(err)
			return next(err);

		if(validPassword(req.body.old_password))
		{
			user.password = user.generateHash(req.body.new_password);

		}
		else
		{

		}

	});
});

module.exports = app;