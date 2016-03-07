var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
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

mongoose.model('User', UserSchema);