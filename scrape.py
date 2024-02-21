import requests
from bs4 import BeautifulSoup
import argparse
from utils.utils import *
from firebase import firebase
from urllib.parse import quote_plus
import base64


class Scraper():
    def __init__(self, base_url, url_limit: int, fb_con, url_set: set = None):
        self.base_url = base_url
        self.url_limit = url_limit
        self.url_set = url_set if url_set else set()
        self.fb_con = fb_con
        self.word_dict = {}

    def fetch_page(self, url: str):
        response = requests.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            return soup
        else:
            return None

    def check_url_limit_exceeded(self):
        if self.url_limit is not None and len(self.url_set) >= self.url_limit:
            return True

        return False

    def get_sub_paths(self, url: str):
        # pseudo code #
        """
        define mutable set call url_set = set()
        start recursive call from main page and generate a list of nvidia paths.
        iterate through sub-paths, for each sub-path:
        if in set:
            pass
        else:
            add it to set
            call the recursive function on it
        """
        # Add current URL if soup was not None
        self.url_set.add(url)

        if self.check_url_limit_exceeded():
            return

        # Extract all URLs mentioned in this page, if soup is none - notift and delete url from set
        soup = self.fetch_page(url)
        if soup == None:
            print(f"Beautiful Soup for {url} was None")
            self.url_set.remove(url)
            return

        discoveder_links = soup.find_all('a', href=True)

        for link in discoveder_links:
            if self.check_url_limit_exceeded():
                return

            discovered_url = link.get('href')
            if self.base_url not in discovered_url:
                continue

            if discovered_url not in self.url_set:
                self.url_set.add(discovered_url)
                self.get_sub_paths(discovered_url)

    def build_word_dict(self):
        # organize the data in the self.word_dict dictionary
        for url in self.url_set:
            soup = self.fetch_page(url)
            url_word_dict = index_words(soup)
            for word in url_word_dict:
                encoded_url = base64.b64encode(url.encode()).decode()
                self.word_dict[word] = self.word_dict.get(word, {})
                self.word_dict[word][encoded_url] = self.word_dict[word].get(
                    encoded_url, 0) + url_word_dict[word]

        # sort every word's url dictionary by occurence number
        for word, url_dict in self.word_dict.items():
            sorted_urls = sorted(
                url_dict.items(), key=lambda x: x[1], reverse=True)
            self.word_dict[word] = dict(sorted_urls)

    def push_to_db(self):
        database_node = '/test'
        # data = { 'world': {'DocsIDs': {'https://www.nvidia.com/en-us/': 12}}} - this is invalid
        data = { word: { 'DocsIDs': url_dict } for word, url_dict in self.word_dict.items() }
        # key = 'word'
        # data = { key: { 'DocsIDs': {'url1': 5, 'url2': 6} } } 
        result = FBconn.post(database_node, data)

    def run(self):
        self.get_sub_paths(self.base_url)
        self.build_word_dict()
        self.push_to_db()


def get_args():
    parser = argparse.ArgumentParser(description='Nvidia Scraper')
    parser.add_argument('--url-limit', help='Input file path',
                        type=int, required=False, default=None)
    args = parser.parse_args()

    return args


if __name__ == '__main__':
    args = get_args()

    base_url = 'https://www.nvidia.com/en-us/'
    FBconn = firebase.FirebaseApplication(
        'https://class-presentation-79426-default-rtdb.europe-west1.firebasedatabase.app/', None)

    scraper = Scraper(base_url, args.url_limit, FBconn)
    scraper.run()

    # with open('urls.txt', 'w') as file:
    #     for url in url_set:
    #         file.write(f"{url},")
