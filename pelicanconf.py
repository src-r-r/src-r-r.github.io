from pathlib import Path
import random

HERE = Path(__file__).parent.resolve()
PELICAN_THEMES = HERE / "pelican-themes"
CUSTOM_THEMES = HERE / "custom-themes"

AUTHOR = 'Jordan Hewitt'
AUTHOR_ROLE = 'Professional Creation Leader'
SITENAME = 'Damn Good Products'
SITEURL = ''

PATH = 'content'

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

# Uncomment following line if you want document-relative URLs when developing
RELATIVE_URLS = True
