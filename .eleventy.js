const { readFileSync } = require("fs");
const { glob } = require("glob");
const { dirname, join, resolve } = require("path");

const MAX_ARTICLES = 10;

const PROJECT = dirname(__filename);
const TEMPLATES = join(PROJECT, "templates");
const DGTSTATIC_TEMPLATES = join(TEMPLATES, "dgtstatic");
const PAGES = join(PROJECT, "pages");
const OUTPUT = join(PROJECT, "output");
const STATIC = join(PROJECT, "static");
const TABLER = join(PROJECT, "node_modules", "@tabler", "icons", "icons")

const PAGES_PATTERN = join(PAGES, "**/*.liquid");
const LIQUID_REGEX = /\.(liquid)$/

module.exports = function(eleventyConfig) {

    const mediumData = require("./_data/medium.json").filter((_, i) => i < MAX_ARTICLES);
    const rumbleData = require("./_data/rumble.json").filter((_, i) => i < MAX_ARTICLES);
    const projects = require("./_data/projects.json");
    const content = {
        medium: {
            title: "Medium Articles",
            data: mediumData,
        },
        rumble: {
            title: "Videos",
            data: rumbleData,
        },
    }

    const skills = require("./_data/software_skills.json");
    eleventyConfig.addGlobalData("skills", skills);

    eleventyConfig.addWatchTarget(join(OUTPUT, "static", "**/*.css"));
    
    eleventyConfig.addGlobalData("content", content);
    eleventyConfig.addGlobalData("projects", projects);

    eleventyConfig.addShortcode("icon", function(name, style = null) {
        try {
            if (!style) {
                return readFileSync(glob.globSync(join(TABLER, "**", `${name}.svg`))[0]);
            }
            return readFileSync(resolve(TABLER, style, `${name}.svg`));
        } catch (err) {
            console.error(err)
        }
    });

    return {
        dir: {
            input: PAGES,
            includes: join("..", "templates"),
            output: OUTPUT,
        }
    }
}