var bundle = require("../my_modules/require-all"),
    router = bundle.express.Router(),
    createMap = bundle.myModules.map.createMap,
    editMap = bundle.myModules.map.editMap,
    uploadPic = bundle.myModules.map.upload;

/* create d'une map */
router.get('/map/create', function(req, res) {
    if (req.session.errorCreateMap == undefined)
        createMap.resetAll(req);

    var error = req.session.errorCreateMap,
        value = req.session.valueCreateMap;

    createMap.resetAll(req);
    res.render('map-create', {
        title: "Nouvelle carte - Bombermap",
        session: req.session,
        error: error,
        value: value
    });
});

/* creation d'une map */
router.post('/map/create', function(req, res) {
    createMap.init(req);
    if (createMap.checkError(req) == false) {
        // début de la waterfall
        bundle.async.waterfall([
            function(callback) {
                createMap.checkCaptcha(req, callback);
            },
            function(callback) {
                createMap.nameAlreadyExist(req, callback);
            },
            function() {
                createMap.validate(req, res);
            }
        ]);
    }
    else
        res.redirect(req.originalUrl);
});

/* listes des maps quand on est connectés */
router.get('/map', function(req, res) {
    var query = bundle.model.Map.find({madeBy: req.session.user._id});
    query.exec(function(err, maps) {
        res.render('map-view', {
            title: "Mes cartes - Bombermap",
            session: req.session,
            maps: maps
        });
    });
});

/* téléchargement d'une map */
router.get('/m/:name/download', function(req, res, next) {
    var query = bundle.model.Map.findOne({name: req.params.name});
    query.exec(function(err, map) {
        if (err || !map) {
            console.error(err);
            next();
            return ;
        }
        else {
            var path = __dirname + '/../maps/' + map.name + '.map';
            res.download(path, function(err){
                // file sent
                if (!err) return;
                // non-404 error
                if (err && err.status !== 404) return next(err);
                // file for download not found
                res.statusCode = 404;
                res.send('Cant find that file, sorry!');
            });
        }
    });
});

/* affichage d'une map */
router.get('/m/:name', function(req, res, next) {
    var query = bundle.model.Map.findOne({name: req.params.name});
    query.populate('madeBy');
    query.exec(function(err, map) {
        if (err || !map) {
            console.error(err);
            next();
            return ;
        }
        else {
            res.render('map', {
                title: "Map - Bombermap",
                session: req.session,
                map: map
            });
        }
    });
});

/* suppression d'une map */
router.get('/map/:name/delete', function(req, res) {
    var query = bundle.model.Map.findOne({name: req.params.name});
    query.exec(function(err, map) {
        if (err) {
            console.error(err)
            res.redirect("/map");
        }
        // erreur anodine
        else if (!map || map.madeBy != req.session.user._id) {
            res.redirect("/map");
        }
        else {
            // suppression dans mongo
            map.remove(function(err) {
                if (err)
                    console.log(err);
                res.redirect("/map");
            });

            // suppresion du fichier
            var path = __dirname + '/../maps/' + map.name + '.map';
            bundle.fs.unlink(path, function (err) {
                if (err)
                    console.error(err);
            });

            // suppression de l'image
            path = bundle.path.join(__dirname, '/../public/images/maps_pic/');
            path += map.name + '.' + map.extension;
            bundle.fs.unlink(path, function (err) {
                if (err)
                    console.error(err);
            });
        }
    });
});

/* edition d'une map */
router.get('/map/:name/edit', function(req, res) {
    var query = bundle.model.Map.findOne({name: req.params.name});
    if (req.session.editMap == undefined) {
        editMap.init(req);
    }
    if (req.session.uploadMap == undefined) {
        uploadPic.init(req);
    }

    query.exec(function(err, map) {
        // erreur anodine
        if (err) {
            console.log("error = %s", err);
            editMap.setError(req, "Unknown error");
        }
        if (!map || map.madeBy != req.session.user._id) {
            res.redirect('/map');
        }
        else {
            if (editMap.getDescription(req).length == 0)
                editMap.setDescription(req, map.description);
            var editMapEjs = req.session.editMap;
            var uploadMapError = req.session.uploadMap;
            delete req.session.editMap;
            delete req.session.uploadMap;
            res.render('map-edit', {
                title: "Edition - Bombermap",
                session: req.session,
                map: map,
                editMap: editMapEjs,
                uploadMap: uploadMapError
            });
        }
    });
});

/* edition d'une map */
router.post('/map/:name/edit', function(req, res) {
    var query = bundle.model.Map.findOne({name: req.params.name});

    editMap.init(req);

    query.exec(function(err, map) {
        if (err) {
            console.log("error = %s");
            editMap.setErrorGlobal(req, "Unknown error");
            res.redirect(req.originalUrl);
        }
        if (!map || map.madeBy != req.session.user._id) {
            res.redirect('/map');
        }
        else if (req.body.map == undefined ||
                 req.body.description == undefined)
            res.redirect(req.originalUrl);
        else {
            try {
                var newMap = JSON.parse(req.body.map);

                editMap.setDescription(req, req.body.description);
                editMap.checkMap(req, newMap, map.value);
                editMap.checkDescription(req);

                // aucune erreur, on save les 2
                if (editMap.haveErrorDescription(req) == false && 
                    editMap.haveErrorMap(req) == false) {
                    map.value = newMap;
                    map.description = req.body.description;
                    editMap.saveMap(req, res, map);                
                }
                // erreur de map, on save description
                else if (editMap.haveErrorDescription(req) == false) {
                    map.description = req.body.description;
                    editMap.saveMap(req, res, map);  
                }
                // erreur de description, on save la map
                else if (editMap.haveErrorMap(req) == false) {
                    map.value = newMap;
                    editMap.saveMap(req, res, map);
                }
                // erreur dans les deux
                else
                    res.redirect(req.originalUrl);
            } catch (e) {
                res.redirect(req.originalUrl);
            }

        }
    });
});

router.get('/map/:name/edit/upload', function(req, res) {
    res.redirect("/map/" + req.params.name + "/edit");
});

router.post('/map/:name/edit/upload', function(req, res) {
    var redir = "/map/" + req.params.name + "/edit";
    var query = bundle.model.Map.findOne({name: req.params.name});

    uploadPic.init(req);

    query.exec(function(err, map) {
        if (err) {
            console.log("error = %s");
            uploadPic.setError(req, "Unknown error");
            res.redirect(redir);
        }
        else if (!map || map.madeBy != req.session.user._id) {
            res.redirect('/map');
        }
        else {
            var form = new bundle.formidable.IncomingForm();
            form.parse(req, function(err, fields, files) {
                console.log(files);
                var file = files.upload;
                var extension = uploadPic.getExtension(file.name);
                if (uploadPic.checkFile(req, file, extension) == false) {
                    res.redirect(redir);
                    return ;
                }
                else {
                    map.extension = extension;
                    uploadPic.moveImage(req, res, file, map, redir);
                }
            });
        }
    });
});

module.exports = router;