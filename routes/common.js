function Common(){}

Common.prototype.isLogged = function()
{
    return function(req, res, next){
    	if (!req.isAuthenticated || !req.isAuthenticated())
      		res.redirect('auth/login');
    	else
      		next();
  	}
}

module.exports = new Common();