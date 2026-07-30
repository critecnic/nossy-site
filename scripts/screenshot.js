const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  const outDir = '/home/z/my-project/download/';
  
  // 1. Homepage desktop
  console.log('Taking homepage...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('.card-hover, .rounded-2xl', { timeout: 15000 }).catch(()=>{});
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: outDir + 'ww-home-desktop.png', fullPage: false });
  console.log('Homepage done');

  // 2. India page
  console.log('Taking India page...');
  await page.goto('http://localhost:3000/in', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('.card-hover', { timeout: 15000 }).catch(()=>{});
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: outDir + 'ww-india-jobs.png', fullPage: false });
  console.log('India done');

  // 3. Brazil page
  console.log('Taking Brazil page...');
  await page.goto('http://localhost:3000/br', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('.card-hover', { timeout: 15000 }).catch(()=>{});
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: outDir + 'ww-brazil-jobs.png', fullPage: false });
  console.log('Brazil done');

  // 4. USA page
  console.log('Taking USA page...');
  await page.goto('http://localhost:3000/us', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('.card-hover', { timeout: 15000 }).catch(()=>{});
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: outDir + 'ww-usa-jobs.png', fullPage: false });
  console.log('USA done');

  // 5. Mobile homepage
  console.log('Taking mobile homepage...');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('.card-hover, .rounded-2xl', { timeout: 15000 }).catch(()=>{});
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: outDir + 'ww-home-mobile.png', fullPage: false });
  console.log('Mobile homepage done');

  // 6. Mobile India
  console.log('Taking mobile India...');
  await page.goto('http://localhost:3000/in', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('.card-hover', { timeout: 15000 }).catch(()=>{});
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: outDir + 'ww-india-mobile.png', fullPage: false });
  console.log('Mobile India done');

  await browser.close();
  console.log('All screenshots saved!');
})();
