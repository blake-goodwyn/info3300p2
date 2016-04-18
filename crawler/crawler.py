from bs4 import BeautifulSoup
import urllib
import nltk
import re
from pprint import pprint
import csv
from collections import OrderedDict

key_words = ["Personality", "Powers and abilities", "Possessions", "Alignment"]

char_list = open('char_list.txt', 'r')
info = OrderedDict()
count_char = 1
print "fdjkldsfj"
with open('zootopia_raw2.csv', 'w') as csvfile:
    # Write CSV Header
    fieldnames = list(key_words)
    fieldnames.insert(0, 'Name')

    writer = csv.DictWriter(csvfile, fieldnames=fieldnames) 
    writer.writeheader()

    # Scraping the web pages
    for url in char_list:  
        page = urllib.urlopen(url)
        soup = BeautifulSoup(page.read())
        # Find character information
        info['Name'] = url.split('/')[-1].replace('_',' ')
           


        # #for word in key_words:
        #     keys = soup.find(text=word)

        #     if keys is not None:
        #         parent = keys.find_parent("td")
        #         if parent is not None:
        #             value = parent.find_next_sibling("td").get_text()
        #             if '{{{' in value:
        #                 info[word] = ''
        #             else:
        #                 info[word] = value
        #         else:
        #             info[word] = ''
        #     else:
        #         info[word] = ''

        try:
            info["Personality"] = str(soup.find("h3", class_ = "pi-data-label pi-secondary-font", text = "Personality").find_next_sibling("div").get_text())
        except:
            info["Personality"] = ""
        try:
            writer.writerow(info)
        except:
            continue
        # print "Crawled {0} characters".format(count_char)
        count_char += 1
        
char_list.close()
print "Processing completed"