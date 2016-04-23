from imdb import IMDb
import xmltodict
import json
import collections

ia = IMDb()

skyfall = ia.get_movie('0830515')

votes = skyfall.getAsXML('votes')
votes = xmltodict.parse(votes)

rating = skyfall.getAsXML('rating')
rating = xmltodict.parse(rating)

runtimes = skyfall.getAsXML('runtimes')
runtimes = xmltodict.parse(runtimes)

year = skyfall.getAsXML('year')
year = xmltodict.parse(year)

director = skyfall.getAsXML('director')
director = xmltodict.parse(director)

cover = skyfall.getAsXML('cover')
cover = xmltodict.parse(cover)

data = collections.OrderedDict({'movie': str(skyfall), 'data': collections.OrderedDict({'votes': votes['votes'], 'rating':
rating['rating'], 'runtimes': runtimes['runtimes'], 'year': year['year'], 'director':
director['director'], 'cover': cover['cover-url']})})

print json.dumps(data)
