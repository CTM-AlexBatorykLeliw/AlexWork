var express = require('express');
var app = express.Router();

function isLogged(){
  	return function(req, res, next){
    	if (!req.isAuthenticated || !req.isAuthenticated())
      		res.redirect('auth/login');
    	else
      		next();
  	}
}

app.get('/home', isLogged(), function(req, res, next){
	res.render('home', { user: req.user });
});

app.get('/logout', function(req, res){
	req.logout();
	res.status(200).json({
		status: 'Logged out'
	});
});

module.exports = app;