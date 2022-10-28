# -*- coding: utf-8 -*-
"""Tests for webring plugin
Test Atom and RSS feeds have been generated using Pelican itself using the
contents of its `samples/content` folder.
"""
import unittest
import os
from collections import Counter
from operator import itemgetter, attrgetter
from pathlib import Path

from pelican.settings import DEFAULT_CONFIG
from pelican.generators import Generator, PagesGenerator
from jinja2 import Template
from pelican.writers import Writer
from shutil import rmtree
from pelican.tests.support import (
    module_exists,
    get_settings,
    get_context,
)

import putty

M = putty.NavMenu
I = putty.NavItem

class NullGenerator(Generator):
    pass

class NullWriter(Writer):
    pass

HERE = Path(__file__).parent.resolve()
TEST_CONTENT = HERE / "test-content"
TEST_OUTPUT = HERE / "test-output"
TEST_FEED_CONTENT = HERE / "test-feed-content"
TEST_FEED_OUTPUT = HERE / "test-feed-output"
FEED_TPL_1 = HERE / "test-feed-templates/feed1tpl.html"
MENU = M("",
    I("Home", "/"),
    I("Photography", "/photography"),
    M("Store",
        I("Physical Products", "/store/physical"),
    )
)
class TestPutty(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # putty.initialized(None)
        settings = {
            "PATH": str(TEST_CONTENT),
            "PLUGINS": [
                putty,
            ],
            "MENU": MENU,
        }
        putty.register()
        cls.settings = settings
        cls.generators = [PagesGenerator(
            get_context(cls.settings), get_settings(**cls.settings), TEST_CONTENT, '', '',),]

    def setUp(self):
        gen = self.generators[0].generate_context()

    def test_menu_construction(self):
        items = [i for i in MENU.items]
        assert "" not in items
        assert MENU.title == ""

class TestRssFeed(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        settings = {
            "PATH": str(TEST_FEED_CONTENT),
            "PLUGINS": [
                putty,
            ],
            "FEEDS": {
                "DJANGO_PROJECT": "https://www.djangoproject.com/rss/weblog/",
            },
        }
        putty.register()
        cls.settings = get_settings(**settings)
        cls.generators = [PagesGenerator(
            get_context(settings), cls.settings, TEST_FEED_CONTENT, '', '',),]
        cls.writers = [
            NullWriter(TEST_FEED_OUTPUT, cls.settings)
        ]
    
    def setUp(self):
        gen = self.generators[0]
        gen.generate_context()
        gen.pages = []
        gen.generate_output(self.writers[0])
    
    def tearDown(self):
        rmtree(str(TEST_FEED_OUTPUT.resolve()), ignore_errors=True)
    
    def test_rss_feed_filled(self):
        ctx = self.generators[0].context
        assert ctx.get("FEEDS")
        feed : putty.ExternalFeed = ctx["FEEDS"].get("DJANGO_PROJECT")
        assert feed
        assert feed.feed.title == "The Django weblog"
        assert len(feed.feed.feed) > 5

if __name__ == '__main__':
    unittest.main()