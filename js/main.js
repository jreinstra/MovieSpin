
var allowNextMovieInput = false;
var animationActive = false;
var moviesAdded = 0;

var addMovieCounter = -1;

var currentKey = null;

$(document).ready(function() {
    initMoviespin();
});

$("#openSaved").click(function() {
    var savedList = MoviesAPI.getSavedList();
    var savedListHTML = "<ul>";
    for(var i in savedList) {
        savedListHTML += '<li><a class="gotoMovie" id="' + savedList[i][0] + '">' + savedList[i][1] + '</a></li>';
    }
    savedListHTML += "</ul>";
    $("#savedMoviesList").html(savedListHTML);
    $("#openSaved, #innerBlock").hide();
    $("#savedMovies").show();
    
    // Re-add listeners for saved movies
    $(".gotoMovie").click(gotoMovieClicked);
});

$("#closeSaved").click(function() {
    $("#openSaved, #innerBlock").show();
    $("#savedMovies").hide();
});

function gotoMovieClicked(e) {
    $("#openSaved, #innerBlock").show();
    $("#savedMovies").hide();
    var movieID = e.currentTarget.id;
    fetchMovie(movieID);
}

function initMoviespin() {
    var result = MoviesAPI.getChoices();
    if(result["Length"] >= 5) {
        document.getElementById("welcomeDiv").style.display = "none";
        document.getElementById("welcomeBackDiv").style.display = "";
    }
    else if(result["Length"] > 0) {
        moviesAdded = result["Length"];
        var s = "s";
        if(5 - moviesAdded == 1) {
            s = "";
        }
        document.getElementById("addMovieText").placeholder = "Enter " + (5 - moviesAdded) + " movie" + s +" you like.";
    }
}

function keyPressed(keyID) {
	if(allowNextMovieInput == true && animationActive == false) {
		if(keyID == "Left") {
			swipeLeft();
		}
		else if(keyID == "Right") {
			swipeRight();
		}
		else if(keyID == "Enter" || keyID == "Down") {
			watchLater();
		}
	}
}

function addMovieKeyPressed(keyID) {
	var suggestions = document.getElementById("addMovieSuggestions").childNodes;
	if(suggestions.length > 0) {
		if(keyID == "Up" && addMovieCounter >= 0) {
			addMovieCounter--;
		}
		else if(keyID == "Down" && addMovieCounter < suggestions.length - 1) {
			addMovieCounter++;
		}
		else if(keyID == "Enter" && addMovieCounter != -1) {
			fireEvent(suggestions[addMovieCounter], "click");
			fireEvent(document.getElementById("addMovieButton"), "click");
		}
		
		if(addMovieCounter != -1) {
			suggestions[addMovieCounter].style.backgroundColor = "#333";
			if(addMovieCounter > 0) {
				suggestions[addMovieCounter - 1].style.backgroundColor = "rgba(52, 27, 43, 0.2)";
			}
			if(addMovieCounter < suggestions.length - 1) {
				suggestions[addMovieCounter + 1].style.backgroundColor = "rgba(52, 27, 43, 0.2)";
			}
		}
	}
}

function watchLater() {
	swipeDown((window.innerHeight), null, "1s");
}

function swipeLeft() {
	swipe(-(window.innerWidth), true, "1s");
}

function swipeRight() {
	swipe(window.innerWidth, false, "1s");
}

function swipe(xPos, likesMovie, duration) {
	animationActive = true;
	var tile = document.getElementById("innerBlock");
	animate(tile, xPos, duration, function() {
		if(xPos > 0) animate(tile, -xPos, "0s", null);
		likeMovie(document.getElementById("nextMovieID").value, likesMovie);
        nextMovie();
	});
}

function swipeDown(yPos, likesMovie, duration) {
	animationActive = true;
	var tile = document.getElementById("innerBlock");
	animateY(tile, yPos, duration, function() {
		animate(tile, -window.innerWidth, "0s", null);
		likeMovie(document.getElementById("nextMovieID").value, likesMovie);
		nextMovie();
	});
}

function animate(tile, xPos, time, callback) {
	move(tile)
		.x(xPos)
		.duration(time)
		.end();
	var timeMillis = 1000 * parseInt(time.substring(0, time.length - 1));
	setTimeout(callback, timeMillis);
}

