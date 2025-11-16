const { readFileSync } = require("fs");
const { glob } = require("glob");
const { dirname, join, resolve } = require("path");
const path = require("node:path")
const sass = require("sass")

const MAX_ARTICLES = 10;

const SRC = resolve(__dirname, "src")
const LAYOUTS = resolve(SRC, "layouts");
const DGTSTATIC_LAYOUT = resolve(LAYOUTS, "dgtstatic");
const PAGES = resolve(SRC, "pages");
const OUTPUT = resolve(__dirname, "_site");
// const STATIC = join(PROJECT, "static");
const TABLER = join(__dirname, "node_modules", "@tabler", "icons", "icons")

const PAGES_PATTERN = join(PAGES, "**/*.liquid");
const LIQUID_REGEX = /\.(liquid)$/

module.exports = function (eleventyConfig) {

    const mediumData = require("./_data/medium.json").filter((_, i) => i < MAX_ARTICLES);
    const rumbleData = require("./_data/rumble.json").filter((_, i) => i < MAX_ARTICLES);
    const youtubeData = require("./_data/youtube.json").filter((_, i) => i < MAX_ARTICLES);
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
        youtube: {
            title: "YouTube Videos",
            data: youtubeData,
        },
    }

    const skills = require("./_data/software_skills.json");
    eleventyConfig.addGlobalData("skills", skills);

    eleventyConfig.addTemplateFormats("sass", "scss", "liquid", "html", "js")

    // sass
    eleventyConfig.addExtension("scss", {
        outputFileExtension: "css",

        // opt-out of Eleventy Layouts
        useLayouts: false,

        compile: async function (inputContent, inputPath) {
            let parsed = path.parse(inputPath);
            // Don’t compile file names that start with an underscore
            if (parsed.name.startsWith("_")) {
                return;
            }

            let result = sass.compileString(inputContent, {
                loadPaths: [
                    parsed.dir || ".",
                    this.config.dir.includes,
                ]
            });

            // Map dependencies for incremental builds
            this.addDependencies(inputPath, result.loadedUrls);

            return async (data) => {
                return result.css;
            };
        },
    });

    // eleventyConfig.addWatchTarget(join(OUTPUT, "static", "**/*.css"));

    eleventyConfig.addGlobalData("content", content);
    eleventyConfig.addGlobalData("projects", projects);

    eleventyConfig.addShortcode("icon", function (name, style = null) {
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
        input: SRC,
        output: OUTPUT,
        layouts: LAYOUTS,
        includes: PAGES,
        output: OUTPUT,
    }
}