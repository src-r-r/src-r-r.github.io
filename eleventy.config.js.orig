/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
import "tsx/esm";
import path, { resolve } from "node:path";
import fs from 'fs';
import * as sass from "sass";
import cssnano from 'cssnano';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import pluginIcons from 'eleventy-plugin-icons';
import eleventy from "11ty.ts"
import EleventyVitePlugin from "@11ty/eleventy-plugin-vite";
import SeoAnalyzer from "seo-analyzer";

export default eleventy(eleventyConfig => {

	eleventyConfig.setInputDirectory("./src");
	eleventyConfig.setIncludesDirectory("./_includes");
	eleventyConfig.setLayoutsDirectory("./_layouts");
	eleventyConfig.addPassthroughCopy("./src/styles")
	eleventyConfig.setDataDirectory("./_data")

	eleventyConfig.addWatchTarget("./src/assets/");
	eleventyConfig.addWatchTarget("./_site/assets/");

	eleventyConfig.addPlugin(pluginIcons, {});
	eleventyConfig.addPlugin(EleventyVitePlugin, {
		resolve: {
			aliases: {
				"~": path.resolve(".", "node_modules"),
			}
		}
	});

	// tailwind
	//compile tailwind before eleventy processes the files
	eleventyConfig.on('eleventy.before', async () => {
		const tailwindInputPath = path.resolve('./src/assets/styles/dgtstatic/index.css');

		const tailwindOutputPath = './_site/assets/styles/dgtstatic/index.css';

		const cssContent = fs.readFileSync(tailwindInputPath, 'utf8');

		const outputDir = path.dirname(tailwindOutputPath);
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		console.log("preprocessing %s -> %s", tailwindInputPath, tailwindOutputPath)

		const result = await processor.process(cssContent, {
			from: tailwindInputPath,
			to: tailwindOutputPath,
		});

		fs.writeFileSync(tailwindOutputPath, result.css);
	});

	const processor = postcss([
		//compile tailwind
		tailwindcss(),

		//minify tailwind css
		cssnano({
			preset: 'default',
		}),
	]);

	const analyzer = new SeoAnalyzer();

	eleventyConfig.on("eleventy.after", async ({ directories, results, runMode, outputMode }) => {

		// console.log("results: %o", results)
		console.log("runMode: %o", runMode)
		console.log("outputMode: %o", outputMode)

		const result = await new Promise((resolve, reject) => {
			analyzer
			.inputFolders([directories.output])
			.addRule("imgTagWithAltAttributeRule")
			.addRule('metaBaseRule', { list: ['description', 'viewport'] })
			.addRule('aTagWithRelAttributeRule')
			.addRule('titleLengthRule', { min: 10, max: 50 })
			.addRule('canonicalLinkRule')
			.addRule('metaSocialRule', {
				properties: [
					'og:url',
					'og:type',
					'og:site_name',
					'og:title',
					'og:description',
					'og:image',
					'og:image:width',
					'og:image:height',
					'twitter:card',
					'twitter:text:title',
					'twitter:description',
					'twitter:image:src',
					'twitter:url'
				],
			})
			.outputObject((j) => resolve(j))
			.run()
		});
		if (result.length) {
			for (let i = 0; i < result.length; ++i) {
				console.log(result[i].source)
				for (let j = 0; j < result[i].report.length; ++j) {
					console.error("  %s", result[i].report[j])
				}
			}
			throw new Error("Did not pass SEO.")
		}
	})


	// SCSS
	eleventyConfig.addTemplateFormats("scss")
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
});