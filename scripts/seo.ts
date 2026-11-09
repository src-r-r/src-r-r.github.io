import SeoAnalyzer from "seo-analyzer";
import {JSDOM} from "jsdom";
import { globSync } from "fs";

process.stdout.write('\x33c')

// This is just an example of input/output
function customRule(dom : JSDOM) {
    return new Promise(async (resolve, reject) => {
        const paragraph = dom.window.document.querySelector('p');
        if (paragraph) {
            resolve('');
        } else {
            reject('Not found <p> tags');
        }
    });
}

function externalLinkRelRule(dom : JSDOM) {
    // rel= only matters for links that leave the site (reverse-tabnabbing
    // protection + relationship hints); internal anchors don't need one.
    const missing: string[] = [];
    dom.window.document.querySelectorAll('a[href^="http"]').forEach((a: HTMLAnchorElement) => {
        if (!a.getAttribute('rel')) {
            missing.push(a.getAttribute('href') || '');
        }
    });
    return new Promise((resolve, reject) => {
        if (missing.length > 0) {
            reject(`External <a> tags missing a rel attribute: ${missing.join(', ')}`);
        } else {
            resolve('');
        }
    });
}

function metaDescriptionLengthRule(dom : JSDOM, args? : {minLength?: number, maxLength?: number}) {
    return new Promise(async (resolve, reject) => {
        const minLength = args?.minLength || 50;
        const maxLength = args?.maxLength || 160;
        const meta : HTMLElement | null = dom.window.document.querySelector('meta[name="description"]');
        if (!meta) {
            return reject("no meta tag found");
        }
        
        const content = meta.getAttribute("content");
        const len = content?.length || 0;

        if ( (len <= minLength || len >= maxLength) ) {
            reject(`Meta description "${content}" (length ${len}) is not within [${minLength}, ${maxLength}]`);
        } else {
            return resolve("");
        }
    });
}

(async function () {
    (await new SeoAnalyzer({}).inputFiles(globSync("./_site/**/*.html")))
        .addRule('imgTagWithAltAttributeRule')
        .addRule('titleLengthRule', { min: 10, max: 50 })
        .addRule(externalLinkRelRule)
        .addRule('metaBaseRule', { list: ['description', 'viewport'] })
        .addRule(metaDescriptionLengthRule)
		.addRule('canonicalLinkRule')
		.addRule('metaSocialRule', {
			properties: [
				'og:url',
				'og:type',
				'og:site_name',
				'og:locale',
				'og:title',
				'og:description',
				'og:image',
				'og:image:width',
				'og:image:height',
				'twitter:card',
				'twitter:site',
				'twitter:title',
				'twitter:description',
				'twitter:image',
				'twitter:url'
			],
		})
        // @ts-ignore
        .outputConsole().run();
})();