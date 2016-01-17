var bundle = require('./my_modules/require-all');

// define all .js in ./routes
var routes = {
    index: require('./routes/index'),
    user: require('./routes/user'),
    map: require('./routes/map')
};

var app = bundle.express();

// view engine setup
app.set('views', bundle.path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', bundle.engine);

// uncomment after placing your favicon in /public
app.use(bundle.express.static(bundle.path.join(__dirname, 'public')));
app.use(bundle.favicon(__dirname + '/public/images/favicon.ico'));
app.use(bundle.logger('dev'));
app.use(bundle.bodyParser.json());
app.use(bundle.bodyParser.urlencoded({ extended: false }));
app.use(bundle.cookieParser());
app.use(bundle.session({
    resave: false,
    saveUninitialized: false,
    secret: 'sessionBomberMap'
}));

app.use(bundle.autoLog);

app.use('/', bundle.access);

// add all routes to express (check var routes)
for (i in routes) {
    app.use('/', routes[i]);
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
