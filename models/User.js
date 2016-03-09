var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
	email: String,
	password: String,
	created_at: Date,
	updated_at: Date
});

UserSchema.pre('save', function(next){
	var now = new Date();
	this.updated_at = now;

	if(!this.created_at)
		this.created_at = now;

	next();
});

UserSchema.plugin(passportLocalMongoose, { usernameField: 'email'});

module.exports = mongoose.model('User', UserSchema);