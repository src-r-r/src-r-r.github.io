import typing as T
from pelican import (signals, PagesGenerator)
from pelican.contents import Page
from pelican.settings import get_jinja_environment
import logging
from jinja2 import (Environment as JinjaEnv)
from jinja2.exceptions import TemplateNotFound
from pathlib import Path
from requests import get
from rss_parser import Parser
import abc
log = logging.getLogger(__name__)

class Navable:
    pass
class NavItem(Navable):

    is_item = True

    def __init__(self, title : T.AnyStr, url : T.AnyStr):
        self.title = title,
        self.url = url
    
    """ True if an item is a child of a menu. """
    def __lt__(self, o : T.Any):
        if not isinstance(o, NavMenu):
            return False
        return self in o
    

    def __str__(self):
        return f"<I title='{self.title}', url='{self.url}'>"

    def __repr__(self):
        return str(self)
    
    def check(self, valid_urls : T.Iterable[T.AnyStr]):
        for url in valid_urls:
            if url == self.url:
                return True
        raise RuntimeError(f"URL for {self} does not match any valid page URLs {valid_urls}")

class NavMenu(Navable):

    is_item = False

    def __init__(self, title : T.AnyStr = None, *navables : T.Iterable[Navable]):
        self.title = title
        self.items = navables
    
    def __str__(self):
        _typ = str(type(self))
        _ttl = f" title={self.title}" if self.title else ""
        _items = ", ".join([str(i) for i in self])
        return f"<M{_ttl} items=({_items})>"
    
    def __repr__(self):
        return str(self)
    
    def check(self, valid_urls):
        for i in self.items:
            i.check(valid_urls)
class ExternalFeed:
    """ Adds a widget of latest entries to the page.
    """

    def __init__(self, feed_url : T.AnyStr):
        self.feed_url = feed_url
        self.feed = None
        
    def fetch(self):
        xml = get(self.feed_url)
        parser = Parser(xml=xml.content)
        self.feed = parser.parse()

def has_prefixes(prefixes : T.Iterable[T.AnyStr], path : Path):
    return any([
        str(path).startswith(str(Path(pfx))) for pfx in prefixes
    ])

def construct_nav(pgen : PagesGenerator, *args, **kwargs):
    valid_urls = [p.url for p in pgen.pages]
    MENU =  pgen.context.get("MENU")
    if not MENU:
        return
    log.info("Checking valid urls %s", valid_urls)
    # MENU.check(valid_urls)

def get_feeds(pgen : PagesGenerator):
    FEEDS = pgen.settings.get("FEEDS")
    if not FEEDS:
        return
    feeds = {}
    default_name = "external_feed.html"
    env : JinjaEnv = get_jinja_environment(pgen.settings)
    # for (label, url) in FEEDS.items():
    #     feed = ExternalFeed(url)
    #     feed.fetch()
    #     feeds[label] = feed

    #     special_name = f"external_feed_{label}.html"

    #     default_tpl = None
    #     special_tpl = None
    #     delayed = None

    #     try:
    #         default_tpl = env.get_template(default_name)
    #         special_tpl = env.get_template(special_name)
    #     except TemplateNotFound as e:
    #         delayed = e
        
    #     tpl = default_tpl or special_tpl
    #     if not tpl:
    #         raise TemplateNotFound(f"{default_name} or {special_name}")
        
    #     tpl.render(
    #         feed=feed
    #     )


def register():
    signals.page_generator_finalized.connect(construct_nav)
    signals.generator_init.connect(get_feeds)
    # signals.page_generator_write_page.connect(inject_feeds)