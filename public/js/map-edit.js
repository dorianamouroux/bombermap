var defaultItem,
    currentItem = 1,
    classBackground = ['floor', 'wall', 'wood'];

String.prototype.replaceAt = function(i, c) {
    return this.substr(0, i) + c + this.substr(i+c.length);
}

function deleteClassSelected(id) {
    var elem = document.getElementById(id);
    document.getElementById(id).className = elem.className.replace(new RegExp('\\bselected\\b'),'');
}

function addClassSelected(id) {
    var elem = document.getElementById(id);
    elem.className += " selected";
}

function selectItem(id) {
    deleteClassSelected("selector-" + currentItem); 
    
    if (currentItem < 0 || currentItem > 2)
        currentItem = defaultItem;
    currentItem = id;
    
    addClassSelected("selector-" + currentItem); 
}

function editSquare(x, y) {
    var div = document.getElementById("square-"+x+"-"+y);
    div.className = "square " + classBackground[currentItem];
    map[y] = map[y].replaceAt(x, currentItem + "");
}

function validate(form) {
    var res = JSON.stringify(map);
    form.map.value = res;
    return (true);
}

selectItem(1);