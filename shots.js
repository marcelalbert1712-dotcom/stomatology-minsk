const puppeteer = require('puppeteer');
const path = require('path');

const SHOTS = [
  { name: 'hero', selector: '#top', fullPage: false },
  { name: 'features', selector: '#top ~ .section', fullPage: false },
  { name: 'catalog', selector: '#clinics', fullPage: false },
  { name: 'prices', selector: '#prices', fullPage: false },
  { name: 'tourism', selector: '#tourism', fullPage: false },
  { name: 'how', selector: '#how', fullPage: false },
  { name: 'reviews', selector: '#reviews', fullPage: false },
  { name: 'faq', selector: '#faq', fullPage: false },
  { name: 'full', selector: 'body', fullPage: true }
];

(async () => {
  const outDir = path.join(__dirname, 'images');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  for (const s of SHOTS) {
    try {
      if (s.selector !== 'body') {
        await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
        }, s.selector);
        await new Promise(r => setTimeout(r, 600));
      } else {
        await page.evaluate(() => window.scrollTo(0, 0));
        await new Promise(r => setTimeout(r, 600));
      }
      await page.screenshot({ path: path.join(outDir, `stomatology-${s.name}.png`), fullPage: s.fullPage });
      console.log('OK', s.name);
    } catch (e) {
      console.log('FAIL', s.name, e.message);
    }
  }
  await browser.close();
  console.log('ALL DONE');
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
