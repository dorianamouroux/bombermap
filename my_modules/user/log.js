var bundle = require("../require-all");

var error = "Mauvais identifiants de connexion";

function resetAll(req) {
    req.session.errorLog = "";
    req.session.pseudoLog = "";
    req.session.rememberMe = false;
}

function init(req) {
    resetAll(req);
    req.session.pseudoLog = req.body.pseudo;
    if (req.body.rememberMe != undefined)
        req.session.rememberMe = true;
}

function checkBasicError(req) {
    var pseudo = req.body.pseudo;
    var pass = req.body.pass;

    if (pseudo == undefined ||
        pass == undefined ||
        pseudo.length == 0 ||
        pass.length == 0)
        req.session.errorLog = error;
}

function noError(req) {
    if (req.session.errorLog == undefined ||
        req.session.errorLog.length == 0)
        return (true);
    return (false);
}

function connectUser(req, res, user) {
    // test du mot de pass
    if (user.pass == bundle.sha1(req.body.pass)) {
        req.session.user = user;
        req.session.errorLog = "Vous êtes maintenant connecté";
        if (req.session.rememberMe) {
            bundle.auth.createAuthCookie(req, res);
        }
        resetAll(req);
    }
    else
        req.session.errorLog = error;
}

function getUser(req, res, callback) {
    var param = {
        pseudo: req.session.pseudoLog
    };
    bundle.model.User.findOne(param, function(err, user) {
        // gestion d'erreur mongoDB
        if (err) {
            req.session.errorLog = "Erreur inconnue, merci de réessayer plus tard";
            callback();
        }
        // on test si on a trouvé un user
        if (user) {
            connectUser(req, res, user);
        }
        else
            req.session.errorLog = error;
        callback();
    });
}

function validate(req, res) {
    res.redirect('/log');
}

module.exports.resetAll = resetAll;
module.exports.init = init;
module.exports.checkBasicError = checkBasicError;
module.exports.noError = noError;
module.exports.getUser = getUser;
module.exports.validate = validate;
