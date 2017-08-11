const express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    stylus = require('stylus'),
    index = require('./server/routes/index'),
    users = require('./server/routes/users'),
    config = require('./server/config/main'),
    mongoConfig = require('./server/config/mongo'),
    redisConfig = require('./server/config/redis'),
    AuthenticationController = require('./server/controllers/authentication'),
    PageController = require('./server/controllers/page'),
    UserController = require('./server/controllers/user'),
    JSONAPIDeserializer = require('jsonapi-serializer').Deserializer,
    mongoose = require('mongoose'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    passport = require('passport'),
    flash = require('connect-flash'),
    app = express(),
    debug = require('debug')('myapp:server'),
    http = require('http'),
    socketIO = require('socket.io'),
    socketIORedis = require('socket.io-redis'),
    cluster = require('cluster'),
    sticky = require('sticky-session');

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        validateToken(req, res, next);
    }
}

function signupUser(req, res, next) {
    let deserialize = new JSONAPIDeserializer().deserialize(req.body);
    deserialize.then(function (user) {
        req.body.username = user.local.username;
        req.body.password = user.local.password;
        req.body.email = user.local.email;
        passport.authenticate('signup', {session: true, failWithError: true})(req, res, next);
    }).catch(function (err) {
        res.status(401).json({error: err});
    });
}

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
}

function refreshToken(req, res, next) {
    AuthenticationController.authenticate(req);
    passport.authenticate('jwt', {session: false, failWithError: true })(req, res, next);
}

function validateToken(req, res, next) {
    AuthenticationController.authenticate(req);
    passport.authenticate('jwt', {session: false, failureRedirect: '/' })(req, res, next);
}

// view engine setup
app.set('views', path.join(__dirname, 'server/views'));
app.set('view engine', 'hbs');

// MongoDB setup
mongoose.Promise = require('bluebird');
mongoose.connect(mongoConfig.url);
mongoose.connection.on('error', function () {
    console.error('MongoDB connection error. Make sure MongoDB is running.');
});

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
    origin: 'http://127.0.0.1:4200',
    allowedHeaders: 'authorization'
}));

require('./server/config/passport')(passport);

// Session setup
app.use(session({
    secret: config.secret.mongo,
    saveUninitialized: true,
    resave: true,
    store: new MongoStore({
        url: mongoConfig.url,
        collection: 'sessions'
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', index);

app.post('/signup', passport.authenticate('signup-flash', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
}));
app.get('/signup', function(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    }
});

app.get('/login', function(req, res, next) {
    res.render('login', { title: 'Log In',  message: req.flash('loginMessage') });
});
app.post('/login', passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/logout', isLoggedIn, function(req, res) {
    req.logout();
    res.redirect('/');
});

//Ember Simpe Auth (OAuth2)
app.post('/token', passport.authenticate('ember', {session: true, failWithError: true}),
    AuthenticationController.login,
    function (err, req, res, next) {
        return UserController.loginError(req, res);
    });

//Ember Simpe Auth (JWT)
app.post('/api/token-auth', passport.authenticate('ember', {session: true, failWithError: true }),
    AuthenticationController.login,
    function (err, req, res, next) {
        return UserController.loginError(req, res);
    });
app.post('/api/token-refresh', refreshToken, AuthenticationController.login, function (err, req, res) {
    res.status(401);
});

app.get('/pages', isLoggedIn, function (req, res) {
    return PageController.getPages(req, res);
});
app.post('/pages', isLoggedIn, function (req, res) {
    return PageController.addPage(req, res);
});
app.get('/pages/:id', isLoggedIn, function (req, res) {
    return PageController.getPageById(req, res);
});
app.patch('/pages/:id', isLoggedIn, function (req, res) {
    return PageController.updatePageById(req, res);
});
app.delete('/pages/:id', isLoggedIn, function (req, res) {
    return PageController.deletePageById(req, res);
});
app.get('/pages/:id/edit', isLoggedIn, function (req, res) {
    return PageController.getPageById(req, res);
});

// Twitter Authentication
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    failureRedirect: 'http://127.0.0.1:4200/login'
}), function (req, res) {
    let user = {
        sub: req.user._id,
        username: req.user.twitter.username,
        displayName: req.user.twitter.displayName
        //, token: req.user.twitter.token
        //, profileImage: req.user.twitter._json.profile_image_url_https
    };
    res.redirect('http://127.0.0.1:4200?code=' + encodeURIComponent(AuthenticationController.generateJWT(user)));
});

