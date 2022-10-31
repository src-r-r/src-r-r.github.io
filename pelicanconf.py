from pathlib import Path
from putty.pelican.plugins import putty
import random

HERE = Path(__file__).parent.resolve()
PELICAN_THEMES = HERE / "pelican-themes"
CUSTOM_THEMES = HERE / "custom-themes"

AUTHOR = 'Jordan Hewitt'
AUTHOR_ROLE = 'Professional Creation Leader, Senior Full Stack Lead'
SITENAME = 'Damn Good Products'
SITEURL = ''

PATH = str(HERE / 'content')

PAGE_PATHS = ["pages",]

TIMEZONE = 'America/Los_Angeles'

DEFAULT_LANG = 'en'

_ALL_THEMES = [td for td in PELICAN_THEMES.glob("*") if td.is_dir()]
chosen = random.choice(_ALL_THEMES)
# print(f"Using theme '{chosen}'")
# THEME = PELICAN_THEMES / chosen

THEME = CUSTOM_THEMES / "putty2"
print(f"Theme is {THEME}")

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Blogroll
LINKS = (('Pelican', 'https://getpelican.com/'),
         ('Python.org', 'https://www.python.org/'),
         ('Jinja2', 'https://palletsprojects.com/p/jinja/'),
         ('You can modify those links in your config file', '#'),)

# Social widget
SOCIAL = (('Twitter', 'https://twitter.com/DamnGoodTek'),
          ('LinkedIn', 'https://www.linkedin.com/in/jordan-h-a78122163/'),)

DEFAULT_PAGINATION = 10

PLUGINS = [putty,]

M = putty.NavMenu
I = putty.NavItem

FEEDS = {
    "DGT_MEDIUM": "https://medium.com/feed/@damngoodtech",
}

MENU = M("",
    I("Home", "/"),
    M("Tech Services &amp; Products",
        I("How I Help You", "pages/software-services.html"),
        I("Schedule a Consultation", "https://damngood.tech/schedule"),
        I("GumRoad", "https://damngood.gumroad.com/"),
        I("Complete User Interface Guide", "https://damngood.gumroad.com/l/tscup"),
    ),
    M("Free Tech Resources", 
        I("Tech Blog", "https://medium.com/@damngoodtech"),
        I("GitHub", "https://github.com/src-r-r"),
        I("GitLab", "https://gitlab.com/srcrr"),
    ),
    M("Creative Products &amp; Services",
        I("Cuples - Holiday", "pages/cuples.html"),
        I("Photography", "photography.html"),
        I("Short Fiction", "https://write.as/silent-gift"),
        I("Inherited Kingship", "https://InheritedKingship.write.as"),
        I("Photography", "pages/photography.html"),
        I("Rewrite Your Past", "pages/rewrite-your-past.html"),
        I("Write Your Future", "pages/write-your-future.html"),
    ),
    # I("Articles", "https://medium.com/@DamnGoodTech"),
    # I("Free Software Resources", "pages/free-software-resources.html"),
    # I("Photography", "pages/photography.html"),
    # I("Physical Products", "page/physical-products.html"),
)

# Uncomment following line if you want document-relative URLs when developing
RELATIVE_URLS = True
