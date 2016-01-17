var bundle = require("../require-all"),
    patternName = /^[a-zA-Z]+$/, // name
    min = 20, // mininum size
    max = 100, // maximum size
    mapGen = require("./map-file"), // create the map file
    descrition = "A simply BOMBERMAP .... <3"; // default description

// default image
var defaultImg = bundle.path.join(__dirname,
                                 "../..",
                                 "ressources/img/default.jpg"),
    newLocation = bundle.path.join(__dirname, '../..',
                                   'public/images/maps_pic/');

function resetAll(req) {
    req.session.errorCreateMap = {
        size: "",
        name: "",
        captcha: "",
        all: ""
    }
    req.session.valueCreateMap = {
        size: "",
        name: ""        
    };
}

function init(req) {
    resetAll(req);
    req.session.valueCreateMap.size = req.body.size;
    req.session.valueCreateMap.name = req.body.name;
}

/*
** function pour ajouter des erreurs
*/

function setError(req, name, value) {
    if (name == "name")
        req.session.errorCreateMap.name = value;
    else if (name == "size")
        req.session.errorCreateMap.size = value;
    else if (name == "captcha")
        req.session.errorCreateMap.captcha = value;
    else if (name == "all")
        req.session.errorCreateMap.all = value;
}

/*
** function qui check si il y a des erreurs
*/

function haveError(req) {
    if (req.session.errorCreateMap.size.length > 0 ||
        req.session.errorCreateMap.name.length > 0 ||
        req.session.errorCreateMap.captcha.length > 0)
        return (true);
    return (false);
}

/*
** function qui check ces errors :
**  existance + laissé vide + taille min et max + nom de map
*/

function checkError(req) {
    // tests sur la taille
    if (req.body.size == undefined ||
        req.body.size.length == 0)
        setError(req, "size", "Merci de renseigner une taille");
    else {
        if (isNaN(req.body.size))
            setError(req, "size", "La taille doit être un nombre");
        else if (req.body.size < min)
            setError(req, "size", "La taille doit être de "+min+" au minimum");
        else if (req.body.size > max)
            setError(req, "size", "La taille doit être de "+max+" au maximum");
    }

    // tests sur le nom
    if (req.body.name == undefined ||
        req.body.name.length == 0)
        setError(req, "name", "Merci de renseigner un nom");
    else {
        if (patternName.test(req.body.name) == false) {
            setError(req, "name", "Le nom ne peut contenir que des lettres");
            console.log("here");
        }
    }
    return (haveError(req));
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
        if (error) {
            console.error(error);
            setError(req, "all", "Erreur inconnue");
        }
        else {        
            var bodyJson = JSON.parse(body);
            if (bodyJson.success == false) {
                console.log("error");
                setError(req, "captcha", "Captcha incorrect");
            }
        }
        callback();
    });
}

function nameAlreadyExist(req, callback) {

    bundle.model.Map.count({name: req.body.name}, function(err, count) {
        if (err)
            setError(req, "all", "Erreur inconnue");
        else if (count > 0)
            setError(req, "name", "Nom de map déjà existant");
        callback();
    });
}

function createMap(size) {
    var map = [];
    var line = '';

    for (var i = 0; i < size; i++) {
        line += '0';
    }

    for (var i = 0; i < size; i++) {
        map.push(line);
    }
    return (map);
}

/* on ajoute à la liste de map de l'user */
function resaveUser(req, res, map) {
    var mapList = req.session.user.maps;
    mapList.push(map);
    var condition = {_id: req.session.user._id},
        update = {maps: mapList};
    bundle.model.User.findOneAndUpdate(condition, update, null, function(err, newUser) {
        if (err)
            console.error(err);
        req.session.user = newUser;
        resetAll(req);
        res.redirect('/map/' + map.name + "/edit");
    });
}

/* on la save */
function saveMap(req, res, map) {
    map.save(function(err) {
        if (err) {
            setError(req, "all", "Erreur inconnue !");
            console.log("Error save : %s", err);
            res.redirect('/map/create');
        }
        else {
            resaveUser(req, res, map);
            
            // creation du fichier .map
            mapGen.createFile(map);

            // copy de l'image
            var fileName = map.name + '.jpg';
            bundle.fsExtra.copy(defaultImg, newLocation + fileName, function (err) {
                if (err)
                    console.error(err);
            });
        }
    });
}

/* on crée la map */
function insertNewMap(req, res) {
    var now = new Date,
        mapValue = createMap(req.body.size),
        map = new bundle.model.Map({
            name: req.body.name,
            description: descrition,
            created: now,
            lastUpdate: now,
            size: req.body.size,
            madeBy: req.session.user._id,
            value: mapValue,
            extension: "jpg"
        });
    saveMap(req, res, map);
}

function validate(req, res) {
    if (checkError(req) == false) {
        insertNewMap(req, res);
    }
    else
        res.redirect('/map/create');
}

module.exports.resetAll = resetAll;
module.exports.init = init;
module.exports.checkError = checkError;
module.exports.checkCaptcha = checkCaptcha;
module.exports.nameAlreadyExist = nameAlreadyExist;
module.exports.validate = validate;