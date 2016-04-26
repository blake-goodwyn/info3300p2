from imdb import IMDb
import xmltodict,json
ia = IMDb(accessSystem='http')

oscars2016 = ["The Big Short", "Bridge of Spies", "Brooklyn","Mad Max: Fury Road", "The Martian", "The Revenant", "Room", "Spotlight"]
oscars2015 = ["Whiplash","American Sniper","Birdman","The Grand Budapest Hotel","The Imitation Game","Selma","The Theory of Everything","Boyhood"]
oscars2014 = ["Philomena","Nebraska","Captain Phillips","The Wolf of Wall Street","12 Years a Slave","Her","Gravity","American Hustle","Dallas Buyers Club"]
oscars2013 = ["Silver Linings Playbook","Amour","Django Unchained","Zero Dark Thirty","Lincoln","Life of Pi","Argo","Les Miserables","Beasts of the Southern Wild"]
oscars2012 = ["The Descendants","The Artist","Extremely Loud and Incredibly Close","Moneyball","Midnight in Paris","War Horse","The Tree of Life","Hugo","The Help"]
output = []
for i in oscars2012:
    if i == "Following":
        curMovieID = (ia.search_movie(i))[1].getID()
    else:
        curMovieID = (ia.search_movie(i))[0].getID()
    movie = ia.get_movie(curMovieID)
    profile = {}
    profile['data'] = {}
    profile['movie'] = movie.get('title')
    params = ['votes','rating','runtimes','year','director','cover url']
    for j in params:
        if movie.has_key(j):
            tempDict = xmltodict.parse(movie.getAsXML(j))
            if j == 'runtimes':
                profile['data'][j] = {}
                profile['data'][j]['text'] = tempDict[j]['item']
            elif j == 'director':
                profile['data'][j] = {}
                profile['data'][j]['text'] = tempDict[j]['person']
            elif j == 'cover url':
                profile['data']['cover'] = {}
                profile['data']['cover']['url'] = movie.get(j)
                profile['data']['cover']['w'] = 95
                profile['data']['cover']['h'] = 140
            else:
                profile['data'][j] = {}
                profile['data'][j]['text'] = tempDict[j]['#text']

    print profile['movie']
    profile['data']['grossDom'] = {}
    profile['data']['grossDom']['text'] = input("Domestic Gross: ")
    profile['data']['grossWorld'] = {}
    profile['data']['grossWorld']['text'] = input("International Gross: ")
    profile['data']['rt'] = {}
    profile['data']['rt']['text'] = input("Rotten Tomatoes: ")


    print profile
    output.append(profile)

print json.dumps(output)