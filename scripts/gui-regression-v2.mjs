import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9225');
const page = browser.contexts()[0].pages().find(p => p.url().includes('tauri.localhost'));
page.setDefaultTimeout(15000);
const failures = [];
page.on('pageerror',e=>failures.push(e.message));
const results = [];
const resume=process.argv.includes('--resume');
if(resume) {
  const previous=JSON.parse(await fs.readFile('artifacts/v2-regression-results.json','utf8'));
  results.push(...previous.results);
  if(await page.getByRole('dialog').count()) {await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});}
}
const log = (name, detail='') => { results.push({name,pass:true,detail}); fsSync.writeFileSync('artifacts/v2-regression-results.json',JSON.stringify({results,pageErrors:failures},null,2)); console.log(`PASS ${name}${detail?' — '+detail:''}`); };
const ready = async () => { await page.locator('.statusbar').getByText('Ready',{exact:true}).waitFor(); };
const output = async () => {
  if(await page.getByRole('button',{name:'Dismiss notification',exact:true}).count()) await page.getByRole('button',{name:'Dismiss notification',exact:true}).click();
  await page.getByRole('button',{name:'Copy output',exact:true}).click();
  await page.getByText('Copied to clipboard',{exact:true}).waitFor();
  for(let i=0;i<6;i++) { try { return await page.evaluate(()=>window.__TAURI_INTERNALS__.invoke('clipboard_read')); } catch(e) { if(i===5) throw e; await page.waitForTimeout(80); } }
};
const run = async (command, token) => {
  await ready();
  await page.locator('.terminal-host:visible textarea').focus();
  await page.keyboard.press('Control+c');
  await page.waitForTimeout(40);
  await ready();
  await page.getByLabel('Command input',{exact:true}).fill(command);
  await page.locator('.command-bar').getByRole('button',{name:'Run',exact:true}).click();
  if(token) await page.waitForFunction(t=>Array.from(document.querySelectorAll('.terminal-host')).find(el=>getComputedStyle(el).display!=='none')?.textContent.includes(t),token);
  await ready();
};
const terminal = () => page.locator('.terminal-host:visible textarea');
const fixture = path.resolve("artifacts/fixtures/space café O'Brien $value; literal");
await fs.mkdir(fixture,{recursive:true});
await fs.writeFile(path.join(fixture,'hello.txt'),'Relay test fixture\n');
const quote = p => `'${p.replaceAll("'","''")}'`;
await ready();

