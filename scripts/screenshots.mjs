import { chromium } from 'playwright';

const PORT = 3000;
const BASE = `http://localhost:${PORT}`;
const SCREENSHOTS_DIR = '/home/z/my-project/download';

async function run() {
  const { spawn } = await import('child_process');
  
   // Start server
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    cwd: '/home/z/my-project',
    stdio: 'pipe',
    env: { ...process.env, PORT: String(PORT) },
  });

  // Wait for server ready
  await new Promise(resolve => setTimeout(resolve, 4000));

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const shots = [
    { url: '/en/jobs', file: 'preview-en-jobs.png', wait: 2000 },
    { url: '/en/jobs/br', file: 'preview-en-jobs-brazil.png', wait: 2000 },
    { url: '/pt-br/vagas', file: 'preview-ptbr-vagas.png', wait: 2000 },
    { url: '/ar/وظائف', file: 'preview-ar-jobs.png', wait: 2000 },
    { url: '/en/jobs/ng', file: 'preview-en-jobs-nigeria.png', wait: 2000 },
  ];

  for (const s of shots) {
    try {
      await page.goto(`${BASE}${s.url}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(s.wait);
      await page.screenshot({ path: `${SCREENSHOTS_DIR}/${s.file}`, fullPage: false });
      console.log(`OK: ${s.file}`);
    } catch (e) {
      console.log(`FAIL: ${s.file} - ${e.message?.slice(0, 80)}`);
    }
  }

  // Scroll down on English jobs page to show paywall
  try {
    await page.goto(`${BASE}/en/jobs/br`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/preview-en-jobs-brazil-paywall.png`, fullPage: false });
    console.log('OK: preview-en-jobs-brazil-paywall.png');
  } catch (e) {
    console.log(`FAIL: paywall scroll - ${e.message?.slice(0, 80)}`);
  }

  await browser.close();
  server.kill();
  console.log('Done!');
}

run().catch(e => { console.error(e); process.exit(1); });
