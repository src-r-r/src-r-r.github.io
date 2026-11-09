/**
 * Resources page — live feed loader.
 *
 * The page ships with a baked-in list of videos/articles (see src/_data/*.json,
 * rendered by src/pages/resources.liquid). On load, this script fetches the
 * current YouTube + Medium RSS feeds (via rss2json.com, which adds the CORS
 * headers the raw feeds lack) and merges them with the baked-in list, so new
 * posts show up without a site redeploy. If the fetch fails, the baked-in
 * list is left as-is.
 */
import { formatDistanceToNow } from "date-fns";

type Item = {
    date: Date;
    title: string;
    url: string;
    thumbnail?: string;
    description?: string;
};

/** Raw item shape as returned by rss2json.com */
type FeedItem = {
    title: string;
    /** "YYYY-MM-DD HH:mm:ss", UTC for both feeds */
    pubDate: string;
    link: string;
    /** Medium: HTML containing the cover image + a snippet paragraph */
    description?: string;
    thumbnail?: string;
};

/**
 * rss2json.com converts the feeds to JSON and sends
 * `Access-Control-Allow-Origin: *` (neither raw feed does). Free without an
 * API key; optionally add `&api_key=...` for a higher rate limit.
 */
function rss2jsonUrl(feedUrl: string): string {
    return `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=20`;
}

/** rss2json leaves HTML entities (&amp;, &#39;, ...) in titles/descriptions. */
const entityDoc = new DOMParser();
function decodeEntities(s?: string): string | undefined {
    if (!s) return s;
    return entityDoc.parseFromString(s, "text/html").documentElement.textContent ?? s;
}

function feedDate(raw: string): Date | null {
    // rss2json drops the timezone; both feeds publish in UTC.
    const d = new Date(raw.trim().replace(" ", "T") + "Z");
    return Number.isNaN(d.getTime()) ? null : d;
}

function toItems(items: FeedItem[], extract: (it: FeedItem) => Partial<Item> | null): Item[] {
    const out: Item[] = [];
    for (const it of items) {
        const date = feedDate(it.pubDate);
        if (!date || !it.title || !it.link) continue;
        const extra = extract(it) ?? {};
        out.push({ date, title: decodeEntities(it.title)!, url: decodeEntities(it.link)!, ...extra });
    }
    return out;
}

function parseYoutube(items: FeedItem[]): Item[] {
    // rss2json doesn't map the feed's media:description, so live videos carry
    // no description; mergeItems() backfills it from the baked-in copy.
    return toItems(items, (it) => ({ thumbnail: decodeEntities(it.thumbnail) }));
}

function parseMedium(items: FeedItem[]): Item[] {
    return toItems(items, (it) => {
        // The cover image + snippet live inside the description HTML.
        const doc = new DOMParser().parseFromString(it.description ?? "", "text/html");
        const thumbnail = doc.querySelector("img")?.getAttribute("src") || undefined;
        const description = doc.querySelector(".medium-feed-snippet")?.textContent?.trim() || undefined;
        return { thumbnail, description };
    });
}

const SECTIONS = [
    {
        grid: "#video-grid",
        status: "#video-status",
        feed: "https://www.youtube.com/feeds/videos.xml?channel_id=UCwB6GaDhyBZeqPt54wijhWA",
        parse: parseYoutube,
    },
    {
        grid: "#article-grid",
        status: "#article-status",
        feed: "https://medium.com/feed/@damngoodtech",
        parse: parseMedium,
    },
];

/**
 * Dedup key: host + path (lowercased, trailing slashes stripped).
 *
 * Two quirks to handle:
 * - YouTube /watch URLs carry the video ID in the query string (`?v=...`);
 *   dropping the query would collapse every video into one key.
 * - Medium feed URLs carry tracking params (`?source=rss-...`) that the
 *   baked-in copies don't have, so the query must be dropped there.
 */
function normUrl(url: string): string {
    try {
        const u = new URL(url);
        let key = (u.host + u.pathname).toLowerCase().replace(/\/+$/, "");
        if (u.hostname.endsWith("youtube.com") && u.pathname === "/watch") {
            const v = u.searchParams.get("v");
            if (v) key += "?v=" + v.toLowerCase();
        }
        return key;
    } catch {
        return url.split(/[?#]/)[0].replace(/\/+$/, "").toLowerCase();
    }
}

/** Read the baked-in cards already in the DOM (they double as the no-JS fallback). */
function readBakedCards(grid: HTMLElement): Item[] {
    return Array.from(grid.querySelectorAll<HTMLElement>(".card"))
        .map((card) => {
            const url = card.getAttribute("data-url") ?? card.querySelector("a")?.getAttribute("href") ?? "";
            const date = new Date(card.getAttribute("data-date") ?? "");
            const title = card.querySelector(".card-title")?.textContent?.trim() ?? "";
            const thumbnail = card.querySelector("img.thumbnail")?.getAttribute("src") || undefined;
            const description = card.querySelector(".card-description")?.textContent?.trim() || undefined;
            return { date, title, url, thumbnail, description };
        })
        .filter((it) => it.title && it.url && !Number.isNaN(it.date.getTime()));
}

/** Live items first, then any baked-in items the feed doesn't cover, newest first. */
function mergeItems(live: Item[], baked: Item[]): Item[] {
    const seen = new Set<string>();
    const merged: Item[] = [];
    for (const it of live) {
        const key = normUrl(it.url);
        if (seen.has(key)) continue;
        seen.add(key);
        const bakedCopy = baked.find((b) => normUrl(b.url) === key);
        merged.push({ ...it, description: it.description || bakedCopy?.description });
    }
    for (const it of baked) {
        const key = normUrl(it.url);
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(it);
    }
    return merged.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/** Same card markup as src/_includes/thumbnail_link.liquid. */
function renderCard(item: Item): HTMLElement {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-url", item.url);
    card.setAttribute("data-date", item.date.toISOString());

    const header = document.createElement("div");
    header.className = "card-header";

    if (item.thumbnail) {
        const a = document.createElement("a");
        a.href = item.url;
        const img = document.createElement("img");
        img.src = item.thumbnail;
        img.alt = item.title;
        img.className = "thumbnail";
        img.loading = "lazy";
        a.append(img);
        header.append(a);
    }

    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = item.title;
    header.append(title);

    const date = document.createElement("p");
    date.className = "item-date";
    date.textContent = formatDistanceToNow(item.date, { addSuffix: true });
    date.title = item.date.toISOString();
    header.append(date);

    if (item.description) {
        const desc = document.createElement("p");
        desc.className = "card-description";
        desc.textContent = item.description;
        header.append(desc);
    }

    card.append(header);
    return card;
}

async function loadSection(section: (typeof SECTIONS)[number]) {
    const grid = document.querySelector<HTMLElement>(section.grid);
    const status = document.querySelector<HTMLElement>(section.status);
    if (!grid) return;
    if (status) status.textContent = "Checking for new items…";
    try {
        const res = await fetch(rss2jsonUrl(section.feed), { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as { status?: string; items?: FeedItem[] };
        if (json.status !== "ok" || !json.items?.length) throw new Error(json.status ?? "empty feed");
        const live = section.parse(json.items);
        grid.replaceChildren(...mergeItems(live, readBakedCards(grid)).map(renderCard));
        if (status) status.textContent = "";
    } catch (err) {
        console.warn("[resources] live feed unavailable, showing baked-in list", err);
        if (status) status.textContent = "Live feed unavailable — showing last-published list.";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    for (const section of SECTIONS) void loadSection(section);
});
