const { chromium } = require('playwright');

(async () => {
  console.log("bot start");

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  const page = await browser.newPage();

  await page.goto('https://example.com');

  console.log("page loaded");

  await browser.close();
})();
