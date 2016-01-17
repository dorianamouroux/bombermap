var sha1 = require('sha1');

function createToken(user) {
    return (sha1(user.pseudo + user.password));
}

function createAuthToken(user) {
    return (user._id + "---" + createToken(user));
}

function createAuthCookie(req, res) {
    res.cookie("auth", createAuthToken(req.session.user), {
        overwrite: true,
        httpOnly: true,
        maxAge: (3600000 * 24 * 30)
    });
}

function deleteAuthCookie(req, res) {
    res.clearCookie("auth");
}

function isAuth(req) {
    if (req.session == undefined)
        return (false);
    if (req.session.user == undefined)
        return (false);
    return (true);
}

module.exports.createAuthCookie = createAuthCookie;
module.exports.isAuth = isAuth;
module.exports.deleteAuthCookie = deleteAuthCookie;
module.exports.createToken = createToken;