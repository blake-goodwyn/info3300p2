from imdb import IMDb
import xmltodict,json
ia = IMDb(accessSystem='http')

oscars2015 = ["The Big Short", "Bridge of Spies", "Brooklyn","Mad Max: Fury Road", "The Martian", "The Revenant", "Room", "Spotlight"]
#anderson = ["The Grand Budapest Hotel", "Moonrise Kingdom", "The Royal Tenenbaums", "The Life Aquatic with Steve Zissou", "Fantastic Mr. Fox", "Rushmore", "The Darjeeling Limited", "Bottle Rocket", "Hotel Chevalier", "Castello Cavalcanti", "The Squid and The Whale"]
#nolan = ["Interstellar","The Dark Knight Rises","Inception","The Dark Knight","The Prestige","Batman Begins","Insomnia","Memento","Following","Doodlebug"]
#dreamworks = ["How To Train Your Dragon","How To Train Your Dragon 2","Kung Fu Panda","Kung Fu Panda 2","Kung Fu Panda 3", "Shrek","Shrek 2","Shrek the Third", "Madagascar","Shark Tale","Over the Hedge"]
oscars2014 = ["Philomena","Nebraska","Captain Phillips","The Wolf of Wall Street","12 Years a Slave","Her","Gravity","American Hustle","Dallas Buyers Club"]
oscars2013 = ["Silver Linings Playbook","Amour","Django Unchained","Zero Dark Thirty","Lincoln","Life of Pi","Argo","Les Miserables","Beasts of the Southern Wild"]
output = []
for i in oscars2013:
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