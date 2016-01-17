var bundle = require("../require-all"),
    patternPseudo = /^[a-z0-9-_]+$/i;

function resetAll(req) {    
    req.session.errorSign = {
        pseudo: "",
        password: "",
        global: "",
        captcha: ""
    };
    req.session.valueSign = {
        pseudo: ""
    }
}

function init(req) {
    resetAll(req);
    req.session.valueSign = {
        pseudo: req.body.pseudo
    };
}

function noError(req) {
    if (req.session.errorSign.pseudo.length > 0 ||
        req.session.errorSign.password.length > 0 ||
        req.session.errorSign.global.length > 0 ||
        req.session.errorSign.captcha.length > 0)
        return (false);
    else
        return (true);
}

function setMessage(req, field, mess) {
    if (field == "pseudo")
        req.session.errorSign.pseudo = mess;
    else if (field == "password")
        req.session.errorSign.password = mess;
    else if (field == "global")
        req.session.errorSign.global = mess;
    else if (field == "captcha")
        req.session.errorSign.captcha = mess;
}

function checkBasicError(req) {
    var pseudo = req.body.pseudo;
    var pass1 = req.body.pass1;
    var pass2 = req.body.pass2;
    var messUndefined = "Erreur, merci de réessayer";

    if (pseudo == undefined)
        setMessage(req, "pseudo", messUndefined);
    else {
        if (pseudo.length == 0) {
            setMessage(req, "pseudo", "Merci de mettre un pseudo");
        }
        else {
            if (pseudo.length < 3 || pseudo.length > 20)
                setMessage(req, "pseudo", "Le pseudo doit contenir entre 3 et 20 caractères");
            if (pseudo.length > 0 && patternPseudo.test(pseudo) == false)
                setMessage(req, "pseudo", "Le pseudo ne peut contenir que des chiffres, lettres, tirets et underscores");
        }
    }
    if (pass1 == undefined || pass2 == undefined)
        setMessage(req, "password", messUndefined);
    else if (pass1.length == 0 || pass2.length == 0)
        setMessage(req, "password", "Merci de mettre un mot de passe");
    else if (pass1 !== pass2)
        setMessage(req, "password", "Les mots de passe ne correspondent pas");
}

function pseudoAlreadyExist(req, next) {
    bundle.model.User.count({pseudo: req.body.pseudo}, function(err, count) {
        if (err)
            setMessage(req, "global", "Erreur inconnue");
        else if (count > 0)
            setMessage(req, "pseudo", "Pseudo déjà existant");
        next();
    });
}

function checkCaptcha(req, callback) {
    bundle.request({
        uri: "https://www.google.com/recaptcha/api/siteverify",
        method: "POST",
        form: {
            secret:	"6LfWewYTAAAAAPVNO8zlrS9RBbM5m_4EIpLVxFKo",
            response: req.body['g-recaptcha-response']
        }
    }, function(error, response, body) {
        var bodyJson;
        bodyJson = JSON.parse(body);
        if (bodyJson.success == false)
            setMessage(req, "captcha", "Captcha incorrect");
        callback();
    });
}

function validate(req, res) {
    if (noError(req)) {
        var user = new bundle.model.User({
            pseudo: req.body.pseudo,
            pass: bundle.sha1(req.body.pass1)
        });
        user.save(function(err) {
            if (err) {
                setMessage(req, "global", "Erreur inconnue");
                console.log("Error save : %s", err);
            }
            else {
                setMessage(req, "global", "Vous êtes maintenant inscrit, vous pouvez vous connecter");
                req.session.valueSign.pseudo = "";
            }
            res.redirect('/sign');
        });  
    }
    else {
        res.redirect('/sign');
    }
}

module.exports.resetAll = resetAll;
module.exports.pseudoAlreadyExist = pseudoAlreadyExist;
module.exports.validate = validate;
module.exports.init = init;
module.exports.checkBasicError = checkBasicError;
module.exports.noError = noError;
module.exports.checkCaptcha = checkCaptcha;