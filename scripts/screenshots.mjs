import { spawn } from 'child_process';
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const PORT = 3456;

// Start server INSIDE this process
const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
  cwd: '/home/z/my-project',
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=256' }
});

// Wait for server ready
console.log('Waiting for server...');
for (let i = 0; i < 60; i++) {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}`, { signal: AbortSignal.timeout(2000) });
    if (r.ok) { console.log('Server ready!'); break; }
  } catch {}
  await new Promise(r => setTimeout(r, 1000));
}

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

// ====== BRAZIL ======
console.log('Loading Brazil...');
const p2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await p2.goto(`http://127.0.0.1:${PORT}/br`, { waitUntil: 'networkidle', timeout: 60000 });
await p2.waitForTimeout(3000);
const brArts = await p2.evaluate(() => document.querySelectorAll('article').length);
console.log(`Brazil articles: ${brArts}`);
await p2.screenshot({ path: '/home/z/my-project/download/preview-02-brazil.png', fullPage: true });
console.log('OK: brazil');
await p2.close();

// ====== USA ======
console.log('Loading USA...');
const p3 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await p3.goto(`http://127.0.0.1:${PORT}/us`, { waitUntil: 'networkidle', timeout: 60000 });
await p3.waitForTimeout(3000);
const usArts = await p3.evaluate(() => document.querySelectorAll('article').length);
console.log(`USA articles: ${usArts}`);
await p3.screenshot({ path: '/home/z/my-project/download/preview-03-usa.png', fullPage: true });
console.log('OK: usa');
await p3.close();

// ====== HOME ======
console.log('Loading Home...');
const p1 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await p1.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle', timeout: 60000 });
await p1.waitForTimeout(4000);
const homeArts = await p1.evaluate(() => document.querySelectorAll('article').length);
console.log(`Home articles: ${homeArts}`);
await p1.screenshot({ path: '/home/z/my-project/download/preview-01-home.png', fullPage: true });
if (homeArts > 0) {
  await p1.evaluate(() => window.scrollTo(0, 800));
  await p1.waitForTimeout(500);
  await p1.screenshot({ path: '/home/z/my-project/download/preview-04-home-paywall.png' });
  console.log('OK: home-paywall');
}
console.log('OK: home');
await p1.close();

await browser.close();
server.kill();
console.log('ALL DONE');