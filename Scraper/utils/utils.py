import requests
from bs4 import BeautifulSoup
import re
from nltk.stem import PorterStemmer


def fetch_page(url):
    response = requests.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        return soup
    else:
        return None

def index_words(soup):
    index = {}
    words = re.findall(r'\w+', soup.get_text())
    stop_words = {'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'is'}
    
    for word in words:
        if word in stop_words:
            continue
        word = word.lower()
        index[word] = index[word] + 1 if word in index else 1
    
    return index

def apply_stemming(index):
    stemmer = PorterStemmer()
    stemmed_index = {}
    for word, count in index.items():
        stemmed_word = stemmer.stem(word)
        if stemmed_word in stemmed_index:
            stemmed_index[stemmed_word] += count
        else:
            stemmed_index[stemmed_word] = count
    return stemmed_index

def search(query, index):
    stemmer = PorterStemmer()
    query_words = re.findall(r'\w+', query.lower())
    results = {}
    for word in query_words:
        word = stemmer.stem(word)
        if word in index:
            results[word] = index[word]
    return results