// Facebook Authentication
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: 'http://127.0.0.1:4200/login'
}), function (req, res) {
    let user = {
        sub: req.user._id,
        email: req.user.facebook.email,
        name: req.user.facebook.name
    };
    let code = encodeURIComponent(AuthenticationController.generateJWT(user));
    let state = req.query.state;
    res.redirect('http://127.0.0.1:4200?code=' + code + '&state=' + state);
});

app.get('/auth/google',
    passport.authenticate('google', { scope: 'email https://www.googleapis.com/auth/plus.login' }));
app.get('/auth/google/callback', passport.authenticate('google', {
    scope: 'email https://www.googleapis.com/auth/plus.login',
    failureRedirect: 'http://127.0.0.1:4200/login'
}), function (req, res) {
    let user = {
        sub: req.user._id,
        email: req.user.google.email,
        name: req.user.google.name
    };
    let access_token = encodeURIComponent(AuthenticationController.generateJWT(user));
    res.redirect('http://127.0.0.1:4200?access_token=' + access_token);
});

app.get('/profile', isAuthenticated, function (req, res) {
    res.render('profile', {user: req.user});
});

// Users
app.delete('/users/:id', isLoggedIn, function (req, res) {
    return UserController.deleteUserById(req, res);
});
app.get('/users/:id', isLoggedIn, function (req, res) {
    return UserController.getUserById(req, res);
});
app.patch('/users/:id', isLoggedIn, function (req, res) {
    return UserController.updateUserById(req, res);
});
app.post('/users', signupUser,
    UserController.returnUser,
    function (err, req, res, next) {
        return UserController.signupError(req, res);
    });
app.get('/users', function (req, res) {//isLoggedIn,
    return UserController.getUsers(req, res);
});

app.get('/connect/local', isAuthenticated, function(req, res) {
    res.render('connect-local', { message: req.flash('loginMessage') });
});
app.post('/connect/local', passport.authenticate('signup', {
    successRedirect : '/profile',
    failureRedirect : '/connect/local',
    failureFlash : true
}));
app.get('/unlink/local', isAuthenticated, function (req, res) {
    return UserController.unlinkLocal(req, res);
});

app.get('/connect/facebook', passport.authorize('facebook-connect'));
app.get('/connect/facebook/callback', passport.authenticate('facebook-connect', {
    successRedirect: '/profile',
    failureRedirect: '/'
}));
app.get('/unlink/facebook', isAuthenticated, function (req, res) {
    return UserController.unlinkFacebook(req, res);
});

app.get('/connect/twitter', passport.authorize('twitter-connect'));
app.get('/connect/twitter/callback', passport.authenticate('twitter-connect', {
    successRedirect: 'http://127.0.0.1:4200/profile',
    failureRedirect: 'http://127.0.0.1:4200'
}));
app.get('/unlink/twitter', isAuthenticated, function (req, res) {
    return UserController.unlinkTwitter(req, res);
});

app.get('/connect/google', passport.authorize('google-connect',
    { scope: 'email https://www.googleapis.com/auth/plus.login' }));
app.get('/connect/google/callback', passport.authenticate('google-connect', {
    successRedirect: '/profile',
    failureRedirect: '/'
}));
app.get('/unlink/google', isAuthenticated, function (req, res) {
    return UserController.unlinkGoogle(req, res);
});

/*
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
*/

//module.exports = app;

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const server = http.createServer(app);
const emitter = require('socket.io-emitter')(redisConfig);
const io = socketIO(server);
io.adapter(socketIORedis(redisConfig));
io.on('connection', function (socket) {
    emitter.emit('greeting-from-server', {
        greeting: 'Hello Client'
    });
    socket.on('greeting-from-client', function (message) {
        console.log(message.greeting);
    });
});

if (!sticky.listen(server, port)) {
    // Master code
    server.once('listening', function() {
        console.log('server started on 3000 port');
    });
} else {
    console.log('worker: ' + cluster.worker.id);
}

function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}