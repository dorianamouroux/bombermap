var bundle = require("../require-all"),
    allowedExt = ["jpeg", "jpg", "png"],
    allowedType = ["image/jpeg", "image/png"],
    maxSize = 2000000,
    badImage = "Mauvais format d'image",
    dirPic = bundle.path.join(__dirname, '../../public/images/maps_pic/');

function init(req) {
    req.session.uploadMap = "";
}

function setError(req, error) {
    req.session.uploadMap = error;
}

function haveError(req) {
    if (req.session.uploadMap.length == 0)
        return (false);
    return (true);
}

function getExtension(name) {
    var split = name.split(".");
    return (split[(split.length - 1)]);
}

function isInArray(array, elem) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == elem)
            return (true);
    }
    return (false);
}

function checkFile(req, file, extension) {
    if (file.size == 0) {
        return (false);    
    }
    if (isInArray(allowedExt, extension) == false) {
        setError(req, badImage);
        return (false);
    }
    else if (isInArray(allowedType, file.type) == false) {
        setError(req, badImage);
        return (false);        
    }
    else if (file.size > maxSize) {
        setError(req, "Taille de l'image trop élevé");
        return (false);    
    }
    else {
        return (true);
    }
}

function moveImage(req, res, file, map, redir) {
    console.log(file);
    var fileName = map.name + '.' + map.extension,
        newLocation = dirPic + fileName;
    bundle.fsExtra.copy(file.path, newLocation, function (err) {
        if (err) {
            console.error(err);
            uploadPic.setError(req, "Erreur inconnue");
            res.redirect(redir);
        }
        else {
            var update = {
                $set: { extension: map.extension }
            };
            bundle.model.Map.findByIdAndUpdate(map._id, update, function (err) {
                if (err)
                    console.error(err);
                res.redirect(redir);
            });
        }
    });
}

module.exports.init = init;
module.exports.setError = setError;
module.exports.haveError = haveError;
module.exports.getExtension = getExtension;
module.exports.checkFile = checkFile;
module.exports.moveImage = moveImage;