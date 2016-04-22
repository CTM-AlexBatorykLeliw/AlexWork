var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var bCrypt = require('bCrypt-nodejs');

var userSchema = new mongoose.Schema({
  	email: String,
  	password: String,
  	verified: Boolean,
  	first_name: String,
  	last_name: String,
  	created_at: Date,
  	updated_at: Date,
  	reset_token: String,
  	reset_token_expires: Date
});

userSchema.pre('save', function(next){
	var now = new Date();

	this.updated_at = now;

	if(!this.created_at)
		this.created_at = now;

	next();
});

userSchema.methods.generateHash = function(password)
{
    return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
}

userSchema.methods.validPassword = function(password)
{
    return bCrypt.compareSync(password, this.password);
}

userSchema.plugin(passportLocalMongoose, {usernameField: 'email'});

module.exports = mongoose.model('users', userSchema);