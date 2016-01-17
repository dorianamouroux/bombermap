var fs = require("fs");

function createStringMap(map) {
    var res = "/map\n";

    for (var i = 0; i < map.size; i++) {
        for (var j = 0; j < map.size; j++) {
            res += map.value[i][j];
        }
        res += '\n';
    }
    res += "/endmap\n";
    return (res)    
}

function createFile(map) {
    var mapString = createStringMap(map),
        nameFile = __dirname + '/../../maps/' + map.name + '.map';

    fs.writeFile(nameFile, mapString, function (err) {
        if (err)
            console.log(err);
    });
};

module.exports.createFile = createFile;