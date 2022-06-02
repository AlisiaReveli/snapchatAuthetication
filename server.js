const express = require('express');
const fs = require('fs');
const path = require('path');
const passport = require('passport');
const SnapchatStrategy = require('passport-snapchat').Strategy;

try {
  fs.statSync(path.join(__dirname, './config'))
let  config = require('./config');
} catch (e) {}

// Configure the Snapchat strategy for use by Passport.

passport.use(new SnapchatStrategy({
    clientID: "7647674d-69d3-47d6-b2ff-1559005affb4",
    clientSecret: "fEpGLcAGPiR88TUhk2r4HNTkUuaOmaZTZ9-NVHHt8Cw",
    callbackURL: 'http://localhost:3000/login/snapchat/callback',
    profileFields: ['id', 'displayName', 'bitmoji'],
    scope: ['user.display_name', 'user.bitmoji.avatar'],
    pkce: true,
    state: true
  },
  function (accessToken, refreshToken, profile, cb) {
   //callback url should be addesd to the snapchat developer console
    return cb(null, profile);
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({
  secret:'test' ,
  resave: true,
  saveUninitialized: true,
}));

// Initialize Passport and restore authorization state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


app.get('/fail',
  function(req, res){
    res.render('login');
  });

app.get('/login/snapchat',
  passport.authenticate('snapchat'));

app.get('/login/snapchat/callback',
  passport.authenticate('snapchat', { failureRedirect: '/fail' }),
  function(req, res) {
    res.redirect('/profile');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });


app.listen(3000, () => {
  console.log('App listening on port 3000...');
});
