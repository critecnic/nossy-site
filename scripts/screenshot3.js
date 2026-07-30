const puppeteer = require('puppeteer');
const path = require('path');
const http = require('http');

function waitServer(url, maxMs = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      http.get(url, { timeout: 3000 }, (res) => {
        if (res.statusCode === 200) resolve();
        else { if (Date.now() - start < maxMs) setTimeout(check, 1000); else reject(new Error('timeout')); }
      }).on('error', () => {
        if (Date.now() - start < maxMs) setTimeout(check, 1000);
        else reject(new Error('timeout'));
      });
    };
    check();
  });
}

(async () => {
  console.log('Waiting for server...');
  await waitServer('http://localhost:3000/');
  console.log('Server ready!');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--single-process']
  });

  const pages = [
    { url: 'http://localhost:3000/', file: 'ww-home-global.png', w: 1280, h: 800 },
    { url: 'http://localhost:3000/in', file: 'ww-india-jobs.png', w: 1280, h: 800 },
    { url: 'http://localhost:3000/br', file: 'ww-brazil-jobs.png', w: 1280, h: 800 },
    { url: 'http://localhost:3000/us', file: 'ww-usa-jobs.png', w: 1280, h: 800 },
    { url: 'http://localhost:3000/jp', file: 'ww-japan-jobs.png', w: 1280, h: 800 },
  ];

  for (const p of pages) {
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: p.w, height: p.h, deviceScaleFactor: 1 });
      await page.goto(p.url, { waitUntil: 'networkidle2', timeout: 25000 });
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({ 
        path: path.join('/home/z/my-project/download', p.file), 
        fullPage: false,
        type: 'png'
      });
      console.log('OK: ' + p.file);
      await page.close();
    } catch(e) {
      console.log('FAIL: ' + p.file + ' - ' + e.message);
    }
  }

  await browser.close();
  console.log('Done!');
})();