if(!resume) {
await run('$relayState = 123; Write-Output ("STATE_RETAINED=" + $relayState)','STATE_RETAINED=123');
await run('Write-Output ("SECOND_COMMAND=" + $relayState)','SECOND_COMMAND=123');
assert.match(await output(),/SECOND_COMMAND=123/);
log('Persistent shell state through GUI commands');

await terminal().focus();
await page.keyboard.type('Write-Output "KEYBOARD_INPUT_OK"');
await page.keyboard.press('Enter');
await page.waitForTimeout(100);
await ready();
assert.match(await output(),/KEYBOARD_INPUT_OK/);
log('Direct terminal keyboard input and Enter');

await page.getByRole('button',{name:'Actions',exact:true}).click();
await page.getByRole('button',{name:'Add action',exact:true}).click();
await page.getByLabel('Action name',{exact:true}).fill('Fixture check');
await page.getByLabel('Action description',{exact:true}).fill('Unicode, quoting and the chosen directory');
await page.getByLabel('PowerShell command',{exact:true}).fill('Write-Output ("ACTION_PATH=" + $PWD.Path); Write-Output "café λ 日本語 ✓"');
await page.getByLabel('Action working directory',{exact:true}).fill(fixture);
await page.getByRole('button',{name:'Save action',exact:true}).click();
const actionRow = page.locator('.action-row').filter({has:page.getByText('Fixture check',{exact:true})});
await actionRow.getByRole('button',{name:'Insert',exact:true}).click();
await page.waitForTimeout(100);
assert.equal(await page.locator('.statusbar').getByText('Ready',{exact:true}).count(),1);
let text = await output();
assert(!text.includes('ACTION_PATH='+fixture),'Insert must not execute');
log('Saved action Insert is distinct from Run');
await terminal().focus(); await page.keyboard.press('Control+c'); await ready();
await actionRow.getByRole('button',{name:'Run',exact:true}).click();
await page.waitForTimeout(100);
await ready();
text = await output();
assert(text.includes('ACTION_PATH='+fixture));
assert(text.includes('café λ 日本語 ✓'));
assert.equal(await page.locator('.breadcrumbs').getAttribute('title'),fixture);
log('Saved action executes in intended session; literal Unicode/apostrophe/$/semicolon folder',fixture);

await page.getByRole('button',{name:'Favourite Fixture check',exact:true}).click();
await page.getByRole('button',{name:'Move Fixture check up',exact:true}).click();
await page.getByRole('button',{name:'Edit Fixture check',exact:true}).click();
await page.getByLabel('Action description',{exact:true}).fill('Edited and persisted');
await page.getByRole('button',{name:'Save action',exact:true}).click();
log('Action add, edit, reorder and favourite controls');

await page.getByRole('button',{name:'Add action',exact:true}).click();
await page.getByLabel('Action name',{exact:true}).fill('Delete me');
await page.getByLabel('PowerShell command',{exact:true}).fill('Write-Output "not executed"');
await page.getByRole('button',{name:'Save action',exact:true}).click();
await page.getByRole('button',{name:'Edit Delete me',exact:true}).click();
await page.getByRole('button',{name:'Delete',exact:true}).click();
await page.getByRole('button',{name:'Delete',exact:true}).click();
assert.equal(await page.getByText('Delete me',{exact:true}).count(),0);
log('Action delete through GUI without executing');

await run('1..30 | ForEach-Object { Write-Output ("STREAM_TICK=" + $_); Start-Sleep -Milliseconds 120 }');
// The helper above waits for completion; separately verify cancellation with a truly ongoing loop.
await page.getByLabel('Command input',{exact:true}).fill('1..100 | ForEach-Object { Write-Output ("CANCEL_TICK=" + $_); Start-Sleep -Milliseconds 150 }');
await page.locator('.command-bar').getByRole('button',{name:'Run',exact:true}).click();
await page.waitForFunction(()=>document.querySelector('.terminal-host')?.textContent.includes('CANCEL_TICK=3'));
await page.getByRole('button',{name:'Interrupt Ctrl C',exact:false}).click();
await ready();
text = await output();
assert.match(text,/CANCEL_TICK=3/); assert(!text.includes('CANCEL_TICK=100'));
log('Long-running streaming output and GUI Ctrl+C cancellation');

await page.getByRole('button',{name:'Workspaces',exact:true}).click();
await page.getByRole('button',{name:'Add workspace',exact:true}).click();
await page.getByLabel('Workspace name',{exact:true}).fill('Relay test workspace');
await page.getByLabel('Workspace folder',{exact:true}).fill(fixture);
await page.getByRole('button',{name:'Pin workspace',exact:true}).click();
await page.getByRole('button',{name:'Relay test workspace',exact:false}).first().click();
await ready();
await run('Write-Output ("INDEPENDENT=" + [bool](Get-Variable relayState -ErrorAction SilentlyContinue)); $tabTwo = 456','INDEPENDENT=False');
await page.getByRole('tab',{name:'PowerShell',exact:true}).click();
await run('Write-Output ("ORIGINAL_STATE=" + $relayState)','ORIGINAL_STATE=123');
await page.locator('.workspace-open').filter({hasText:'Relay test workspace'}).click();
await run('Write-Output ("WORKSPACE_STATE=" + $tabTwo)','WORKSPACE_STATE=456');
assert.equal(await page.getByRole('tab').count(),2);
log('Independent tabs and one-click workspace session retention');

await page.getByRole('button',{name:'New tab',exact:true}).click(); await ready();
assert.equal(await page.getByRole('tab').count(),3);
await page.getByRole('button',{name:'Close '+path.basename(fixture),exact:true}).click();
await page.getByRole('dialog').waitFor();
await page.getByRole('button',{name:'Keep working',exact:true}).click();
assert.equal(await page.getByRole('tab').count(),3);
await page.keyboard.press('Control+Shift+w');
await page.getByRole('button',{name:'End session',exact:true}).click();
await page.waitForFunction(()=>document.querySelectorAll('[role="tab"]').length===2);
log('Three simultaneous tabs; close cancellation and deliberate process termination');

await page.keyboard.press('Control+Shift+l');
await page.getByLabel('Folder path',{exact:true}).fill('C:\\AI');
await page.getByRole('button',{name:'Go to folder path',exact:true}).click();
await page.getByLabel('Search folders',{exact:true}).fill('Nostalgia');
await page.getByRole('button',{name:'Nostalgia C:\\AI\\Nostalgia',exact:true}).click();
await page.getByRole('button',{name:'Favourite selected folder',exact:true}).click();
await page.getByRole('button',{name:'Open new tab',exact:true}).click();
await ready();
assert.equal(await page.locator('.breadcrumbs').getAttribute('title'),'C:\\AI\\Nostalgia');
log('Searchable folder browser, discovered projects, favourite folder, new tab cwd');

await run('git --version; git -C C:\\AI\\Nostalgia rev-parse --is-inside-work-tree; git -C C:\\AI\\Nostalgia status --short','git version');
assert.match(await output(),/git version/);
log('Real Git commands (read-only existing repository)');

await page.evaluate(()=>window.__TAURI_INTERNALS__.invoke('clipboard_write',{text:'Write-Output "PASTE_UNICODE_café_λ"'}));
await terminal().focus(); await page.keyboard.press('Control+Shift+v');
await page.waitForFunction(()=>Array.from(document.querySelectorAll('.terminal-host')).find(el=>getComputedStyle(el).display!=='none')?.textContent.includes('PASTE_UNICODE_café_λ'));
await page.keyboard.press('Enter'); await ready();
assert.match(await output(),/PASTE_UNICODE_café_λ/);
await terminal().focus(); await page.keyboard.press('ArrowUp'); await page.keyboard.press('Enter'); await ready();
log('Native clipboard paste, Unicode and PowerShell command history');

await page.locator('.terminal-host:visible').click({button:'right',position:{x:50,y:50}});
await page.getByRole('button',{name:'Select all',exact:true}).click();
await page.keyboard.press('Control+Shift+c');
await page.waitForTimeout(120);
const selection=await page.evaluate(()=>window.__TAURI_INTERNALS__.invoke('clipboard_read'));
assert.match(selection,/PASTE_UNICODE_café_λ/);
await page.locator('.terminal-host:visible').click({position:{x:40,y:50}});
log('Terminal text selection, context menu and copy shortcut');
}

