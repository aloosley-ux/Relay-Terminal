import {chromium} from 'playwright';import assert from 'node:assert/strict';
const b=await chromium.connectOverCDP(`http://127.0.0.1:${process.argv[2]||9245}`);const p=b.contexts().flatMap(c=>c.pages()).find(p=>p.url().includes('tauri.localhost'));p.setDefaultTimeout(15000);
const native=(name,args={})=>p.evaluate(({name,args})=>window.__TAURI_INTERNALS__.invoke(name,args),{name,args});
await p.keyboard.press('Escape');await p.getByRole('button',{name:'New tab',exact:true}).click();await p.locator('.statusbar[data-status="ready"]').waitFor();
await p.locator('.pane-active textarea').focus();await p.keyboard.type('Get-ChildItem -Name');await p.keyboard.press('Enter');await p.waitForTimeout(200);await p.locator('.statusbar[data-status="ready"]').waitFor();
for(const [name,width,height] of [['menu',1080,720],['menu-compact',760,500]]){
await native('plugin:window|set_size',{label:'main',value:{Logical:{width,height}}});await p.waitForTimeout(200);await p.locator('.pane-active textarea').focus();await p.keyboard.press('Shift+F10');await p.getByRole('menu').waitFor();
const box=await p.getByRole('menu').boundingBox();const size=await p.evaluate(()=>({w:innerWidth,h:innerHeight}));assert(box.x>=0&&box.y>=0&&box.x+box.width<=size.w&&box.y+box.height<=size.h);await p.screenshot({path:`artifacts/relay4/${name}-native.png`});await p.keyboard.press('Escape');}
await b.close();console.log('PASS native context menu captures and compact viewport containment');
