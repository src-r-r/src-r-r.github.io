# Damn Good Tech — business website

## How the repo works (read this once, stop being confused)

There are **two branches** that matter:

| Branch | What it is | You |
|---|---|---|
| `main` | **The code** — Eleventy source in `src/` | edit this. commit here. |
| `gh-pages` | **The final HTML** — what visitors actually see at [damngood.tech](https://damngood.tech) | never edit it by hand. it's generated. |

Everything else (the `output/` folder, `publish.sh`, Pelican, `main-2`, the
`sumo-dev*` branches...) is history. Ignore it.

## Day-to-day

```bash
pnpm dev       # local dev server on http://localhost:8082 (hot reload)
```

## Deploying

```bash
pnpm ship
```

That's it. One command. (It's "ship", not "deploy" — `pnpm deploy` is taken
by pnpm itself.) Want a preview first? `pnpm ship -- --dry-run` does
everything except the final push.

It:

1. builds the site (`eleventy` + `rollup`) into `_site/`
2. copies the result (including the `CNAME` for damngood.tech) into a
   throw-away worktree
3. commits + pushes to the `gh-pages` branch

The live site updates within ~30-60 seconds. Check with:

```bash
curl -s https://damngood.tech | grep '<title>'
```

## Rules

- **Never** edit files on `gh-pages` directly.
- **Never** push HTML to `main`. `main` holds source code only.
- `_site/` is build output — it's gitignored, don't commit it.
- `CNAME` lives in the repo root and is the source of truth for the
  damngood.tech domain. `scripts/deploy.mjs` injects it into the deploy
  itself (the vite build step wipes `_site/`, so it can't be trusted to
  carry it). If you change the domain, edit that file.

## If something is broken

```bash
pnpm install   # restore node_modules
pnpm build     # build only, no deploy — inspect _site/
pnpm ship      # build + deploy
```