await page.keyboard.press('Control+Shift+f');
await page.getByLabel('Find in terminal',{exact:true}).fill('PASTE_UNICODE');
await page.waitForTimeout(120);
assert.equal(await page.getByText('No matches',{exact:true}).count(),0);
await page.getByRole('button',{name:'Close terminal search',exact:true}).click();
await page.keyboard.press('Control+Shift+p');
await page.getByLabel('Search commands',{exact:true}).fill('Fixture');
await page.getByRole('button',{name:/Insert Fixture check/}).waitFor();
assert.equal(await page.getByRole('button',{name:/Insert Fixture check/}).count(),1);
await page.keyboard.press('Escape');
log('Terminal search and searchable keyboard command palette');

await page.evaluate(()=>window.__TAURI_INTERNALS__.invoke('clipboard_write',{text:'Write-Output "MULTI_ONE"\nWrite-Output "MULTI_TWO"\n'}));
await terminal().focus(); await page.keyboard.press('Control+Shift+v');
await page.getByRole('dialog',{name:'Paste multiple lines?',exact:true}).waitFor();
await page.getByRole('button',{name:'Cancel',exact:true}).click();
log('Multiline clipboard review with cancel');

const largeStart=performance.now();
const largeEnd='LARGE_END_'+Date.now();
await run(`Write-Output "LARGE_BEGIN"; 1..20000 | ForEach-Object { "LINE_$($_.ToString(\"D5\")) · café λ · 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" }; Write-Output "${largeEnd}"`);
await page.waitForFunction(token=>Array.from(document.querySelectorAll('.terminal-host .xterm-rows>div')).some(el=>el.textContent.trim()===token),largeEnd);
const largeMs=Math.round(performance.now()-largeStart);
const largeText=await output();
assert.match(largeText,/LINE_20000/); assert.match(largeText,/LARGE_END/);
assert(!largeText.includes('LINE_00001'),'Bounded 10,000-line scrollback should discard oldest lines');
log('Substantial output and bounded scrollback',`20,000 lines in ${largeMs} ms; ${largeText.length} characters retained`);
const responsivenessStart=performance.now();
await page.getByRole('button',{name:'Actions',exact:true}).click();
await page.getByRole('button',{name:'Add action',exact:true}).waitFor();
log('GUI response after large output',`${Math.round(performance.now()-responsivenessStart)} ms`);

