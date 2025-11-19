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

function metaDescriptionLengthRule(dom : JSDOM, args? : {minLength?: number, maxLength?: number}) {
    return new Promise(async (resolve, reject) => {
        const minLength = args?.minLength || 50;
        const maxLength = args?.minLength || 160;
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
        .addRule('aTagWithRelAttributeRule')
        .addRule('metaBaseRule', { list: ['description', 'viewport'] })
        .addRule(metaDescriptionLengthRule)
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
        // @ts-ignore
        .outputConsole().run();
})();