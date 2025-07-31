import * as https from 'https';
import * as fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import {resolve, dirname} from 'path';

const rssFeedUrl = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCwB6GaDhyBZeqPt54wijhWA';
const outputFile = resolve(dirname(__dirname), '_data', 'youtube.json');

interface YoutubeVideo {
    date: Date;
    title: string;
    thumbnail: string;
    url: string;
    description: string;
}


async function fetchAndParseRssFeed(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parser = new XMLParser({ ignoreAttributes: false });
                    const parsed = parser.parse(data);
                    resolve(parsed);
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

function extractVideoInfo(feed: any): any[] {
    const videos = [] as YoutubeVideo [];

    if (feed?.feed?.entry) {
        feed.feed.entry.forEach((entry: any) => {
            const title = entry.title;
            const link = entry.link["@_href"];
            const published = entry.published;
            // const thumbnail = entry.media?.group?.media?.thumbnail?.$.url;
            // const description = entry.content?.$.text;

            const media = entry["media:group"];
            const thumbnail = media["media:thumbnail"]["@_url"]
            const description = media["media:description"]

            if (title && link) {
                videos.push({
                    date: new Date(published),
                    title: title,
                    thumbnail: thumbnail,
                    url: link,
                    description: description
                });
            }
        });
    }

    return videos;
}


async function main() {
    try {
        const feed = await fetchAndParseRssFeed(rssFeedUrl);
        const videos = extractVideoInfo(feed);

        fs.writeFileSync(outputFile, JSON.stringify(videos, null, 2));
        console.log(`Successfully wrote data to ${outputFile}`);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

main();