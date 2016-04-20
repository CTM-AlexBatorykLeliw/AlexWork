var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var bCrypt = require('bCrypt-nodejs');

var userSchema = new mongoose.Schema({
  	email: String,
  	password: String,
  	verified: Boolean
});

userSchema.methods.generateHash = function(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bCrypt.compareSync(password, this.local.password);
};

userSchema.plugin(passportLocalMongoose, {usernameField: 'email'});

module.exports = mongoose.model('users', userSchema);