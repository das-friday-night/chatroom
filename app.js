var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");

var index = require('./routes/index');
var logic = require('./routes/v1');
var auth = require('./routes/auth');

var app = express();

app.use(session({
    secret: 'Peter Piper picked a peck of pickled peppers',
    resave: false,
    saveUninitialized: true
}));

mongoose.connect('mongodb://user:user@ds113046.mlab.com:13046/chatroom/');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var authchecker = function(req, res, next){
  if(req.session && req.session.okma && req.session.okma === 'syl')
    return next();
  else
    return res.sendStatus(401);
};


app.use('/', index);
app.use('/v1', authchecker, logic);
app.use('/auth', auth);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};


  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
