var cmdTCP = require("./tcp/cmd")

var cmd = [
    {name: "map", func: cmdTCP.sendMap}
];

function handleRequest(str, client) {
    var split = str.split(" ");

    for (var i = 0; i < cmd.length; i++) {

        if (cmd[i].name == split[0]) {
            cmd[i].func(split, client);
            return (true);
        }
    }
    return (false);
}

module.exports = function() {
    // function when a client connect
    return (function(c) {

        console.log('client connected');

        // function when a client send shit
        c.on('data', function(data) {

            var str = data.slice(0, -1).toString();

            if (handleRequest(str, c) == false) {
                c.write("Error : bad command\n");
            }
        });

        // when a client disconnect
        c.on('end', function() {
            console.log('client disconnected');
        });

        c.on('error', function(err) {});
    });
}