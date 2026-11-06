#!/usr/bin/env node
/**
 * Deploy the built site to GitHub Pages.
 *
 * The model:
 *   - `main` branch        = the code (this repo, what you edit)
 *   - `gh-pages` branch    = the final HTML (what visitors see, generated)
 *
 * Run with:  pnpm ship
 * (named "ship" because `pnpm deploy` collides with pnpm's built-in
 *  workspace-deploy command)
 *
 * What this does:
 *   1. checks the build output (_site/) is complete
 *   2. copies it into a throw-away git worktree for the gh-pages branch
 *   3. commits + pushes to origin/gh-pages
 *   4. cleans up
 *
 * Never edit gh-pages by hand — it is always rebuilt from _site/.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(root, "_site");
const WORKTREE_DIR = path.join(root, ".gh-pages-deploy");
const REMOTE = "origin";
const BRANCH = "gh-pages";
const SITE_URL = "https://damngood.tech";

function git(args, cwd = root) {
	try {
		return execFileSync("git", args, {
			cwd,
			encoding: "utf8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();
	} catch (e) {
		const detail = [e.stdout, e.stderr].filter(Boolean).join("\n");
		throw new Error(`git ${args.join(" ")} failed:\n${detail}`);
	}
}

function log(msg) {
	process.stdout.write(msg + "\n");
}

// --- 1. sanity checks -------------------------------------------------------
const indexHtml = path.join(OUT_DIR, "index.html");
const cname = path.join(OUT_DIR, "CNAME");

if (!fs.existsSync(indexHtml)) {
	log("✖ _site/index.html not found. Run `pnpm build` first (or just `pnpm ship`, which builds for you).");
	process.exit(1);
}
if (!fs.existsSync(cname)) {
	log("✖ _site/CNAME not found — deploying without it would break the damngood.tech domain!");
	log("  (It should be copied there automatically by eleventy.config.js — check it wasn't deleted.)");
	process.exit(1);
}

// Warn (don't block) if there are uncommitted changes: they won't be deployed.
const dirty = git(["status", "--porcelain"]);
if (dirty) {
	log("ℹ Note: you have uncommitted changes in the working tree. They will NOT be deployed until committed.");
}

// --- 2. figure out the base to build on ------------------------------------
let baseSha = null;
try {
	git(["fetch", REMOTE, BRANCH]);
	baseSha = git(["rev-parse", `${REMOTE}/${BRANCH}`]);
} catch {
	log("ℹ No existing gh-pages branch on the remote — creating it from scratch.");
}
if (!baseSha) {
	baseSha = git(["hash-object", "-t", "tree", "/dev/null"]); // empty tree (orphan)
}

const sourceSha = git(["rev-parse", "--short", "HEAD"]);

// --- 3. throw-away worktree for the deploy ----------------------------------
if (fs.existsSync(WORKTREE_DIR)) {
	git(["worktree", "remove", "--force", WORKTREE_DIR]);
	git(["worktree", "prune"]);
}
git(["worktree", "add", "--detach", WORKTREE_DIR, baseSha]);

try {
	// Wipe everything in the worktree except .git
	for (const entry of fs.readdirSync(WORKTREE_DIR)) {
		if (entry === ".git") continue;
		fs.rmSync(path.join(WORKTREE_DIR, entry), { recursive: true, force: true });
	}

	// Copy the fresh build in
	fs.cpSync(OUT_DIR, WORKTREE_DIR, { recursive: true, dereference: true });

	git(["add", "-A"], WORKTREE_DIR);
	const changes = git(["status", "--porcelain"], WORKTREE_DIR);

	if (!changes) {
		log("✔ Build is identical to what's already deployed — nothing to push.");
	} else {
		const msg = `deploy: ${new Date().toISOString()} (source ${sourceSha})`;
		git(["commit", "-m", msg], WORKTREE_DIR);
		git(["push", REMOTE, `HEAD:${BRANCH}`], WORKTREE_DIR);
		log(`🚀 Deployed ${SITE_URL}`);
		log("   GitHub Pages usually takes ~30-60 seconds to go live.");
		log(`   (Verify: curl -s ${SITE_URL} | grep '<title>')`);
	}
} finally {
	git(["worktree", "remove", "--force", WORKTREE_DIR]);
	git(["worktree", "prune"]);
}
