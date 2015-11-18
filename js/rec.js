var itemsCache = {};

function recommend(myMovies, callback) {
    itemsCache = {};
    var exclude = myMovies["liked"].concat(myMovies["disliked"], myMovies["saved"]);
    
    var movies = db().order("PopularityScore desc").limit(2000);
    console.log(movies.count());
    var result = movies.get();
    
    var cleanResults = [];
    for(var i = 0; i < result.length; i++) {
        if(exclude.indexOf(result[i].MovieID) == -1) {
            cleanResults.push(result[i]);
        }
    }
    callback(getBestMovie(cleanResults, myMovies));
}

function getBestMovie(movies, choices) {
    var bestID = 0;
    for(var i in movies) {
        if(i % 200 == 0) console.log(i);
        movies[i]["Score"] = getMovieScore(movies[i], choices);
        if(movies[i]["Score"] > movies[bestID]["Score"]) {
            console.log(movies[i]["Score"] + " over " + movies[bestID]["Score"]);
            bestID = i;
        }
    }
    console.log(movies[bestID]);
    return movies[bestID];
}

function getMovieScore(movie, choices) {
    var actScore = listScore(movie, choices, "Actors");
    var genScore = listScore(movie, choices, "Genres");
    var popScore = movie["PopularityScore"];
    
    var result = 100 * actScore + 200 * genScore;// + 40 * popScore; - turns out it works pretty well without pop score
    return result;
}

function listScore(movie, choices, key) {
    var score = 0;
    var list = JSON.parse(movie[key]);
    for(var i in list) {
        score += itemScore(list[i], choices, key);
    }
    return score;
}

function itemScore(item, choices, key) {
    if(!(item in itemsCache)) {
        var score = 0;
        var netOverlaps = 0;

        var scoring = {"liked":1, "disliked":-1};
        for(var movieType in scoring) {
            for(var i in choices[movieType]) {
                var currentMovie = db({"MovieID":choices[movieType][i]}).first();
                var items = JSON.parse(currentMovie[key])
                for(var j in items) {
                    if(items[j] == item) {
                        netOverlaps += scoring[movieType];
                    }
                }
            }
        }
        var result;
        if(netOverlaps > 0) {
            result = 100.0 - (70.0 / netOverlaps);
        }
        else if(netOverlaps < 0) {
            result = (-70.0 / netOverlaps) - 100.0;
        }
        else {
            result = 0;
        }
        itemsCache[item] = result;
        return result;
    }
    else {
        return itemsCache[item];
    }
}