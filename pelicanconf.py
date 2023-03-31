from pathlib import Path
HERE = Path(__file__).parent.resolve()
import sys
sys.path.append(str(HERE))
from putty.pelican.plugins import putty
sys.path.pop()
import random

PELICAN_THEMES = HERE / "pelican-themes"
CUSTOM_THEMES = HERE / "custom-themes"

AUTHOR = 'Jordan Hewitt'
AUTHOR_ROLE = 'Professional Creation Leader, Senior Full Stack Lead'
SITENAME = 'Damn Good Products'
SITEURL = 'https://damngood.tech'

PATH = str(HERE / 'content')

STATIC_PATHS = ["extra", "images"]
EXTRA_PATH_METADATA = {'extra/CNAME': {'path': 'CNAME'}, }

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

# Ignores html files.
READERS = {
    "html": None,
}

FEED_OUTPUT_DIR = "external_feeds"

MENU = M("",
    I("Home", "/"),
    M("Tech Services &amp; Products",
        I("How I Help You", "pages/software-services.html"),
        I("Schedule a Consultation", "mailto:jordan@damngood.tech"),
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
        I("Photography", "https://loox1.onrender.com"),
        I("Short Fiction", "https://write.as/silent-gift"),
        I("Inherited Kingship", "https://InheritedKingship.write.as"),
        I("Rewrite Your Past", "pages/rewrite-your-past.html"),
        I("Write Your Future", "pages/write-your-future.html"),
    ),
    M("Hire Me",
        I("On UpWork", "https://www.upwork.com/freelancers/~0105fc69312e2da97a"),
        I("On Perfectlancer", "https://www.perfectlancer.com/freelancer/profile/594m8o9e6o08"),
        I("On Guru", "https://www.guru.com/freelancers/jordan-hewitt"),
        I("Directly", "mailto:jordan@damngood.tech"),
    )
    # I("Articles", "https://medium.com/@DamnGoodTech"),
    # I("Free Software Resources", "pages/free-software-resources.html"),
    # I("Photography", "pages/photography.html"),
    # I("Physical Products", "page/physical-products.html"),
)

# Uncomment following line if you want document-relative URLs when developing
RELATIVE_URLS = True
