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

class StaticTag extends Tag {
    private inPath: string | null = null;
    private outPath: string | null = null;
    private refPath: string | null = null;

    constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
        super(tagToken, remainTokens, liquid);
        const inPath = this.token.args.replace(/['"]/g, '');
        this.inPath = join(STATIC, inPath);
        this.refPath = join("/static", inPath);
        this.outPath = join(OUTPUT, "static", inPath);
        console.log("Compiling %s", inPath);
        console.log("  -> outPath: %s", this.outPath);
        console.log("  -> refPath: %s", this.refPath);
    }

    compileSass() {
        this.outPath = (this.outPath as string).replace(/.sass$/, ".css");
        sass.compileAsync(this.inPath as string).then((value) => {
            mkdirSync(dirname(this.outPath as string), { recursive: true, });
            writeFileSync(this.outPath as string, value.css);
        }).catch((err) => {
            console.error(err);
        });
        return this.refPath?.replace(/.sass$/, ".css");
    }

    * render(ctx: Context, emitter: Emitter) {
        if ((this.inPath?.match(/\.sass$/g))) return this.compileSass();
        return this.refPath;
    }
}


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