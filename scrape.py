import requests
from bs4 import BeautifulSoup
import argparse
from utils.utils import *
from firebase import firebase
from urllib.parse import quote_plus
import base64


class Scraper():
    """
    Web scraper designed to crawl sub-paths, index keywords, and store data in a database.

    Args:
        base_url (str): The starting point for the web crawl.
        url_limit (int, optional): Maximum number of URLs to explore. Defaults to None (no limit).
        fb_con: An instance of a Firebase connection object.
        url_set (set, optional): Set containing discovered URLs. Defaults to None (empty set).

    Attributes:
        base_url (str): The base URL for crawling.
        url_limit (int): Maximum number of URLs to explore.
        url_set (set): Set containing discovered URLs.
        fb_con: Firebase connection object.
        word_dict (dict): Dictionary mapping keywords to sub-dictionaries of base64 encoded URLs and their word frequencies.

    Methods:
        fetch_page(url: str) -> Optional[BeautifulSoup]:
            Downloads and parses HTML content from a URL. Returns BeautifulSoup object or None on failure.

        check_url_limit_exceeded(self) -> bool:
            Checks if the URL limit has been reached.

        get_sub_paths(self, url: str):
            Performs depth-first search, extracting and adding valid sub-paths within the base URL domain to the url_set. Stops if URL limit is reached.

        build_word_dict(self):
            Iterates through URLs, extracts keywords using index_words (external function), and builds word_dict with word frequencies for each URL. Sorts URL entries within each word sub-dictionary by frequency.

        push_to_db(self):
            Pushes keyword-URL associations with frequencies to a Firebase database using the provided fb_con object and database_node path.

        run(self):
            Executes the entire scraping process by calling get_sub_paths, build_word_dict, and push_to_db methods sequentially.

    """
    def __init__(self, base_url, fb_con, url_limit: int = None, url_set: set = None):
        self.base_url = base_url
        self.url_limit = url_limit
        self.url_set = url_set if url_set else set()
        self.fb_con = fb_con
        self.word_dict = {}

    def fetch_page(self, url: str):
        """
        Downloads and parses HTML content from a URL using requests and BeautifulSoup.

        Args:
            url (str): The URL to fetch.

        Returns:
            Optional[BeautifulSoup]: The parsed BeautifulSoup object or None on failure.
        """
        response = requests.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            return soup
        else:
            return None

    def check_url_limit_exceeded(self):
        """
        Checks if the URL limit has been reached.

        Returns:
            bool: True if URL limit is reached, False otherwise.
        """
        if self.url_limit is not None and len(self.url_set) >= self.url_limit:
            return True

        return False

    def get_sub_paths(self, url: str):
        """
        Performs a depth-first search starting from the given URL, extracting and adding valid sub-paths within the base URL domain to the url_set. Stops if URL limit is reached.

        Args:
            url (str): The starting URL for the sub-path search.
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
        """
        Iterates through collected URLs, extracts keywords using index_words (external function), and builds the word_dict by storing word frequencies for each discovered URL. 
        Sorts URL entries within each word sub-dictionary by frequency in descending order.
        Important note - word_dict that is being build with the url encoded with base64 encoding - for integrating with firebase limitations
        """
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
        """
        Pushes keyword-URL associations with frequencies to a Firebase database using the provided fb_con object and database_node path.
        This method assumes the existence of a `FBconn` class with a `post` method that accepts a database node path and data to push.

        Raises:
            Exception: If an error occurs during the database push operation.
        """
        database_node = '/test'
        data = { word: { 'DocsIDs': url_dict } for word, url_dict in self.word_dict.items() }
        FBconn.post(database_node, data)

    def run(self):
        """
        Executes the entire scraping process by calling get_sub_paths, build_word_dict, and push_to_db methods sequentially.
        """
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

    scraper = Scraper(base_url=base_url, fb_con=FBconn, url_limit=args.url_limit)
    scraper.run()

