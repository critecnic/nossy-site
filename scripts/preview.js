const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const p = await b.newPage();
  const d = '/home/z/my-project/download/';

  await p.setViewport({ width: 1440, height: 900 });

  // 1 Home
  await p.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  await p.screenshot({ path: d + 'preview-home.png' });
  console.log('1 Home OK');

  // 2 Home countries section
  await p.evaluate(() => window.scrollTo(0, 1400));
  await new Promise(r => setTimeout(r, 1000));
  await p.screenshot({ path: d + 'preview-home-countries.png' });
  console.log('2 Countries OK');

  // 3 India
  await p.goto('http://localhost:3000/in', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  await p.screenshot({ path: d + 'preview-india.png' });
  console.log('3 India OK');

  // 4 Brazil
  await p.goto('http://localhost:3000/br', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  await p.screenshot({ path: d + 'preview-brazil.png' });
  console.log('4 Brazil OK');

  // 5 USA
  await p.goto('http://localhost:3000/us', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  await p.screenshot({ path: d + 'preview-usa.png' });
  console.log('5 USA OK');

  // 6 Nigeria
  await p.goto('http://localhost:3000/ng', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  await p.screenshot({ path: d + 'preview-nigeria.png' });
  console.log('6 Nigeria OK');

  // 7 Mobile Home
  await p.setViewport({ width: 390, height: 844 });
  await p.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  await p.screenshot({ path: d + 'preview-mobile-home.png' });
  console.log('7 Mobile Home OK');

  // 8 Mobile India
  await p.goto('http://localhost:3000/in', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  await p.screenshot({ path: d + 'preview-mobile-india.png' });
  console.log('8 Mobile India OK');

  // 9 Mobile Brazil
  await p.goto('http://localhost:3000/br', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  await p.screenshot({ path: d + 'preview-mobile-brazil.png' });
  console.log('9 Mobile Brazil OK');

  // SEO check
  await p.goto('http://localhost:3000/ng', { waitUntil: 'networkidle2', timeout: 30000 });
  const c = await p.content();
  const tm = c.match(/<title[^>]*>([^<]+)<\/title>/);
  const dm = c.match(/name="description" content="([^"]+)"/);
  console.log('---SEO---');
  console.log('Title:', tm ? tm[1] : 'N/A');
  console.log('Desc:', dm ? dm[1].substring(0, 150) : 'N/A');

  await b.close();
  console.log('DONE');
})();
