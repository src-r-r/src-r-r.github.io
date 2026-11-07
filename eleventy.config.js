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
import { globSync } from "node:fs";

export default eleventy(async eleventyConfig => {

	eleventyConfig.setInputDirectory("./src");
	eleventyConfig.setIncludesDirectory("./_includes");
	eleventyConfig.setLayoutsDirectory("./_layouts");
	eleventyConfig.addPassthroughCopy("./src/styles")
	eleventyConfig.setDataDirectory("./_data")

	// custom domain for GitHub Pages (deployed with the site by scripts/deploy.mjs)
	eleventyConfig.addPassthroughCopy("./CNAME")

	eleventyConfig.addWatchTarget("./src/assets/");
	eleventyConfig.addWatchTarget("./_site/assets/");

	eleventyConfig.addPlugin(pluginIcons, {});
	eleventyConfig.addPlugin(EleventyVitePlugin, {
		resolve: {
			aliases: {
				"~": path.resolve(".", "node_modules"),
			}
		},
		// Static media Vite ships verbatim (hero video, poster). Copied into
		// the site root by the vite production build, served by the vite dev
		// server in dev mode. The plugin also passthrough-copies it for
		// Eleventy itself.
		viteOptions: {
			publicDir: path.resolve(".", "src/public"),
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