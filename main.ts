import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

// Resolve paths relative to this script so the packager works no matter where Node is launched from.
const here = fileURLToPath(new URL(".", import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// The output directory is a self-contained hand-in package: it must include the playable game,
// any captured screenshots, and a dossier manifest that the scorer can inspect without extra files.
mkdirSync(out, { recursive: true });
cpSync(join(here, "game"), join(out, "game"), { recursive: true });

const shotsOut = join(out, "screenshots");
mkdirSync(shotsOut, { recursive: true });
const shotsIn = join(here, "screenshots");
if (existsSync(shotsIn)) {
  cpSync(shotsIn, shotsOut, { recursive: true });
}

// The dossier caps mirror the scorer's limits so we package exactly what will be evaluated:
// bounded text, up to 4 screenshots, and a capped game tree to prevent oversized or stray submissions.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

// The gate rebuilds dossier.json byte for byte with the same vendored library, so write the returned bytes directly.
writeFileSync(join(out, "dossier.json"), dossier);
