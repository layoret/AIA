var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const rp = require('request-promise');
const cheerio = require('cheerio');
//var md5 = require('md5');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
//var scrapeRouter = require('./routes/scrape');
var postImage = require('./routes/postImage');
var scrapingModels=require('./routes/loadScrapingModels');
//Main scrapper
var scrapeRouter = require('./routes/AIAscrapeJob');
var meaningCloud=require('./routes/meaningCloud');
var normalizeExtended=require('./routes/normalizeExtended');
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/scrape',scrapeRouter);
//app.use('/scrape2',scrapeRouter2);
app.use('/users', usersRouter);
app.use('/image', postImage );
app.use('/models', scrapingModels );
app.use('/CloudNLP',meaningCloud);
app.use('/NormalizeExtended',normalizeExtended);
// catch 404 and forward to error handler
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

module.exports = app;
