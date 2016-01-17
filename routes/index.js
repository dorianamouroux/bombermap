var bundle = require("../my_modules/require-all"),
    router = bundle.express.Router(),
    searchModule = bundle.myModules.index.search;

router.get('/', function(req, res) {
    var query = bundle.model.Map.find();
    query.exec(function(err, maps) {
        if (err) {
            console.log(err);
        }
        maps = bundle.mixArray(maps);
        res.render('index', {
            title: 'BomberMap',
            session: req.session,
            maps: maps
        });
    });
});

router.get("/search", function(req, res) {
    if (searchModule.isDef(req) == false)
        searchModule.init(req);
    res.render('search', {
        title: "Recherche - BomberMap",
        session: req.session,
        searchResult: req.session.search
    });
    searchModule.init(req);
});

router.post("/search", function(req, res) {
    searchModule.initSearch(req);
    var regexSearch = new RegExp(req.body.search, "i");
    var query = bundle.model.Map.find({
        $or: [
            {name: regexSearch},
            {description: regexSearch}
        ]
    });
    query.exec(function(err, maps) {
        if (err) {
            searchModule.setError("Erreur inconnue");
            console.error(err);
        }
        else {
            searchModule.setRes(req, maps);
        }
        res.redirect("/search");
    });
});

module.exports = router;
