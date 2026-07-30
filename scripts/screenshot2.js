const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const pages = [
    { url: 'http://localhost:3000/', file: 'ww-home-global.png', w: 1440, h: 900 },
    { url: 'http://localhost:3000/in', file: 'ww-india-jobs.png', w: 1440, h: 900 },
    { url: 'http://localhost:3000/br', file: 'ww-brazil-jobs.png', w: 1440, h: 900 },
    { url: 'http://localhost:3000/us', file: 'ww-usa-jobs.png', w: 1440, h: 900 },
    { url: 'http://localhost:3000/jp', file: 'ww-japan-jobs.png', w: 1440, h: 900 },
  ];

  for (const p of pages) {
    const page = await browser.newPage();
    await page.setViewport({ width: p.w, height: p.h, deviceScaleFactor: 1.5 });
    await page.goto(p.url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ 
      path: path.join('/home/z/my-project/download', p.file), 
      fullPage: false,
      type: 'png'
    });
    console.log(`Screenshot: ${p.file}`);
    await page.close();
  }

  await browser.close();
  console.log('Done!');
})();
