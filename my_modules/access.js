var router = require('express').Router(),
    visitorOnly = ["/log", "/sign"],
    memberOnly = ["/map/*"],
    auth = require("./user/auth");

for (i in visitorOnly) {
    router.all(visitorOnly[i], function(req, res, next) {
        if (auth.isAuth(req))
            res.redirect('/');
        else
            next();
    });
}

for (i in memberOnly) {
    router.all(memberOnly[i], function(req, res, next) {
        if (auth.isAuth(req) == false) {
            req.session.errorLog = "Page réservée aux membres";
            res.redirect('/log');
        }
        else
            next();
    });
}

module.exports = router;