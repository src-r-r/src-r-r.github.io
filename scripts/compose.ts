import { Context, Emitter, Liquid, Tag, TagToken, TopLevelToken } from 'liquidjs';
import { dirname, join } from "path";
import { Glob, glob, globStream, globStreamSync } from "glob";
import { mkdirSync, rmSync, rmdirSync, writeFile, writeFileSync } from 'fs';
import sass, { AsyncCompiler, initAsyncCompiler } from "sass";
import sassLoader from "sass-loader"

const HERE = dirname(__filename);
const PROJECT = dirname(HERE);
const TEMPLATES = join(PROJECT, "templates");
const DGTSTATIC_TEMPLATES = join(TEMPLATES, "dgtstatic");
const PAGES = join(PROJECT, "pages");
const OUTPUT = join(PROJECT, "output");
const STATIC = join(PROJECT, "static");

const PAGES_PATTERN = join(PAGES, "**/*.liquid");



function main() {

    const engine = new Liquid({
        layouts: DGTSTATIC_TEMPLATES,
        cache: true,
        dynamicPartials: true,
    });

    engine.registerTag("static", StaticTag);

    const gl = new Glob(PAGES_PATTERN, { withFileTypes: true });
    gl.stream().on("data", (inFile) => {
        if (!inFile.isFile()) return;
        const inPath = inFile.fullpath();
        const outPath = inPath.replace(PAGES, OUTPUT).replace("liquid", "html");
        console.log("%s -> %s", inPath, outPath);
        engine.renderFile(inPath).then((rendered: string) => {
            mkdirSync(dirname(outPath), { recursive: true });
            writeFileSync(outPath, rendered);
        })
    });
}

main();