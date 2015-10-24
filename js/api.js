var db = null;
var myMovies = {"saved":[], "liked":[], "disliked":[]};

var initCallback = function(data) {
    db = TAFFY(data);
};

$(document).ready(function() {
    initDatabase(initCallback);
});

function initDatabase(callback) {
    if(localStorage["myMovies"]) {
        myMovies = JSON.parse(localStorage["myMovies"]);
    }
    
    
    if(!localStorage["moviesData"]) {
        httpGetAsync("js/movies.json", function(text) {
            localStorage["moviesData"] = text;
            callback(text);
        });
    }
    else {
        callback(localStorage["moviesData"]);
    }
}

var MoviesAPI = {
    getChoices: function() {
        var length = myMovies["liked"].length + myMovies["disliked"].length;
        return {"Length":length};
    },
    
    autoSuggest: function(text, callback) {
        var query = db().filter({Title:{likenocase:text}}).order("PopularityScore desc").limit(5).get();
        
        var result = [];
        for(var i in query) {
            var entry = query[i];
            result.push({"ID":entry.MovieID, "Name":entry.Title});
        }
        callback(result);
    },
    
    likeMovie: function(movieID, likesMovie, callback) {
        if(likesMovie == null) {
            myMovies["saved"].push(movieID);
        }
        else if(likesMovie === true) {
            myMovies["disliked"].push(movieID);
        }
        else {
            myMovies["liked"].push(movieID);
        }
        localStorage["myMovies"] = JSON.stringify(myMovies);
        callback();
    },
    
    resetUser: function(callback) {
        localStorage.removeItem("myMovies");
        callback();
    },
    
    getNextMovie: function(callback) {
        callback(recommend(myMovies));
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