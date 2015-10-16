import json

with open("movies-old.json", "r") as f:
    movies=f.read().replace('\n', '')
    
movies = json.loads(movies)
keys = []

print movies[:1]
for i in range(0, len(movies)):
    if movies[i]["MetaData"]:
        keys = []
        for key, value in json.loads(movies[i]["MetaData"]).items():
            movies[i][key] = value
            keys.append(key)
    else:
        for key in keys:
            movies[i][key] = None
    del movies[i]["MetaData"]
    
    if movies[i]["Title"] == None:
        movies[i]["Title"] = ""
        
print "\n\n", movies[:1]

result = json.dumps(movies)

f = open("movies-new.json", "w")
f.write(result)
f.close()