import { defineConfig, PluginOption } from "vite"
import { Liquid } from "liquidjs"
import { dirname, join } from "path";


const PROJECT = dirname(__filename);
const TEMPLATES = join(PROJECT, "templates");
const DGTSTATIC_TEMPLATES = join(TEMPLATES, "dgtstatic");
const PAGES = join(PROJECT, "pages");
const OUTPUT = join(PROJECT, "output");
const STATIC = join(PROJECT, "static");

const PAGES_PATTERN = join(PAGES, "**/*.liquid");
const LIQUID_REGEX = /\.(liquid)$/

function liquidCompiler() {

    const liquid = new Liquid({
        layouts: DGTSTATIC_TEMPLATES
    });

    return {
        name: 'compile-liquid',

        transform(src, id) {
            if (LIQUID_REGEX.test(id)) {
                const code = liquid.parseAndRenderSync(src);
                return {
                    code,
                    map: null, // provide source map if available
                }
            }
        },
    } as PluginOption;
}

export default defineConfig({
    plugins: [liquidCompiler()],
    build: {
        lib: {
            entry: join(PAGES, "index.liquid"),
            name: "Site",
            fileName: (format) => {
                console.log(format);
                return `${format}.html`
            }
        },
        outDir: OUTPUT,
    }
});