const oldTop=await page.locator('.terminal-host:visible .xterm-rows').innerText();
await page.locator('.terminal-host:visible').hover(); await page.mouse.wheel(0,-800);
await page.waitForTimeout(150);
const scrolled=await page.locator('.terminal-host:visible .xterm-rows').innerText();
assert.notEqual(oldTop,scrolled);
await terminal().focus(); await page.keyboard.press('Control+End');
log('Mouse wheel scroll through substantial terminal output');

await page.getByRole('button',{name:'Settings · Ctrl+,',exact:true}).click();
await page.getByRole('button',{name:'Light',exact:true}).click();
await page.getByRole('button',{name:'Increase text size',exact:true}).click();
await page.getByRole('button',{name:'Done',exact:true}).click();
assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'light');
await page.evaluate(()=>window.__TAURI_INTERNALS__.invoke('plugin:window|set_size',{label:'main',value:{Logical:{width:1366,height:768}}}));
await page.waitForTimeout(250);
await run('Write-Output ("CONPTY_SIZE=" + [Console]::WindowWidth + "x" + [Console]::WindowHeight)','CONPTY_SIZE=');
const sizeText=await output();
const dimensions=await page.locator('.status-dimensions').innerText();
const [columns,rows]=dimensions.split('×').map(v=>Number(v.trim()));
assert(sizeText.includes(`CONPTY_SIZE=${columns}x${rows}`));
await page.screenshot({path:'artifacts/screenshots/light-1366x768.png'});
assert.equal(await page.evaluate(()=>innerWidth),1366);
log('Light theme, scaling and native 1366×768 window');

await page.getByRole('button',{name:'Settings · Ctrl+,',exact:true}).click();
await page.getByRole('button',{name:'Dark',exact:true}).click();
await page.getByRole('button',{name:'Decrease text size',exact:true}).click();
await page.getByRole('button',{name:'Done',exact:true}).click();
await page.evaluate(()=>window.__TAURI_INTERNALS__.invoke('plugin:window|set_size',{label:'main',value:{Logical:{width:1920,height:1080}}}));
await page.waitForTimeout(250);
await page.screenshot({path:'artifacts/screenshots/dark-1920x1080.png'});
assert.equal(await page.evaluate(()=>innerWidth),1920);
log('Dark theme and native 1920×1080 window');

await page.keyboard.press('Control+Shift+b');
await page.locator('.tools-panel').waitFor({state:'hidden'});
assert.equal(await page.locator('.tools-panel').count(),0);
await page.keyboard.press('Control+Shift+b');
await page.locator('.tools-panel').waitFor();
assert.equal(await page.locator('.tools-panel').count(),1);
log('Collapsible panel and keyboard shortcut');

await page.waitForTimeout(600);
const saved=JSON.parse(await fs.readFile('artifacts/v2-regression-profile/settings.json','utf8'));
assert.equal(saved.theme,'dark');
assert(saved.actions.some(a=>a.name==='Fixture check'&&a.description==='Edited and persisted'&&a.favorite));
assert(saved.favorites.includes('C:\\AI\\Nostalgia'));
assert(saved.workspaces.some(w=>w.name==='Relay test workspace'));
log('Persisted settings, actions, favourites, workspaces and tab directories');
assert.deepEqual(failures,[]);
await fs.writeFile('artifacts/v2-regression-results.json',JSON.stringify({results,pageErrors:failures},null,2));
await browser.close();
