import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const port=process.argv[2]||9237;
const browser=await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
const pages=browser.contexts().flatMap(c=>c.pages());console.log('Native WebView pages:',pages.map(p=>p.url()));
const page=pages.find(p=>p.url().includes('tauri.localhost'))||pages[0];
assert(page,'Relay WebView must run in the native Tauri app');page.setDefaultTimeout(15000);
const results=[],errors=[];page.on('pageerror',error=>errors.push(error.message));
const artifact='artifacts/appearance-tests';await fs.mkdir(artifact,{recursive:true});await fs.mkdir('docs/media',{recursive:true});
const log=(name,detail='')=>{results.push({name,pass:true,detail});console.log(`PASS ${name}${detail?` · ${detail}`:''}`);};
const native=(name,args={})=>page.evaluate(({name,args})=>window.__TAURI_INTERNALS__.invoke(name,args),{name,args});
const ready=()=>page.locator('.statusbar[data-status="ready"]').waitFor();
const openStudio=async()=>{if(!await page.locator('.appearance-studio').count())await page.getByRole('button',{name:'Appearance Studio',exact:true}).click();await page.locator('.appearance-studio').waitFor();await page.locator('.theme-tile').first().waitFor();};
const closeStudio=async()=>{if(await page.locator('.appearance-studio').count())await page.getByRole('button',{name:/Close Appearance Studio/}).click();};
const run=async(command,token)=>{await ready();await page.locator('.pane-active textarea').focus();await page.keyboard.type(command);await page.keyboard.press('Enter');if(token)await page.waitForFunction(t=>document.querySelector('.pane-active')?.textContent.includes(t),token);await ready();};
const save=async()=>{await page.getByRole('button',{name:'Apply',exact:true}).click();await page.waitForTimeout(350);};
const settings=async()=>{const boot=await native('bootstrap');return JSON.parse(await fs.readFile(boot.settingsPath,'utf8'));};
try{
 await ready();await run('$relay51=5100; Write-Output ("RELAY51="+$relay51)','RELAY51=5100');
 const host=await page.locator('.pane-active').getAttribute('data-session');
 await openStudio();
 assert.equal(await page.locator('.theme-tile').count(),5);
 assert.equal(await page.getByRole('combobox',{name:'Application chrome theme'}).count(),1);
 assert.equal(await page.getByRole('combobox',{name:'Terminal scheme'}).count(),1);
 await page.screenshot({path:'docs/media/appearance-studio-5.1.png'});
 await page.screenshot({path:`${artifact}/studio-themes-1080x720.png`});
 log('Built-in themes and independent application/terminal selectors','five live theme cards');

 const follow=page.getByRole('switch',{name:'Follow Windows light and dark'});await follow.check();
 const systemMode=await page.evaluate(()=>matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');await page.waitForFunction(mode=>document.documentElement.dataset.theme===mode,systemMode,{timeout:5000});assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),systemMode);
 await follow.uncheck();log(`Follow Windows uses the live Windows preference (${systemMode}) and restores manual mode`);

 await page.getByRole('button',{name:'Colour',exact:true}).click();await page.getByRole('tab',{name:'ANSI 16'}).click();
 assert.equal(await page.locator('.ansi-grid .color-role').count(),16);
 await page.getByRole('button',{name:/^Red /}).first().click();
 await page.getByRole('textbox',{name:'Red HEX'}).fill('#C15060');
 assert.equal(await page.locator('.ansi-grid .color-role').filter({hasText:'Red'}).first().locator('code').innerText(),'#C15060');
 assert(await page.getByText(/:1/).count());
 await page.screenshot({path:`${artifact}/studio-colour-ansi.png`});
 await save();log('All ANSI roles, precise HEX editing, live specimen and advisory contrast');

 await page.getByRole('button',{name:'Type',exact:true}).click();
 await page.getByLabel('Font size exact value').fill('16');await page.getByLabel('Line height exact value').fill('1.4');await page.getByLabel('Letter spacing exact value').fill('0.3');await page.getByLabel('Terminal padding exact value').fill('24');
 await page.getByRole('button',{name:'Block',exact:true}).click();await page.getByRole('switch',{name:'Blink cursor'}).check();await save();
 log('Typography direct numeric entry, cursor shape and blinking');

 await page.getByRole('button',{name:'Backdrop',exact:true}).click();
 await page.getByRole('radio',{name:'Solid'}).click();assert.equal(await page.getByLabel('Surface opacity').count(),0);
 await page.getByRole('radio',{name:'Gradient'}).click();assert((await page.getByLabel('Surface opacity').count())>0);
 await page.getByLabel('Gradient angle exact value').fill('217');await page.getByLabel('Backdrop intensity exact value').fill('0.72');
 await page.screenshot({path:`${artifact}/studio-gradient-effects.png`});await save();
 await page.getByRole('radio',{name:'Wallpaper'}).click();
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVQImWP4z8Dwn4GBgYGJAQoAHgQCAf4W0XcAAAAASUVORK5CYII=','base64');
 await page.locator('input[type=file]').nth(1).setInputFiles({name:'wallpaper.png',mimeType:'image/png',buffer:png});
 await page.getByLabel('Horizontal position exact value').fill('24');await page.getByLabel('Vertical position exact value').fill('72');await save();
 await page.getByRole('radio',{name:'Ambient'}).click();await page.getByRole('switch',{name:'Animate ambient background'}).check();await page.getByLabel('Animation duration exact value').fill('60');await save();
 log('Mode-specific background controls, validated wallpaper positioning and ambient motion');

 await page.getByRole('button',{name:'Themes',exact:true}).click();
 await page.getByLabel('Theme name').fill('Studio Acceptance');await page.getByRole('button',{name:'Save custom theme',exact:true}).click();
 await page.waitForTimeout(200);assert((await settings()).appearance.themes.some(t=>t.name==='Studio Acceptance'));
 const renamed=page.getByRole('button',{name:'Rename Studio Acceptance'});await renamed.click();await page.getByRole('textbox',{name:'New theme name'}).fill('Studio Acceptance Renamed');await page.getByRole('button',{name:'Save name'}).click();
 await page.waitForTimeout(200);assert((await settings()).appearance.themes.some(t=>t.name==='Studio Acceptance Renamed'));
 await page.getByRole('button',{name:'Duplicate Studio Acceptance Renamed'}).click();
 assert((await settings()).appearance.themes.some(t=>t.name==='Studio Acceptance Renamed copy'));
 await page.getByRole('button',{name:'Delete Studio Acceptance Renamed',exact:true}).click();await page.getByRole('button',{name:'Undo theme deletion'}).click();
 await page.locator('input[type=file]').first().setInputFiles('artifacts/appearance-tests/exported-theme.json');await page.getByRole('status').filter({hasText:'Imported theme saved'}).waitFor();
 await fs.writeFile(`${artifact}/invalid-theme.json`,'{"format":"relay-theme","version":999}');
 await page.locator('input[type=file]').first().setInputFiles(`${artifact}/invalid-theme.json`);await page.getByRole('alert').filter({hasText:'Unsupported theme format or version'}).waitFor();
 await page.screenshot({path:`${artifact}/studio-theme-import-error.png`});log('Theme save, rename, duplicate, delete undo, import/export data and invalid-import recovery');

 await page.getByLabel('Appearance scope',{exact:true}).selectOption('session');
 await page.getByRole('button',{name:/Preview Carbon terminal theme/}).click();await save();
 let saved=await settings();assert(saved.appearance.sessions[host]);
 await page.getByRole('button',{name:/Use inherited/}).click();await page.waitForTimeout(200);saved=await settings();assert(!saved.appearance.sessions[host]);
 await page.screenshot({path:`${artifact}/studio-scope-inheritance.png`});await closeStudio();await run('Write-Output ("STUDIO_HOST="+$relay51)','STUDIO_HOST=5100');assert.equal(await page.locator('.pane-active').getAttribute('data-session'),host);log('Session override Apply/removal and original shell survives Studio edits');

 if(!await page.getByRole('button',{name:'Add workspace'}).count())await page.getByRole('button',{name:'Toggle navigation'}).click();
 await page.getByRole('button',{name:'Add workspace'}).click();const boot=await native('bootstrap');await page.getByLabel('Workspace name').fill('Appearance Scope Test');await page.getByRole('textbox',{name:'Workspace folder'}).fill(boot.home);await page.getByRole('button',{name:'Pin workspace'}).click();
 const workspaceRow=page.locator('.workspace-row').filter({hasText:'Appearance Scope Test'});await workspaceRow.waitFor();await workspaceRow.locator('.workspace-open').click();await page.waitForFunction(()=>document.querySelectorAll('.tab').length>=2);
 const workspaceKey=await page.locator('.pane-active').getAttribute('data-session'),workspaceId=(await settings()).workspaces.find(w=>w.name==='Appearance Scope Test').id;
 await page.getByRole('button',{name:'Appearance Studio',exact:true}).click();await page.getByLabel('Appearance scope',{exact:true}).selectOption('workspace');await page.getByRole('combobox',{name:'Terminal scheme'}).selectOption('carbon');await save();
 await page.getByLabel('Appearance scope',{exact:true}).selectOption('session');await page.getByRole('combobox',{name:'Terminal scheme'}).selectOption('frost');await save();saved=await settings();assert.equal(saved.appearance.workspaces[workspaceId].terminalTheme,'carbon');assert.equal(saved.appearance.sessions[workspaceKey].terminalTheme,'frost');
 await closeStudio();await workspaceRow.click({button:'right'});await page.locator('.quick-appearance').waitFor();assert.equal(await page.getByLabel('Appearance target').inputValue(),'workspace');assert.equal(await page.getByLabel('Quick terminal theme').inputValue(),'carbon');await page.getByText(/This session's override remains active/).waitFor();
 await page.getByRole('button',{name:'Open full Appearance Studio'}).click();await page.locator('.appearance-studio').waitFor();assert.equal(await page.getByLabel('Appearance scope',{exact:true}).inputValue(),'workspace');assert.equal(await page.getByRole('combobox',{name:'Terminal scheme'}).inputValue(),'carbon');
 await page.getByLabel('Appearance scope',{exact:true}).selectOption('session');assert.equal(await page.getByRole('combobox',{name:'Terminal scheme'}).inputValue(),'frost');await page.getByRole('button',{name:/Use inherited/}).click();await page.waitForTimeout(200);saved=await settings();assert(!saved.appearance.sessions[workspaceKey]);assert.equal(await page.getByRole('combobox',{name:'Terminal scheme'}).inputValue(),'carbon');
 await closeStudio();await page.getByRole('button',{name:'Toggle navigation'}).click();log('Workspace Quick/Studio target resolution, session override precedence and inherited return');

 await closeStudio();await page.locator('.tab').first().click({button:'right'});await page.locator('.quick-appearance').waitFor();
 assert(await page.getByRole('dialog',{name:/Quick appearance for/}).count());
 await page.getByLabel('Quick terminal theme').selectOption('carbon');await page.getByRole('button',{name:'Apply',exact:true}).last().click();
 await page.waitForTimeout(250);assert((await settings()).appearance.sessions[host]?.terminalTheme==='carbon');
 await page.locator('.tab').first().click({button:'right'});await page.getByRole('button',{name:'Open full Appearance Studio'}).click();await page.locator('.appearance-studio').waitFor();
 await page.getByRole('button',{name:'Themes',exact:true}).click();
 const tabColor=page.getByRole('button',{name:/Tab colour/});await tabColor.click();await page.getByLabel('Tab colour HEX').fill('#C59455');
 await page.getByLabel('Tab identity icon').selectOption('folder');await save();
 assert((await settings()).appearance.sessions[host].tabIdentity.icon==='folder');
 log('Tab context quick editor, full Studio handoff, session identity and palette persistence');

 await page.getByRole('button',{name:'Split terminal'}).click();await page.waitForFunction(()=>Array.from(document.querySelectorAll('.terminal-host')).filter(e=>getComputedStyle(e).display!=='none').length===2);
 const panes=page.locator('.terminal-host:visible');await panes.nth(1).click();await run('$relay51split=5101; Write-Output ("PERSISTED_SPLIT="+$relay51split)','PERSISTED_SPLIT=5101');await panes.nth(1).click({button:'right',position:{x:80,y:80}});await page.getByRole('menuitem',{name:/Quick appearance/}).click();await page.locator('.quick-appearance').waitFor();
 await page.getByLabel('Quick terminal theme').selectOption('frost');await page.getByRole('button',{name:'Apply',exact:true}).last().click();
 const splitKeys=await page.locator('.terminal-host:visible').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-session')));saved=await settings();assert(splitKeys.some(key=>saved.appearance.sessions[key]?.terminalTheme==='frost'));
 await run('Write-Output ("PERSISTED_SPLIT="+$relay51split)','PERSISTED_SPLIT=5101');
 log('Split session targeting and running PowerShell variable survives appearance edits');

 await native('plugin:window|set_size',{label:'main',value:{Logical:{width:760,height:500}}});await page.waitForTimeout(400);await page.screenshot({path:`${artifact}/studio-compact-760x500.png`});
 assert.equal(await page.evaluate(()=>document.querySelector('.app').scrollWidth>innerWidth),false);assert(await page.locator('.terminal-host:visible').first().evaluate(e=>e.clientWidth>250));
 await log('Compact 760×500 retains readable controls and visible split terminal');
 await native('plugin:window|set_size',{label:'main',value:{Logical:{width:1080,height:720}}});await page.waitForTimeout(350);
 await closeStudio();await page.waitForTimeout(250);assert(await page.locator(`.terminal-host[data-session="${host}"]`).count());
 saved=await settings();assert.equal(saved.appearance.themes.length<=40,true);
 await fs.writeFile(`${artifact}/native.json`,JSON.stringify({results,errors,profile:process.env.RELAY_DATA_DIR||'isolated profile'},null,2));
 assert.deepEqual(errors,[],'native WebView page errors');log('No native WebView page errors');
}catch(error){await fs.writeFile(`${artifact}/native.json`,JSON.stringify({results,errors,failure:String(error),stack:error.stack},null,2));throw error;}finally{await browser.close();}
