var mongoose = require('mongoose');
var db = require("./mongo-connect");

var userSchema = mongoose.Schema({
    pseudo: String,
    pass: String,
    maps: [{type: mongoose.Schema.Types.ObjectId, ref: "Map"}]
});

var mapSchema = mongoose.Schema({
    name: String,
    description: String,
    created: Date,
    lastUpdate: Date,
    size: Number,
    value: [String],
    extension: String,
    madeBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
});

var User = mongoose.model("User", userSchema);
var Map = mongoose.model("Map", mapSchema);

module.exports.User = User;
module.exports.Map = Map;