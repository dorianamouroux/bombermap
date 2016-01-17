var bundle = require("../require-all");

function init(req) {
    req.session.search = {
        query: "",
        error: "",
        res: []
    };
}

function initSearch(req) {
    req.session.search = {
        query: req.body.query,
        error: "",
        res: []
    };
}

function setError(req, error) {
    req.session.search.error = error;
}

function setRes(req, res) {
    req.session.search.res = res;
}

function isDef(req) {
    if (req.session.search == undefined) {
        return (false);
    }
    return (true);
}

module.exports.initSearch = initSearch;
module.exports.init = init;
module.exports.setError = setError;
module.exports.setRes = setRes;
module.exports.isDef = isDef;