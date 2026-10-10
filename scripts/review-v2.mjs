import { chromium } from 'playwright';
const b=await chromium.connectOverCDP('http://127.0.0.1:9225');
const p=b.contexts()[0].pages().find(p=>p.url().includes('tauri.localhost'));
console.log(await p.evaluate(()=>({heading:document.querySelector('.wb-heading h1')?.textContent,address:document.querySelector('[aria-label="File browser path"]')?.value,entries:document.querySelector('.file-entries')?.innerText,errors:Array.from(document.querySelectorAll('[role="alert"]')).map(e=>e.textContent),filter:document.querySelector('[aria-label="Filter files"]')?.value,dimensions:document.querySelector('.status-dimensions')?.textContent})));
await p.screenshot({path:'artifacts/screenshots/v2-review.png'});
await b.close();
