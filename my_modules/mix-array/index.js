module.exports = function (array) {
    var rand, save;
    for(var pos = array.length-1; pos >= 1; pos--){

        rand = Math.floor(Math.random() * (pos + 1));

        var save = array[pos];
        array[pos] = array[rand];
        array[rand] = save;
    }
    return (array);
};

