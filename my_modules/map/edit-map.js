var bundle = require("../require-all"),
    errorSentence = "Erreur de map, merci de réessayer",
    mapGen = require("./map-file");

function setErrorGlobal(req, error) {
    req.session.editMap.global = "";
}

function setErrorMap(req, error) {
    req.session.editMap.errorMap = error;
}

function setErrorDescription(req, error) {
    req.session.editMap.errorDescription = error;
}

function setDescription(req, description) {
    req.session.editMap.description = description;
}

function getDescription(req) {
    return (req.session.editMap.description);
}

function init(req) {
    req.session.editMap = {
        errorMap: "",
        errorDescription: "",
        global: "",
        description: ""
    }
}

function checkValueLine(req, line) {
    for (var i = 0; i < line.length; i++) {
        if (line[i] != '0' &&
            line[i] != '1' &&
            line[i] != '2') {
            setErrorMap(req, errorSentence);
            return (false);
        }
    }
    return (true);
}

function checkMap(req, newMap, map) {
    if (newMap.length != map.length) {
        setErrorMap(req, errorSentence);
    }
    else {
        for (var i = 0; i < newMap.length; i++) {
            if (newMap[i].length != map[i].length) {
                setErrorMap(req, errorSentence);
                return ;
            }
            if (checkValueLine(req, newMap[i]) == false)
                return ;
        }
    }
}

function checkDescription(req) {
    if (req.session.editMap.description.length == 0) {
        setErrorDescription(req, "Description invalide");
    }
}

function haveErrorDescription(req) {
    if (req.session.editMap.errorDescription.length > 0)
        return (true);
    return (false);
}

function haveErrorMap(req) {
    if (req.session.editMap.errorMap.length > 0)
        return (true);
    return (false);
}

function saveMap(req, res, map) {
    map.lastUpdate = new Date;
    map.save(function(err) {
        if (err) {
            setErrorGlobal(req, "Unknown error");
            console.log(err);
        }
        else {
            setErrorGlobal(req, "Map correctement modifiée");
            mapGen.createFile(map);
        }
        res.redirect(req.originalUrl);
    });
}

module.exports.checkMap = checkMap;
module.exports.init = init;
module.exports.setErrorGlobal = setErrorMap;
module.exports.setErrorMap = setErrorMap;
module.exports.setErrorDescription = setErrorDescription;
module.exports.setDescription = setDescription;
module.exports.getDescription = getDescription;
module.exports.checkDescription = checkDescription;
module.exports.haveErrorMap = haveErrorMap;
module.exports.haveErrorDescription = haveErrorDescription;
module.exports.saveMap = saveMap;