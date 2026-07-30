const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    // 1. Homepage Desktop
    const page1 = await browser.newPage();
    await page1.setViewport({ width: 1440, height: 900 });
    await page1.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 30000 });
    await page1.waitForTimeout(2000);
    await page1.screenshot({
      path: path.join('/home/z/my-project/download', 'ww-global-home.png'),
      fullPage: true
    });
    console.log('Homepage screenshot done');

    // 2. Homepage Mobile
    const page2 = await browser.newPage();
    await page2.setViewport({ width: 390, height: 844 });
    await page2.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 30000 });
    await page2.waitForTimeout(2000);
    await page2.screenshot({
      path: path.join('/home/z/my-project/download', 'ww-global-mobile.png'),
      fullPage: true
    });
    console.log('Mobile screenshot done');

    // 3. India country page (Priority 1)
    const page3 = await browser.newPage();
    await page3.setViewport({ width: 1440, height: 900 });
    await page3.goto('http://localhost:3000/in', { waitUntil: 'networkidle2', timeout: 30000 });
    await page3.waitForTimeout(2000);
    await page3.screenshot({
      path: path.join('/home/z/my-project/download', 'ww-india-jobs.png'),
      fullPage: true
    });
    console.log('India page screenshot done');

    // 4. Brazil country page
    const page4 = await browser.newPage();
    await page4.setViewport({ width: 1440, height: 900 });
    await page4.goto('http://localhost:3000/br', { waitUntil: 'networkidle2', timeout: 30000 });
    await page4.waitForTimeout(2000);
    await page4.screenshot({
      path: path.join('/home/z/my-project/download', 'ww-brazil-jobs.png'),
      fullPage: true
    });
    console.log('Brazil page screenshot done');

    // 5. USA country page
    const page5 = await browser.newPage();
    await page5.setViewport({ width: 1440, height: 900 });
    await page5.goto('http://localhost:3000/us', { waitUntil: 'networkidle2', timeout: 30000 });
    await page5.waitForTimeout(2000);
    await page5.screenshot({
      path: path.join('/home/z/my-project/download', 'ww-usa-jobs.png'),
      fullPage: true
    });
    console.log('USA page screenshot done');

    // 6. Check hreflang tags in HTML
    const html = await page1.content();
    const hreflangMatches = html.match(/hrefLang="[^"]+"/g);
    console.log(`\nHreflang tags found: ${hreflangMatches ? hreflangMatches.length : 0}`);
    if (hreflangMatches) {
      console.log('Sample hreflang tags:');
      hreflangMatches.slice(0, 8).forEach(m => console.log('  ' + m));
    }

    // 7. Check JSON-LD
    const jsonldMatches = html.match(/application\/ld\+json/g);
    console.log(`\nJSON-LD scripts found: ${jsonldMatches ? jsonldMatches.length : 0}`);

    console.log('\nAll screenshots saved to /home/z/my-project/download/');

  } catch (err) {
    console.error('Error:', err.message);
  }

  await browser.close();
})();
