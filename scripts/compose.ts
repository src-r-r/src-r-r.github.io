import { Liquid } from 'liquidjs';
import {dirname, join} from "path";

const HERE = dirname(__filename);
const PROJECT = dirname(HERE);
const TEMPLATES = join(PROJECT, "templates");
const DGTSTATIC_TEMPLATES = join(PROJECT, "dgtstatic");

function main() {
    const engine = new Liquid({
        layouts: DGTSTATIC_TEMPLATES,
    });
}

main();