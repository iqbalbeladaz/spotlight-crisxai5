// Spotlight @crisxai5 — make.fun entry program (Node 22, standard library only).
//
// The entry itself is the X post: POST.json at the repository root names the
// post's address, and the house reads the post's public counts from X. All
// this program does is hand POST.json to the gate: it reads the file from the
// bot directory, validates that it really is a JSON object whose "url" is an
// X post address, and copies it into the output directory. Validating first
// matters — the starter shipped a placeholder address, and a program that
// copies blindly would hand the gate a file it must refuse.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// An X post address: x.com or twitter.com, then either a handle or the
// /i/web form, /status/, and a numeric id. A query or fragment after the id
// is read past, so it is stripped before the address is tested.
const POST_URL = /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/(?:[^/]+|i\/web)\/status\/\d+\/?$/;

function readPostAddress(botDir: string): string {
  const raw = readFileSync(join(botDir, 'POST.json'), 'utf8');
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null || !('url' in parsed)) {
    throw new Error('POST.json is not a JSON object with a "url" field');
  }
  const url = (parsed as { url: unknown }).url;
  if (typeof url !== 'string' || !POST_URL.test(url.split(/[?#]/)[0])) {
    throw new Error(`POST.json url is not an X post address: ${String(url)}`);
  }
  return url;
}

function main(): void {
  const address = readPostAddress(BOT_DIR);
  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyFileSync(join(BOT_DIR, 'POST.json'), join(OUTPUT_DIR, 'POST.json'));
  console.log(`POST.json handed to the gate: ${address}`);
}

try {
  main();
} catch (err) {
  console.error(`entry failed: ${(err as Error).message}`);
  process.exit(1);
}
