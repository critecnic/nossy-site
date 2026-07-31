const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox','--disable-setuid-sandbox']});

  // 1. English homepage
  let page = await browser.newPage();
  await page.setViewport({width: 1440, height: 900, deviceScaleFactor: 2});
  await page.goto('http://localhost:3456/', {waitUntil: 'networkidle2', timeout: 15000});
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({path: '/home/z/my-project/download/lang-en-home.png', fullPage: false});
  console.log('OK: lang-en-home.png');
  await page.close();

  // 2. Portuguese (BR) homepage - click language dropdown and select PT-BR
  page = await browser.newPage();
  await page.setViewport({width: 1440, height: 900, deviceScaleFactor: 2});
  await page.goto('http://localhost:3456/', {waitUntil: 'networkidle2', timeout: 15000});
  await new Promise(r => setTimeout(r, 1000));
  // Click the language dropdown button
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('English') || text.includes('Language')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));
  // Click Portuguese option
  const options = await page.$$('button');
  for (const btn of options) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Português')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({path: '/home/z/my-project/download/lang-pt-home.png', fullPage: false});
  console.log('OK: lang-pt-home.png');
  await page.close();

  // 3. Portuguese Brazil country page
  page = await browser.newPage();
  await page.setViewport({width: 1440, height: 900, deviceScaleFactor: 2});
  await page.goto('http://localhost:3456/br', {waitUntil: 'networkidle2', timeout: 15000});
  await new Promise(r => setTimeout(r, 1000));
  const btns2 = await page.$$('button');
  for (const btn of btns2) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('English') || text.includes('Language')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));
  const opts2 = await page.$$('button');
  for (const btn of opts2) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Português')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({path: '/home/z/my-project/download/lang-pt-br.png', fullPage: false});
  console.log('OK: lang-pt-br.png');
  await page.close();

  await browser.close();
  console.log('DONE');
})();
