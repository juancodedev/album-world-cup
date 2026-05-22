import { mkdirSync, cpSync, existsSync, renameSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = join(root, '.vercel/output/static');
const openNextDir = join(root, '.open-next');

mkdirSync(outputDir, { recursive: true });

if (!existsSync(openNextDir)) {
  console.error('❌ .open-next directory not found. Run opennextjs-cloudflare build first.');
  process.exit(1);
}

cpSync(openNextDir, outputDir, {
  recursive: true,
  filter: (src) => {
    // Skip node_modules and other junk
    if (src.includes('node_modules')) return false;
    return true;
  },
});

// Rename worker.js -> _worker.js for Cloudflare Pages
const workerJs = join(outputDir, 'worker.js');
const underscoreWorker = join(outputDir, '_worker.js');
if (existsSync(workerJs) && !existsSync(underscoreWorker)) {
  renameSync(workerJs, underscoreWorker);
}

console.log('✅ Copied OpenNext output to .vercel/output/static');
