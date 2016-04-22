var express = require('express');
var app = express.Router();

/* Middleware */
function isLogged()
{
    return function(req, res, next){
    	if (!req.isAuthenticated || !req.isAuthenticated())
      		res.redirect('auth/login');
    	else
      		next();
  	}
}

/* GET requests */
app.get('/home', isLogged(), function(req, res, next){
	res.render('main/home', { user: req.user });
});

app.get('/logout', function(req, res){
	req.logout();
    res.redirect('auth/login');
});

module.exports = app;