
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
//var user = require('./routes/user');
var http = require('http');
var path = require('path');
var flash = require('connect-flash');
var partials = require('express-partials');

var app = express();

// all environments
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(flash());
app.use(partials());
app.use(express.session({
    secret: settings.cookieSecret,
    store: new MongoStore({
        db: settings.db 
    })
}));

app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    var err = req.session.error;
    delete req.session.error;
    var suc = req.session.success;
    delete req.session.success;
    if(err)
        res.locals.error = '<div class="alert alert-error">'+err+'</div>';
    res.locals.success = '';
    if(suc)
        res.locals.success = '<div class="alert alert-success">'+suc+'</div>';
    next();
});
app.use(app.router);
routes(app);
//app.use(express.router(routes));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
