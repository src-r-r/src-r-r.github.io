import { glob, globSync } from "glob";
import { basename, dirname, join, resolve } from "path";
import { readFileSync, writeFileSync } from "fs";
import { parse } from 'node-html-parser';
import truncate from "truncate";

const MEDIUM_ARCHIVE_PATH=resolve(process.env.MEDIUM_ARCHIVE_PATH || "")
const ARTICLES=resolve(MEDIUM_ARCHIVE_PATH, "posts");
const HERE=dirname(resolve(__filename));
const PROJECT = dirname(HERE);
const DATA = resolve(PROJECT, "_data");
const MEDIUM_DATA = resolve(DATA, "medium.json");

const PATTERN = join(ARTICLES, '**/*.html');

export type MediumEntry = {
    date: Date,
    title: string,
    subtitle?: string,
    teaser?: string,
    thumbnail?: string,
    url: string,
}

const TEASER_LENGTH = 150;

async function main (){
    const mediumArticles = globSync(PATTERN).map(entry => {
        const name = basename(entry);
        if (name.match(/^draft/)) return null;
        const [y, m, d] = name.split("_")[0].split("-").map(s => Number.parseInt(s));
        console.log("%d %d %d", y, m-1, d);
        const date = new Date(y, m-1, d);
        console.log("%s, %s", name, date);
        const html = readFileSync(entry).toString();
        const root = parse(html);
        const thumbnail = root.querySelector("img")?.attributes["src"];
        const title = root.querySelector(".graf--title")?.innerText;
        const subtitle = root.querySelector(".graf--subtitle")?.innerText;
        const teaser = truncate(subtitle || "", TEASER_LENGTH);
        const url = root.querySelector(".p-canonical")?.attributes["href"];
        if (!title) return null;
        return {
            date,
            title,
            thumbnail,
            url,
            subtitle,
            teaser,
        } as MediumEntry
    }).filter(x => x).sort((a, b) => (b?.date.valueOf() || 0) - (a?.date.valueOf() || 0));
    console.log(mediumArticles);

    writeFileSync(MEDIUM_DATA, JSON.stringify(mediumArticles));
}

main();