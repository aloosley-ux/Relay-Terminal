import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP(`http://127.0.0.1:${process.argv[2] || 9225}`);
const page = browser.contexts()[0].pages().find(p => p.url().includes('tauri.localhost'));
page.setDefaultTimeout(10000);
if(await page.getByRole('dialog').count()) { await page.keyboard.press('Escape'); await page.getByRole('dialog').waitFor({state:'hidden'}); }
await page.getByRole('button',{name:'Close window',exact:true}).click();
await page.getByRole('button',{name:'End sessions & close',exact:true}).click();
await page.waitForEvent('close',{timeout:10000}).catch(()=>{});
await browser.close().catch(()=>{});
