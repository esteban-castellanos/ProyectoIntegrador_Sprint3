var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs =require('fs');
var methodOverride = require ('method-override');


var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var administradorRouter = require ('./routes/administrador');
var productosRouter = require ('./routes/productos');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.use('/', indexRouter);
app.use('/productos', productosRouter);
app.use('/user', userRouter);
app.use('/adm', administradorRouter);

// catch 404 and forward to error handler
app.use(function(req,res,next){
  res.status(404).render('not-found')
  });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('not-found');
});

module.exports = app;
