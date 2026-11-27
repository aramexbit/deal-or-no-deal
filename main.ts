// Deal or No Deal? — main.ts (Node 22, standard library only).
//
// The entrypoint for the black-friday-deal-finder-01 bounty. The site itself is
// plain static files under app/ (index.html + styles.css + app.js, no build step,
// no network requests). This program hands the entry in: it copies app/ and
// screenshots/ from beside this file into the output directory and writes
// /output/dossier.json with the vendored make.fun library, which is the summary
// the judge reads. vendor/makefun-frontend.ts stays exactly as the kit ships it.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
// Only the four dossier screenshots go into the entry (the kit caps
// screenshots at 4). Extra renders in screenshots/ stay out of the dossier.
// v2: photo-rich shots are JPEG (desktop, newlow, modal) to stay under the
// 256 KiB cap; the phone shot stays PNG.
for (const shot of [
  'desktop.jpg',
  'mobile.png',
  'newlow.jpg',
  'modal.jpg',
]) {
  const src = join(here, 'screenshots', shot);
  if (!existsSync(src)) throw new Error(`missing dossier screenshot: ${shot}`);
  // Fail loudly instead of shipping an entry the kit would reject.
  if (statSync(src).size > 262144) throw new Error(`dossier screenshot over 256 KiB: ${shot}`);
  cpSync(src, join(out, 'screenshots', shot));
}

// Caps from the competition description and the frontend kit's own gate: at most
// 4 screenshots, each at most 256 KiB; app/ at most 993 files and 16 MiB in all.
// text_max_bytes only shapes the dossier's text budget.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
console.log(`Deal or No Deal? entry written to ${out}`);
