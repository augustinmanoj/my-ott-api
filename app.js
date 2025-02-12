var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
require('dotenv').config();

var indexRouter = require('./routes/index');
var movieRouter = require('./routes/movie');
var authRouter = require('./routes/auth')
var seriesRouter = require('./routes/web_series')
var watchlistRouter = require('./routes/watchlist')

var app = express();
app.use(cors());  

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/movie',movieRouter);
app.use('/auth',authRouter);
app.use('/webseries',seriesRouter);
app.use('/watchlist',watchlistRouter);


app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const mongoose= require('mongoose');

mongoose.connect(process.env.MONGODB_URL)

const database = mongoose.connection;
database.once('open',()=>{
  console.log("Connection Established")
})
mongoose.set('debug', true);

module.exports = app;
