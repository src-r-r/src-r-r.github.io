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
from pelican.tests.support import (
    module_exists,
    get_settings,
    get_context,
)

import putty

M = putty.NavMenu
I = putty.NavItem


HERE = Path(__file__).parent.resolve()
TEST_CONTENT = HERE / "test-content"
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


if __name__ == '__main__':
    unittest.main()