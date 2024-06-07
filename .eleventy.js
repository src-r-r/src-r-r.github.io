const { dirname, join } = require("path");

const MAX_ARTICLES = 10;

const PROJECT = dirname(__filename);
const TEMPLATES = join(PROJECT, "templates");
const DGTSTATIC_TEMPLATES = join(TEMPLATES, "dgtstatic");
const PAGES = join(PROJECT, "pages");
const OUTPUT = join(PROJECT, "output");
const STATIC = join(PROJECT, "static");

const PAGES_PATTERN = join(PAGES, "**/*.liquid");
const LIQUID_REGEX = /\.(liquid)$/

module.exports = function(eleventyConfig) {

    const mediumData = require("./_data/medium.json").filter((_, i) => i < MAX_ARTICLES);
    const rumbleData = require("./_data/rumble.json").filter((_, i) => i < MAX_ARTICLES);
    const content = {
        medium: {
            title: "Medium Articles",
            data: mediumData,
        },
        rumble: {
            title: "Videos",
            data: rumbleData,
        }
    }

    eleventyConfig.addWatchTarget(join(OUTPUT, "static", "**/*.css"));
    
    eleventyConfig.addGlobalData("content", content);

    return {
        dir: {
            input: PAGES,
            includes: join("..", "templates"),
            output: OUTPUT,
        }
    }
}