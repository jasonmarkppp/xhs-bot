const { chromium } = require('playwright');

(async () => {
    console.log("🚀 bot start");

    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.goto('https://www.xiaohongshu.com');

    console.log("✅ page opened");

    await page.waitForTimeout(5000);

    await browser.close();

    console.log("🏁 bot finished");
})();