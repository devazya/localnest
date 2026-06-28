/**
 * LocalNest — one-time asset setup
 * Run from project root:
 *   node copyAssets.mjs
 *
 * This copies your two illustration PNGs from wherever they were downloaded
 * into public/images/ so Vite can serve them.
 *
 * The script tries three common Windows download/upload locations automatically.
 * If none work, set SOURCE_DIR env var to the folder containing the PNGs.
 */
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import os from 'os';

const DEST_DIR = resolve('public/images');
mkdirSync(DEST_DIR, { recursive: true });

// Candidate source folders (tries each in order)
const candidateDirs = [
  process.env.SOURCE_DIR,
  join(os.homedir(), 'Downloads'),
  join(os.homedir(), 'Desktop'),
  join(os.homedir(), 'OneDrive', 'Desktop'),
  '.',
].filter(Boolean);

const FILES = [
  {
    // Splash illustration — neighborhood / houses image
    srcName: 'ChatGPT_Image_Jun_28__2026__12_28_45_PM__1_.png',
    destName: 'splash-illustration.png',
  },
  {
    // Onboarding illustration — two people talking / community image
    srcName: 'ChatGPT_Image_Jun_28__2026__06_57_53_PM.png',
    destName: 'onboarding-illustration.png',
  },
];

let anyFailed = false;

for (const { srcName, destName } of FILES) {
  const destPath = join(DEST_DIR, destName);

  // Find it in one of the candidate dirs
  let found = false;
  for (const dir of candidateDirs) {
    const srcPath = join(dir, srcName);
    if (existsSync(srcPath)) {
      copyFileSync(srcPath, destPath);
      console.log(`✓  ${srcName}`);
      console.log(`   → public/images/${destName}\n`);
      found = true;
      break;
    }
  }

  if (!found) {
    console.warn(`⚠  Could not find: ${srcName}`);
    console.warn(`   Tried: ${candidateDirs.join(', ')}`);
    console.warn(`   Copy it manually to public/images/${destName}\n`);
    anyFailed = true;
  }
}

if (anyFailed) {
  console.log('Some files were not found automatically.');
  console.log('Re-run with: SOURCE_DIR="path/to/folder" node copyAssets.mjs\n');
} else {
  console.log('All done! Run: npm run dev');
}
