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

app.get('/:partial', common.isLogged(), function(req, res){
	res.render('main/profile/' + req.params.partial, {
		user: req.user
	});
});

/* DELETE requests */
app.delete('/delete/:id', function(req, res, next){
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
app.put('/edit/:id', function(req, res, next){

});

/* POST requests */
app.post('/edit/pw/:id', function(req, res, next){
	User.findById(req.params.id, function(err, user){
		if(err)
			return next(err);

		if(user.validPassword(req.body.old_password))
		{
			user.password = user.generateHash(req.body.new_password);

			user.save(function(err){
				if(err)
					return next(err);

				req.flash('sucMsg', 'Your password was changed!');
				return res.redirect('/');
			});
		}
		else
		{
			req.flash('errMsg', 'Your old password was incorrect. Please try again.');
			return res.redirect('#edit/pw');
		}

	});
});

module.exports = app;