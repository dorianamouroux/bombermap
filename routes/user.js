var bundle = require("../my_modules/require-all"),
    router = bundle.express.Router(),
    sign = bundle.myModules.user.sign,
    log = bundle.myModules.user.log;

/* inscription */
router.get('/sign', function(req, res, next) {
    if (req.session.errorSign == undefined)
        sign.resetAll(req);

    var error = req.session.errorSign,
        value = req.session.valueSign;
    sign.resetAll(req);

    res.render('sign', {
        title: 'BomberMap - Inscription',
        error: error,
        value: value,
        session: req.session
    });
});

/* inscription */
router.post('/sign', function(req, res, next) {
    // init sessions var
    sign.init(req);

    // check basic error
    sign.checkBasicError(req);
    if (sign.noError(req) == false)
    {
        res.redirect('/sign');
        return ;
    }

    // waterfall for more test with callback
    bundle.async.waterfall([
        function(callback) { // existance du pseudo en bdd
            sign.pseudoAlreadyExist(req, callback);
        },
        function(callback) { // test du captcha
            sign.checkCaptcha(req, callback);
        },
        function() { // validation
            sign.validate(req, res);
        }
    ]);
});

/* connexion */
router.get('/log', function(req, res, next) {
    if (req.session.errorLog == undefined)
        log.resetAll(req);

    var error = req.session.errorLog,
        pseudo = req.session.pseudoLog,
        rememberMe = req.session.rememberMe;
    log.resetAll(req);

    res.render('log', {
        title: 'BomberMap - Inscription',
        error: error,
        pseudo: pseudo,
        rememberMe: rememberMe,
        session: req.session
    });
});

/* connexion */
router.post('/log', function(req, res, next) {
    // init sessions var
    log.init(req);

    // check basic error
    log.checkBasicError(req);
    if (log.noError(req) == false) {
        res.redirect('/log');
        return ;
    }

    // waterfall for more test with callback
    bundle.async.waterfall([
        function(callback) { // get user
            log.getUser(req, res, callback);
        },
        function() { // validation
            log.validate(req, res);
        }
    ]);
});

/* deconnexion */
router.all('/logout', function(req, res) {
    if (bundle.auth.isAuth(req)) {
        delete req.session.user;
        bundle.auth.deleteAuthCookie(req, res);
    }
    res.redirect('/log');
});

/* affichage d'un membre */
router.get("/u/:name", function(req, res) {
    var query = bundle.model.User.findOne({pseudo: req.params.name});
    query.populate("maps");
    query.exec(function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else if (!user) {
            res.render('user-error', {
                title: "User - Bombermap",
                session: req.session
            });
        }
        else {
            res.render('user', {
                title: "Map - Bombermap",
                session: req.session,
                user: user
            });

        }
    });
});

module.exports = router;