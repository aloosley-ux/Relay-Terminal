import {chromium} from 'playwright';
const b=await chromium.connectOverCDP(`http://127.0.0.1:${process.argv[2]||9244}`);
const p=b.contexts().flatMap(c=>c.pages()).find(p=>p.url().includes('tauri.localhost'));
console.log(await p.locator('body').innerText());
console.log(await p.evaluate(()=>({status:document.querySelector('.statusbar')?.dataset.status,focus:document.activeElement?.outerHTML})));
await p.screenshot({path:`artifacts/relay4/inspect-${process.argv[2]||9244}.png`});await b.close();