function animateY(tile, yPos, time, callback) {
	move(tile)
		.y(yPos)
		.duration(time)
		.end();
	var timeMillis = 1000 * parseInt(time.substring(0, time.length - 1));
	setTimeout(callback, timeMillis);
}

var autoSuggest = debounce(function() {
	var keyID = currentKey;
	if(keyID != "Down" && keyID != "Up" && keyID != "Enter" && keyID != "Left" && keyID != "Right") {
		var text = document.getElementById("addMovieText").value;
		MoviesAPI.autoSuggest(text, function(result) {
			var suggestions = "";
			for(var i in result) {
				suggestions += "<li class=\"as-suggestion\" value=\"" + result[i]["ID"] + "\">" + result[i]["Name"] + "</li>";
			}
			document.getElementById("addMovieSuggestions").innerHTML = suggestions;
			addSuggestionListeners();
		});
		addMovieCounter = -1;
	}
}, 100);

function addSuggestionListeners() {
	var classname = document.getElementsByClassName("as-suggestion");
	 
	var suggestionClicked = function() {
		document.getElementById("addMovieID").value = this.getAttribute("value");
		document.getElementById("addMovieText").value = this.innerHTML;
		document.getElementById("addMovieSuggestions").innerHTML = "";
		document.getElementById("addMovieButton").style.display = "";
	};
	 
    for(var i=0;i<classname.length;i++){
        classname[i].addEventListener('click', suggestionClicked, false);
    }
}

function nextMovie() {
	document.getElementById("nextMovie").style.display = "none";
	document.getElementById("nextMovieLoading").style.display = "";
	
    setTimeout(function() {
        fetchMovie(null);
    }, 50);
}

function fetchMovie(movieID) {
    MoviesAPI.getNextMovie(movieID, function(result) {
		var title = result["Title"] + " (" + result["Year"] + ")";
		document.getElementById("nextMovieTitle").innerHTML = title;
		var titleFontSize = Math.floor(95.0/(title.length));
		if(titleFontSize > 7) titleFontSize = 7;
		document.getElementById("nextMovieTitle").style["font-size"] = titleFontSize + "vw";
        
        document.getElementById("nextMovieDescription").innerHTML = result["Description"];
        //http://www.imdb.com/title/
		//document.getElementById("nextMoviePoster").src = "/media/posters/" + result["MovieID"] + ".jpg";
        //document.getElementById("nextMoviePoster").src = "http://www.imdb.com/title/" + result["MovieID"] + "/";
        //console.log(httpGet("http://www.imdb.com/title/" + result["MovieID"] + "/"));
		document.getElementById("nextMovieID").value = result["MovieID"];
		document.getElementById("nextMovie").style.display = "";
		document.getElementById("nextMovieLoading").style.display = "none";
		
		document.getElementById("likeImg").style.display = "";
		document.getElementById("dislikeImg").style.display = "";
        document.getElementById("watchlaterImg").style.display = "";
		
		document.getElementById("nextMovieRating").innerHTML = result["Rating"];
		document.getElementById("nextMovieRuntime").innerHTML = result["Runtime"];
		
		var actors = JSON.parse(result["Actors"]);
		var actorsString = "";
		for(var i in actors) {
			actorsString += actors[i] + ", ";
		}
		actorsString = actorsString.substring(0, actorsString.length - 2);
		document.getElementById("nextMovieActors").innerHTML = actorsString;
		
		var genres = JSON.parse(result["Genres"]);
		var genreString = "";
		for(var i in genres) {
			genreString += genres[i] + ", ";
		}
		genreString = genreString.substring(0, genreString.length - 2);
		document.getElementById("nextMovieGenres").innerHTML = genreString;
		

		/*document.getElementById("referralLinks").innerHTML = "";
		if(metadata["NetflixID"]) {
			document.getElementById("referralLinks").innerHTML +=
				"<a class=\"button netflixButton\" target=\"_blank\" href=\"http://www.netflix.com/WiMovie/" + metadata["NetflixID"] + "\">View on Netflix</a>";
		}*/
		
		animate(document.getElementById("innerBlock"), 0, "0s", function() {
			animationActive = false;
		});
		allowNextMovieInput = true;
    });
}

