var db = null;

var initCallback = function(data) {
    console.log(typeof(data))
    console.log("about to store db");
    //data = JSON.parse(data);
    console.log("parsed to JSON");
    db = TAFFY(data);
    console.log("declared taffy database");
};

$(document).ready(function() {
    initDatabase(initCallback);
});

function initDatabase(callback) {
    if(!localStorage["moviesData"]) {
        console.log("loading...");
        httpGetAsync("js/movies.json", function(text) {
            console.log("loaded.");
            localStorage["moviesData"] = text;
            callback(text);
        });
    }
    else {
        console.log("just using local storage...");
        callback(localStorage["moviesData"]);
    }
}

var MoviesAPI = {
    getChoices: function() {
        return {"Length":8};
    }
}

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}