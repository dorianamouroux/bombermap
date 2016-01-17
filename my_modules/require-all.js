module.exports.express = require('express');
module.exports.path = require('path');
module.exports.favicon = require('serve-favicon');
module.exports.logger = require('morgan');
module.exports.cookieParser = require('cookie-parser');
module.exports.bodyParser = require('body-parser');
module.exports.engine = require('ejs-mate');
module.exports.model = require('./db/mongo-schema');
module.exports.async = require('async');
module.exports.session = require('express-session');
module.exports.request = require('request');
module.exports.sha1 = require('sha1');
module.exports.access = require('./access');
module.exports.autoLog = require('./user/auto-log');
module.exports.auth = require('./user/auth');
module.exports.fs = require('fs');
module.exports.fsExtra = require('fs-extra');
module.exports.formidable = require('formidable');
module.exports.util = require('util');
module.exports.mixArray = require('./mix-array');

// all my module includes in /routes
module.exports.myModules = {
    index: {
        search: require("./index/search")
    },
    user: {
        sign: require('./user/sign'),
        log: require('./user/log'),
    },
    map: {
        createMap: require('./map/create-map'),
        editMap: require('./map/edit-map'),
        mapFile: require('./map/map-file'),
        upload: require('./map/upload')
    }
};