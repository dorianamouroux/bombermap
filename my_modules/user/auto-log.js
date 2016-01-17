var bundle = require('../require-all');

function callBackUser(req, res, err, user, token) {
    if (!err) {
        if (user) {
            if (bundle.auth.createToken(user) == token)
                req.session.user = user;
            else
                bundle.auth.deleteAuthCookie(req, res);
        }
        else
            bundle.auth.deleteAuthCookie(req, res);
    }
    else
        console.log("Error in mongoDB : %s", err);
}

module.exports = function(req, res, next) {
    if (bundle.auth.isAuth(req) == false
        && req.cookies.auth != undefined) {
        var split = req.cookies.auth.split("---");
        if (split.length != 2) {
            bundle.auth.deleteAuthCookie(req, res);
            next();
        }
        bundle.model.User.findOne({_id: split[0]},
                                  function(err, user) {
            callBackUser(req, res, err, user, split[1]);
            next();
        });
    }
    else
        next();
};