var express = require('express');
var app = express.Router();
var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport("smtps://ctmalexbatorykleliw%40gmail.com:ntR759Cf-@smtp.gmail.com");

/* Authentication */
var isValidPassword = function(user, password)
{
    return bCrypt.compareSync(password, user.password);
}

var createHash = function(password)
{
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

passport.use('login', new LocalStrategy({
    passReqToCallback : true,
    usernameField: 'email'
},
function(req, email, password, done){

    User.findOne({ 'email': email }, function(err, user){

        if (err)
            return done(err);
        if (!user)
            return done(null, false, req.flash('errMsg', 'User not found. Please try again.'));
        if (!user.validPassword(password))
            return done(null, false, req.flash('errMsg', 'Incorrect Username or Password.'));

        return done(null, user);
    });
}
));

passport.use('register', new LocalStrategy({ 
    passReqToCallback : true,
    usernameField: 'email'
},
function(req, email, password, done){

    process.nextTick(function(){

        User.findOne({ 'email': email }, function(err, user){

            if(err)
                return done(err);
            if(user)
                return done(null, false, req.flash('errMsg', 'That email is taken. Please try again.'));
            else
            {
                var newUser = new User();
                newUser.email = email;
                newUser.password = newUser.generateHash(password);
                newUser.first_name = req.body.first_name;
                newUser.last_name = req.body.last_name;

                newUser.save(function(err){
                    if(err)
                        throw err;

                    return done(null, newUser);
                });
            }
        });
    });
}
));

/* Reset password */
app.get('/forgot', function(req, res){
    res.render('auth/forgot', {
        user: req.user,
        errMsg: req.flash('errMsg'),
        sucMsg: req.flash('sucMsg')
    });
});

app.post('/forgot', function(req, res, next){
    async.waterfall([
        function(done){
            crypto.randomBytes(20, function(err, buf){
            var token = buf.toString('hex');
            done(err, token);
        });
    },
    function(token, done){
        User.findOne({ email: req.body.email }, function(err, user){
            if(!user)
            {
                req.flash('errMsg', 'No account with that email address exists.');
                return res.redirect('forgot');
            }

            user.reset_token = token;
            user.reset_token_expires = Date.now() + 7200000; // 2 hours

            user.save(function(err) {
                done(err, token, user);
            });
        });
    },
    function(token, user, done){
        var mailOptions = {
            to: user.email,
            from: 'autoreply@alex.com',
            subject: 'AlexWork Password Reset',
            text: 'Hello ' + user.first_name + ',\n\nYou are receiving this because you have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to reset your password:\n\n' +
            'http://' + req.headers.host + '/auth/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n\n Thanks,\nAlex'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
            done(err, 'done');
        });
    }], function(err){
        if(err)
            return next(err);

        req.flash('sucMsg', 'Message has been sent to reset password.');
        res.redirect('forgot');
    });
});

app.get('/reset/:token', function(req, res){
    User.findOne({ reset_token: req.params.token, reset_token_expires:{ $gt: Date.now() }}, function(err, user) {
        if(!user)
        {
            req.flash('errMsg', 'Password reset token is invalid or has expired. Please try again.');
            return res.redirect('../forgot');
        }
        res.render('auth/reset', {
            user: user,
            errMsg: req.flash('errMsg')
        });
    });
});

app.post('/reset', function(req, res){
    async.waterfall([
        function(done){
            User.findOne({ reset_token: req.body.token, reset_token_expires: { $gt: Date.now() } }, function(err, user){
                if(!user)
                {
                    req.flash('errMsg', 'Password reset token is invalid or has expired. Please try again.');
                    return res.redirect('../forgot');
                }

                var a = new User();
                user.password = a.generateHash(req.body.password);
                user.reset_token = undefined;
                user.reset_token_expires = undefined;

                user.save(function(err){
                    done(err, user);
                });
            });
        },
        function(user, done){
            var mailOptions = {
                to: user.email,
                from: 'autoreply@alex.com',
                subject: 'Password Reset Confirmation',
                text: 'Hello ' + user.first_name + ',\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n\nThanks,\nAlex'
            };
            smtpTransport.sendMail(mailOptions, function(err){
                done(err);
            });
        }
    ], function(err){
            req.flash('sucMsg', 'Success! Your password has been changed.');
            res.redirect('../home');
        });
});

/* Verify email address */
app.get('/verify/id/:id', function(req, res){
    async.waterfall([
        function(done){
            crypto.randomBytes(20, function(err, buf){
            var token = buf.toString('hex');
            done(err, token);
        });
    },
    function(token, done){
        User.findOne({ _id: req.params.id }, function(err, user){
            if(!user)
            {
                req.flash('errMsg', 'Could send email at this time. Please try again later.');
                return res.redirect('../../../home');
            }

            user.verify_token = token;
            user.verify_token_expires = Date.now() + 7200000; // 2 hours

            user.save(function(err) {
                done(err, token, user);
            });
        });
    },
    function(token, user, done){
        var mailOptions = {
            to: user.email,
            from: 'autoreply@alex.com',
            subject: 'AlexWork Email Verification',
            text: 'Hello ' + user.first_name + ',\n\nYou are receiving this because you have requested to verify your email.\n\n' +
            'Please click on the following link, or paste this into your browser to do so:\n\n' +
            'http://' + req.headers.host + '/auth/verify/' + token + '\n\n' +
            'Thanks,\nAlex'
        };
        smtpTransport.sendMail(mailOptions, function(err){
            done(err, 'done');
        });
    }], function(err){
        if(err)
            return next(err);

        req.flash('sucMsg', 'Confirmation email has been sent.');
        res.redirect('../../../home');
    });
});

app.get('/verify/:token', function(req, res){
    async.waterfall([
        function(done){
            User.findOne({ verify_token: req.params.token, verify_token_expires: { $gt: Date.now() } }, function(err, user){
                
                if(!user)
                {
                    req.flash('errMsg', 'Could not verify at this time. Please try again later.');
                    return res.redirect('../../home');
                }

                user.verified = true;
                user.verify_token = undefined;
                user.verify_token_expires = undefined;

                user.save(function(err){
                    req.login(user, function(err){
                        done(err, user);
                    });
                });
            });
        }
    ], function(err){
        if(err)
            return next(err);

        req.flash('sucMsg', 'Email successfully verified!');
        res.redirect('../../home');
    });
});

/* GET requests */
app.get('/login', function(req, res){
    res.render('auth/login', {
        errMsg: req.flash('errMsg'),
        sucMsg: req.flash('sucMsg')
    });
});

app.get('/register', function(req, res){
    res.render('auth/register', { errMsg: req.flash('errMsg') });
});

/* POST requests */
app.post('/login', passport.authenticate('login', {
    failureRedirect: 'login',
    failureFlash : true
}), function(req, res){
    if(req.body.remember)
        req.session.cookie.maxAge = 2592000000; // 1 Month 
    else
        req.session.cookie.expires = false; // Expires at end of session
    res.redirect('../home');
});

app.post('/register', passport.authenticate('register', {
    successRedirect: '../home',
    failureRedirect: 'register',
    failureFlash : true
}));

module.exports = app;