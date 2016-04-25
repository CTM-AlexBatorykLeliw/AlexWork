var express = require('express');
var app = express.Router();
var common = require('./common');

/* GET requests */
app.get('/home', common.isLogged(), function(req, res){
	res.render('main/home', {
		user: req.user,
		errMsg: req.flash('errMsg'),
		sucMsg: req.flash('sucMsg'),
		infoMsg: req.flash('infoMsg')
	});
});

app.get('/logout', function(req, res){
	req.logout();
    res.redirect('auth/login');
});

module.exports = app;