const { chromium } = require('playwright');
const fs = require('fs');

// ==================== 配置项 ====================
const STORAGE_FILE = 'storage.json'; // 你的单账号登录态文件
const KEYWORDS = ['网页设计', 'JavaWeb', 'PPT'];
const MAX_COMMENTS_PER_DAY = Math.floor(Math.random() * (10 - 5 + 1)) + 5; // 每天随机5-10条

// 🔥 高转化截流词库（痛点打击 + 强引导）
const COMMENTS_POOL = [
    `🔥 刚好手头有现成改好的！\n------------------------\n刚帮一个同学调通了类似的 JavaWeb 毕设/系统，全套源码+数据库+部署文档都在。个人全栈独立开发，包线上跑通，价格绝对比工作室香，带需求随时滴滴！`,

    `💡 赶时间的兄弟，听我一句劝：\n------------------------\n别去乱套网上的免费 PPT 模板，字一多排版必乱！我手头有大厂标准的网格骨架母版，5分钟快速排版。支持先看初稿，效率拉满，急的戳！`,

    `⚙️ 别找二道贩子了，这里纯手工定制\n------------------------\n不管是前端网页设计、3D交互还是后端功能开发，支持远程看效果演示。包售后、包教会、绝不跑路。刚交付两个单子，现在手头刚好有空，随时来！`,

    `⚡ 救急/加急的同学看过来：\n------------------------\n刚交付了一套系统的二开。卡在前后端跨域、Nginx配置或者数据库连接上的兄弟，我可以帮忙远程排查。纯手工全栈，性价比顶满，看我主页私。`
];

// ==================== 工具函数 ====================
const randomDelay = (min, max) => new Promise(res => setTimeout(res, Math.floor(Math.random() * (max - min + 1)) + min));

async function simulateHumanScroll(page) {
    console.log("📜 模拟人类浏览：正在随机滚动页面...");
    const scrollTimes = Math.floor(Math.random() * 4) + 2; 
    for (let i = 0; i < scrollTimes; i++) {
        const distance = Math.floor(Math.random() * 300) + 200;
        await page.evaluate((d) => window.scrollBy(0, d), distance);
        await randomDelay(1500, 3500);
    }
}

// ==================== 主程序 ====================
(async () => {
    console.log(`⏰ [${new Date().toLocaleString()}] 宝塔定时触发：高转化截流 Bot 开始作业...`);

    if (!fs.existsSync(STORAGE_FILE)) {
        console.error(`❌ 错误：找不到登录态文件 ${STORAGE_FILE}`);
        process.exit(1);
    }

    let browser;

    try {
        browser = await chromium.launch({
            headless: true, // 宝塔服务器环境必须为 true
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-blink-features=AutomationControlled'
            ]
        });

        const context = await browser.newContext({
            storageState: STORAGE_FILE,
            viewport: { width: 1280, height: 800 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });

        const page = await context.newPage();
        let commentCount = 0;

        console.log("🌐 打开小红书首页预热...");
        await page.goto('https://www.xiaohongshu.com/explore', { waitUntil: 'networkidle' });
        await randomDelay(3000, 6000);
        await simulateHumanScroll(page);

        const keyword = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
        console.log(`🔍 正在检索关键词: [${keyword}]`);
        
        const searchInput = await page.waitForSelector('.search-input input, input[placeholder*="搜索"], #search-input');
        await searchInput.click();
        await randomDelay(800, 1800);
        
        for (const char of keyword) {
            await page.keyboard.type(char);
            await randomDelay(150, 400);
        }
        await randomDelay(500, 1000);
        await page.keyboard.press('Enter');
        
        await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
        await randomDelay(3000, 5000);

        console.log("⏱ 尝试切换筛选条件为：最新");
        const latestTab = await page.locator('span:has-text("最新"), div:has-text("最新"), .filter-box :has-text("最新")').first();
        if (await latestTab.isVisible()) {
            await latestTab.click();
            console.log("✅ 成功切换至「最新」排序");
            await randomDelay(2500, 4500);
        }

        console.log("🎯 正在扫描当前的笔记列表...");
        const notes = await page.locator('.note-item, .feeds-container section, .cover-container').all();
        const maxNotesToVisit = Math.floor(Math.random() * 3) + 2; 

        for (let i = 0; i < Math.min(notes.length, maxNotesToVisit); i++) {
            console.log(`\n📖 [第 ${i + 1} 篇] 点击进入...`);
            await notes[i].scrollIntoViewIfNeeded();
            await randomDelay(1200, 2500);
            
            await notes[i].click();
            await randomDelay(5000, 8000); // 留足时间让笔记完全加载

            await simulateHumanScroll(page);

            // ⚠️ 警告：为了方便你现在测试定位，我设为了 true (100%触发)。
            // 等你在宝塔上看到终端打印出“✅ 成功截流”后，务必把这行改回： const shouldComment = Math.random() < 0.35;
            const shouldComment = true; 
            
            if (shouldComment && commentCount < MAX_COMMENTS_PER_DAY) {
                try {
                    console.log("💬 触发截流机制，开始使用【文本视觉定位】寻找评论框...");
                    
                    // 【终极必杀】直接找屏幕下方的“说点什么”四个字
                    const commentTrigger = page.locator('text="说点什么"').last();
                    
                    // 等待这几个字出现在屏幕上（死等 10 秒）
                    await commentTrigger.waitFor({ state: 'visible', timeout: 10000 });
                    
                    // 强行点击这几个字，激活输入光标
                    await commentTrigger.click({ force: true });
                    await randomDelay(1500, 3000);
                    
                    // 补一枪双保险：点击后真正的输入框(contenteditable)会激活
                    const realInput = page.locator('div[contenteditable="true"]').first();
                    if (await realInput.isVisible()) {
                        await realInput.click({ force: true });
                    }
                    
                    const myComment = COMMENTS_POOL[Math.floor(Math.random() * COMMENTS_POOL.length)];
                    console.log(`✍️ 正在逐字输入截流话术...`);
                    
                    // 直接敲击实体键盘发送文字
                    for (const char of myComment) {
                        await page.keyboard.type(char);
                        await randomDelay(100, 300);
                    }
                    
                    await randomDelay(1500, 2500);
                    
                    // 寻找发送按钮：同样直接找屏幕上的“发送”或“发布”
                    const sendBtn = page.locator('text="发送", text="发布", button:has-text("发送")').last();
                    await sendBtn.click({ force: true });
                    
                    commentCount++;
                    console.log(`✅ 成功截流: ${commentCount}/${MAX_COMMENTS_PER_DAY}`);
                    await randomDelay(7000, 15000); 
                    
                } catch (e) {
                    console.log("⚪ 尝试定位失败！记录案发现场...");
                    const picName = `debug_error_${i + 1}.png`;
                    
                    // 拍下当时浏览器到底看到了什么
                    await page.screenshot({ path: picName, fullPage: true });
                    
                    console.log(`📸 截图已保存至 ${picName} ，请查看报错原因：${e.message}`);
                }
            } else {
                console.log("👀 本篇仅进行深度浏览，不发表评论。");
            }

            // 退出当前笔记，切回瀑布流
            await page.keyboard.press('Escape');
            await randomDelay(2000, 4500);
        }

        console.log("\n🎉 [今日份截流任务已安全收尾] 脚本正常退出。");

    } catch (err) {
        console.error("❌ 运行时发生致命错误:", err);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();
