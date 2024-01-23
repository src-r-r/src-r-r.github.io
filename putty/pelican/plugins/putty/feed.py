import importlib.machinery
import importlib.util
from pathlib import Path
from bs4 import BeautifulSoup
import xml
import typing as T
import xml.etree.ElementTree as ET
from datetime import datetime
# try:
#     import requests_cache as requests
# except ImportError as err:
#     import requests
import logging
log = logging.getLogger(__name__)

import requests

HERE = Path(".").resolve()

def textif(tree : ET, xpath : T.AnyStr):
    el = tree.find(xpath)
    if el is not None:
        return el.text

def parse_item_date(text : T.AnyStr, dtformat="%a, %d %b %Y %H:%M:%S %Z"):
    return datetime.strptime(text, dtformat)

HEADERS = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}

class Cleaner:
    
    def clean(self, item : "Item"):
        raise NotImplementedError

class MediumCleaner(Cleaner):
    
    def __init__(self, summary_length=400):
        self.summary_length = summary_length
    
    def clean(self, item : "Item"):
        soup = BeautifulSoup(item.description or item.encoded, features="lxml")
        img = soup.find("img")
        img = img["src"] if img else None
        text = soup.text
        if len(text) > self.summary_length:
            text = text[:self.summary_length] + "..."
        item.description = text
        item.image = img
        
        return item

class Item:
    
    def __init__(self, title, image, description, encoded, link, categories, pubdate):
        self.title = title
        self.link = link
        self.categories = categories
        self.description = description
        self.encoded = encoded
        self.image = image
        self.pubdate = pubdate
    
    def __str__(self):
        return "<Item title: '%s', link: '%s', categories: %s>" % (self.title, self.link, self.categories)
    
    @classmethod
    def from_element(cls, node : ET.Element):
        title = textif(node, "title")
        description = textif(node, "description")
        encoded = textif(node, './/{http://purl.org/rss/1.0/modules/content/}encoded')
        link = textif(node, "link")
        image = textif(node, "image")
        categories = [c.text for c in node.findall(".//category")]
        pubdate = textif(node, "pubDate")
        pubdate = parse_item_date(pubdate) if pubdate else None
        
        return cls(title, image, description, encoded, link, categories, pubdate)
    
    def when(self, dtformat : T.AnyStr):
        return self.pubdate.strftime(dtformat)

class Feed:

    def __init__(self, title : T.AnyStr, description : T.AnyStr, link : T.AnyStr, items : T.Iterable[Item]):
        self.title = title
        self.description = description
        self.link = link
        self.items = items
    
    def __str__(self):
        return "<Feed title: '%s', description: '%s', link: '%s', items: [%s items]>" % (self.title, self.description, self.link, len(self.items))

    @classmethod
    def from_etree(cls, tree: ET):
        title = textif(tree, ".//title")
        desc = textif(tree, ".//description")
        link = textif(tree, ".//link")
        items = [Item.from_element(xitem) for xitem in tree.findall(".//item")]
        return cls(title, desc, link, items)
    
    @classmethod
    def from_text(cls, text : T.AnyStr):
        et = ET.fromstring(text)
        return cls.from_etree(et)
    
    @classmethod
    def from_url(cls, url : T.AnyStr, use_cached=True):
        if use_cached and hasattr(requests, "CachedSession"):
            session = requests.CachedSession("putty_rss")
        else:
            session = requests.Session()
        
        resp = requests.get(url, headers=HEADERS)
        resp.raise_for_status()
        
        return cls.from_text(resp.text)

    def clean(self, cleaner : Cleaner):
        self.items = [
            cleaner.clean(i)
            for i in self.items
        ]