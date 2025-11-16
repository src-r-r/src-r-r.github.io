import path from "node:path";
import * as sass from "sass";

console.log("Hello World!");

export default function (eleventyConfig) {
	console.log("Hello inside World!");

    eleventyConfig.setInputDirectory("./src");
    // eleventyConfig.setIncludesDirectory("");
	eleventyConfig.setLayoutsDirectory("./layout");

	eleventyConfig.addPassthroughCopy("./src/styles")

	
    // SCSS
    eleventyConfig.addTemplateFormats("scss")
	eleventyConfig.addExtension("scss", {
		outputFileExtension: "css",

		// opt-out of Eleventy Layouts
		useLayouts: false,

		compile: async function (inputContent, inputPath) {
			let parsed = path.parse(inputPath);
			// Don’t compile file names that start with an underscore
			if(parsed.name.startsWith("_")) {
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
};