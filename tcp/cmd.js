var fs = require("fs"),
    patternName = /^[a-zA-Z]+$/,
    endCode =  new Buffer(1);

endCode[0] = 4;

function writeToClient(buff, client) {
    client.write(buff);
    client.write(endCode);
}

function sendMap(cmd, client) {
    if (cmd.length < 2) {
        writeToClient("Error : need one parameter\n", client);
        return ;
    }

    if (patternName.test(cmd[1]) == false) {
        writeToClient("Error : map name illegal\n", client);
        return ;
    }

    var path = __dirname + '/../maps/' + cmd[1] + '.map';

    fs.readFile(path, function (err, data) {
        console.log("Map " + cmd[1] + " envoyée");
        if (err) {
            if (err.code == 'ENOENT')
                writeToClient("Error : no such map on map server\n", client);
            else {
                writeToClient("Error : error on map server\n", client);
                console.log(err);
            }
        }
        else {
            writeToClient(data, client);
        }
    });
}

module.exports.sendMap = sendMap;