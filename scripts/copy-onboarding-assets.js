/**
 * Run once from project root:
 *   node scripts/copy-onboarding-assets.js
 *
 * Pass SOURCE_DIR env var pointing to where the PNG uploads are.
 * Example (Windows):
 *   set SOURCE_DIR=C:\Users\divya\Downloads && node scripts/copy-onboarding-assets.js
 */
import { copyFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const SOURCE_DIR = process.env.SOURCE_DIR || '.';

const files = [
  { src: 'ChatGPT_Image_Jun_28__2026__12_28_45_PM__1_.png', dest: 'splash-illustration.png' },
  { src: 'ChatGPT_Image_Jun_28__2026__06_57_53_PM.png',     dest: 'onboarding-illustration.png' },
];

const destDir = resolve('public/images');

for (const { src, dest } of files) {
  const srcPath = resolve(SOURCE_DIR, src);
  const destPath = resolve(destDir, dest);
  if (!existsSync(srcPath)) {
    console.warn(`⚠  Source not found: ${srcPath}`);
    continue;
  }
  copyFileSync(srcPath, destPath);
  console.log(`✓  ${src}  →  public/images/${dest}`);
}
console.log('\nDone! Now run: npm run dev');