function likeMovie(movieID, likesMovie) {
    if(likesMovie == null) {
        $("#openSaved").show();
    }
    
	MoviesAPI.likeMovie(movieID, likesMovie, function(result) {
		document.getElementById("addMovieButton").style.display = "none";
		document.getElementById("addMovieID").value = "";
		moviesAdded++;
		if(moviesAdded == 5) {
			document.getElementById("startForm").style.display = "none";
			document.getElementById("welcomeHeader").style.display = "none";
			nextMovie();
		}
		
		var s = "s";
		if(5 - moviesAdded == 1) {
			s = "";
		}
		document.getElementById("addMovieText").placeholder = "Enter " + (5 - moviesAdded) + " more movie" + s + ".";
		document.getElementById("addMovieText").value = "";
	}, false);
}

function apiCall(url, params, callback, jsonDecode) {
	callback = typeof callback !== 'undefined' ? callback : null;
	jsonDecode = typeof jsonDecode !== 'undefined' ? jsonDecode : null;
	if(callback != null) var async = true;
	else var async = false;
	
	
	url = baseUrl + "/api/" + url + ".php";
	console.log("url: " + url);
	
	var urlParams = "";
	if(params != null) {
		for(var index in params) {
			var value = params[index];
			urlParams = urlParams + index + "=" + value + "&";
		}
		urlParams = urlParams.substring(0, urlParams.length - 1);
	}
	var response = null;

	httpPost(url, urlParams, async, function(text) {
		response = text;
		if(callback != null) {
			if(response == null) {
				callback(null);
				return;
			}
			if(jsonDecode == null || jsonDecode == true) response = JSON.parse(response);
			callback(response);
			return;
		}
	});
	
	if(response == null) {
		return null;
	}
	
	response = JSON.parse(response);
	return response;
}


function httpPost(theUrl, params, async, callback) {
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    
    
    xmlHttp.onreadystatechange = function () {
    	//alert(xmlHttp.readyState);
    	if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
    		//localStorage["APIConnected"] = "true";
    		callback(xmlHttp.responseText);
    	}
    	else {
    		//localStorage["APIConnected"] = "false";
    		return;
    	}
	};
	
	xmlHttp.open( "POST", theUrl, async );
	xmlHttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	try {
		//alert(params);
		xmlHttp.send(params);
	} catch(error) {
		//localStorage["APIConnected"] = "false";
		//alert("Connection failed!");
		//alert(error);
	}
}

function fireEvent(element,event) {
   if (document.createEvent) {
       // dispatch for firefox + others
       var evt = document.createEvent("HTMLEvents");
       evt.initEvent(event, true, true ); // event type,bubbling,cancelable
       return !element.dispatchEvent(evt);
   } else {
       // dispatch for IE
       var evt = document.createEventObject();
       return element.fireEvent('on'+event,evt);
   }
}

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

document.addEventListener("keydown", function(data) {
	keyPressed(data.keyIdentifier);
});

document.getElementById("getStarted").addEventListener("click", function(data) {
	document.getElementById("welcomeDiv").style.display = "none";
	document.getElementById("startForm").style.display = "";
});

document.getElementById("getRestarted").addEventListener("click", function(data) {
	document.getElementById("welcomeBackDiv").style.display = "none";
	document.getElementById("welcomeHeader").style.display = "none";
    
    if(MoviesAPI.getSavedList().length > 0) {
        $("#openSaved").show();
    }
    
	nextMovie();
});

document.getElementById("addMovieText").addEventListener("keydown", function(data) {
	setTimeout(function () {
		currentKey = data.keyIdentifier;
		autoSuggest();
		addMovieKeyPressed(data.keyIdentifier);
	}, 10);
});

document.getElementById("addMovieButton").addEventListener("click", function(data) {
	likeMovie(document.getElementById("addMovieID").value, true);
});

document.getElementById("likeImg").addEventListener("click", function(data) {
	if(allowNextMovieInput == true && animationActive == false) {
		swipeLeft();
	}
});

document.getElementById("dislikeImg").addEventListener("click", function(data) {
	if(allowNextMovieInput == true && animationActive == false) {
		swipeRight();
	}
});

document.getElementById("resetUser").addEventListener("click", function(data) {
	document.cookie="RandKey=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
	MoviesAPI.resetUser(function() {
		location.reload();
	});
});

document.getElementById("watchlaterImg").addEventListener("click", function(data) {
	watchLater();
});