function recommend(myMovies) {
    var exclude = myMovies["liked"].concat(myMovies["disliked"], myMovies["saved"]);
    
    var movies = db().order("PopularityScore desc").limit(5000);
    console.log(movies.count());
    var result = movies.get();
    
    for(var i = 0; i < result.length; i++) {
        if(exclude.indexOf(result[i].MovieID) == -1) {
            return result[i];
        }
    }
}