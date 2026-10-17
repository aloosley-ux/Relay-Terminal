import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { performance } from 'node:perf_hooks';

const browser = await chromium.connectOverCDP(`http://127.0.0.1:${process.argv[2] || 9225}`);
const page = browser.contexts()[0].pages().find(p => /tauri\.localhost/.test(p.url()));
assert(page, 'Native Relay WebView must be running');
page.setDefaultTimeout(15000);
const errors = [], results = [];
page.on('pageerror', e => errors.push(e.message));
const log = (name, detail = '') => { results.push({ name, pass: true, detail }); fsSync.writeFileSync('artifacts/desktop-acceptance-results.json', JSON.stringify({ results, errors }, null, 2)); console.log(`PASS ${name} ${detail}`); };
const native = (name, args = {}) => page.evaluate(({ name, args }) => window.__TAURI_INTERNALS__.invoke(name, args), { name, args });
const ready = () => page.locator('.statusbar[data-status="ready"]').waitFor();
const view = async name => { await page.getByRole('button', { name: name + ' view', exact: true }).click(); };
const output = async () => { await page.getByRole('button', { name: 'Copy all output', exact: true }).click(); await page.getByText('Copied to clipboard', { exact: true }).waitFor(); return native('clipboard_read'); };
const run = async (command, token) => {
  await view('Terminal'); if(await page.locator('.command-bar:visible').count()===0)await page.getByRole('button',{name:'Compose',exact:true}).click();
await ready();
  await page.locator('.terminal-host.pane-active textarea').focus(); await page.keyboard.press('Control+c'); await page.waitForTimeout(100); await ready();
  await page.getByLabel('Command input', { exact: true }).fill(command);
  await page.locator('.command-bar').getByRole('button', { name: 'Run', exact: true }).click();
  if (token) await page.waitForFunction(t => Array.from(document.querySelectorAll('.terminal-host')).some(e => e.textContent.includes(t)), token);
  await ready();
};
const quote = p => `'${p.replaceAll("'", "''")}'`;
const fixture = path.resolve("artifacts/v2-fixtures/Signal café O'Brien $literal;");
await fs.mkdir(fixture, { recursive: true });
const port = await new Promise(resolve => { const server = net.createServer(); server.listen(0, '127.0.0.1', () => { const p = server.address().port; server.close(() => resolve(p)); }); });
await fs.writeFile(path.join(fixture, 'package.json'), JSON.stringify({ name: 'relay-acceptance', description: 'A real local server and concurrent tasks', scripts: { serve: 'node server.mjs', check: 'node -e "console.log(\'CHECK_ACCEPTED\')"', fail: 'node -e "process.exit(7)"' } }, null, 2));
await fs.writeFile(path.join(fixture, 'server.mjs'), `import http from 'node:http';\nconst server=http.createServer((req,res)=>{res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,owner:'relay-acceptance'}));});\nserver.listen(${port},'127.0.0.1',()=>console.log('RELAY_SERVER_READY:${port}'));\nsetInterval(()=>console.log('SERVER_HEARTBEAT'),30000);\n`);
await fs.writeFile(path.join(fixture, 'notes.md'), '# Signal project\n\nUnicode: café λ 日本語 ✓\n');
await fs.writeFile(path.join(fixture, 'binary.bin'), Buffer.from([0, 1, 0, 255]));
await fs.writeFile(path.join(fixture, 'large.txt'), 'BOUNDED_PREVIEW\n' + 'x'.repeat(200000));

await ready();
await run('$relayV2 = 314; Write-Output ("PERSISTENCE=" + $relayV2)', 'PERSISTENCE=314');
await run('Write-Output ("PERSISTED=" + $relayV2); Write-Output "café λ 日本語 ✓"', 'PERSISTED=314');
assert.match(await output(), /PERSISTED=314/);
log('Persistent real PowerShell, GUI commands and Unicode');

await run(`Set-Location -LiteralPath ${quote(fixture)}; Write-Output "FIXTURE_LOCATION_READY"`, 'FIXTURE_LOCATION_READY');
assert.equal(await page.locator('.breadcrumbs').getAttribute('title'), fixture);
await view('Projects');
await page.getByRole('button', { name: 'Use terminal’s current folder', exact: true }).click();
await page.locator('.project-task').filter({ hasText: 'serve' }).waitFor();
assert.equal(await page.locator('.project-task').count(), 3);
assert.match(await page.locator('.project-description').innerText(), /real local server/);
log('Project discovery uses actual package scripts in quoted Unicode path');
await page.getByRole('button', { name: 'Pin selected project', exact: true }).click();
await page.getByLabel('Workspace name', { exact: true }).fill('Signal acceptance');
await page.getByRole('button', { name: /Pin workspace|Save workspace/, exact: true }).click();
log('Project pin uses persistent existing workspace model');

await page.locator('.project-task').filter({ hasText: 'serve' }).getByRole('button', { name: 'Run task', exact: true }).click();
await page.waitForFunction(p => document.querySelector('.terminal-host.pane-active')?.textContent.includes(`RELAY_SERVER_READY:${p}`), port);
const runningTabs = await page.getByRole('tab').count();
const serverTab = await page.getByRole('tab', { selected: true }).innerText();
assert.match(serverTab, /serve/);
assert.deepEqual(await (await fetch(`http://127.0.0.1:${port}/health`)).json(), { ok: true, owner: 'relay-acceptance' });
log('Discovered server task starts in contained PTY; real HTTP responds', `port ${port}`);
await view('Projects');
await page.locator('.project-task').filter({ hasText: 'serve' }).getByRole('button', { name: 'View session', exact: true }).click();
assert.equal(await page.getByRole('tab').count(), runningTabs);
log('Running task deduplication returns to existing session');

await view('Processes');
await page.getByText('Remote Desktop Commander', { exact: true }).waitFor({ timeout: 60000 });
await page.getByRole('button', { name: `Open localhost:${port}`, exact: true }).waitFor();
const ownPort = page.locator('.port-row').filter({ has: page.getByRole('button', { name: `Open localhost:${port}`, exact: true }) });
assert.match(await ownPort.innerText(), /Relay session/);
const serviceBefore = await native('service_inventory');
const forbidden = await native('service_control', { id: "router'; Stop-Process", action: 'Start' }).then(() => 'unexpected', e => String(e));
assert.match(forbidden, /Invalid service identifier/);
const cortanaServices = serviceBefore.services.filter(s => s.group === 'Cortana' && s.port);
if (cortanaServices.length) {
  assert.equal(cortanaServices.length, 7);
  const rdc = serviceBefore.services.find(s => s.id === 'desktop-commander');
  // Availability is environment state. Acceptance must not start an external service.
  assert.equal(rdc.controlAvailable, false); assert.deepEqual(rdc.actions, []);
  log('RDC availability observed without changing the service', `${rdc.processIds.length} process IDs`);
  await page.locator('.process-row').filter({ has: page.getByText('Remote Desktop Commander', { exact: true }) }).click();
  assert.match(await page.locator('.process-inspector').innerText(), /Controls remain with its owner/);
  await page.locator('.process-row').filter({ has: page.getByText('Model Router', { exact: true }) }).click();
  await page.locator('.process-inspector').getByRole('button', { name: 'Start', exact: true }).click();
  await page.getByRole('dialog', { name: 'Start Model Router', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  log('Canonical Cortana controls reviewed/cancelled; RDC observed; invalid controller ID refused');
  await page.locator('.process-row').filter({ has: page.getByText('Model Router', { exact: true }) }).click();
  if (await page.getByRole('button', { name: 'Router output', exact: true }).count()) {
    await page.getByRole('button', { name: 'Router output', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.log-path')?.textContent.includes('router.out.log'));
    assert(await page.locator('.log-preview').innerText());
    log('Existing service log loads without starting service');
  }
} else {
  assert.equal(cortanaServices.length, 0);
  log('Optional Cortana controller absence reported without starting external services');
}

await view('Projects');
await page.locator('.project-task').filter({ hasText: 'check' }).getByRole('button', { name: 'Run task', exact: true }).click();
await page.waitForFunction(() => document.querySelector('.terminal-host.pane-active')?.textContent.includes('CHECK_ACCEPTED'));
await ready();
await view('Processes');
await page.locator('.process-row').filter({ hasText: /Signal acceptance \/ check/ }).locator('.process-state').filter({hasText:'Completed'}).waitFor();
assert.equal(await (await fetch(`http://127.0.0.1:${port}`)).status, 200);
log('Concurrent task completes with success while existing server remains live');
await view('Projects');
await page.locator('.project-task').filter({ has: page.getByText('fail', { exact: true }) }).getByRole('button', { name: 'Run task', exact: true }).click();
await ready(); await page.waitForTimeout(600);
await view('Processes');
await page.locator('.process-row').filter({ hasText: /Signal acceptance \/ fail/ }).locator('.process-state').filter({hasText:'Failed'}).waitFor();
log('PowerShell prompt reports failed native command; task shows Failed');
await page.locator('.process-row').filter({ hasText: /Signal acceptance \/ serve/ }).locator('.process-row-main').click();
assert.match(await page.locator('.log-preview').innerText(), /RELAY_SERVER_READY/);
await page.getByRole('button', { name: 'Interrupt', exact: true }).click();
for (let i = 0; i < 30; i++) { try { await fetch(`http://127.0.0.1:${port}`); await page.waitForTimeout(100); } catch { break; } }
await assert.rejects(fetch(`http://127.0.0.1:${port}`));
log('GUI task interruption stops owned server and releases listening port');
const serviceAfter = await native('service_inventory');
if (cortanaServices.length) {
  for (const s of serviceBefore.services) { const after = serviceAfter.services.find(v => v.id === s.id); assert.deepEqual(after.processIds, s.processIds); assert.equal(after.state, s.state); }
  log('External Cortana and RDC states/process IDs unchanged through acceptance');
} else {
  assert.equal(serviceAfter.services.filter(s => s.group === 'Cortana' && s.port).length, 0);
  log('Optional external controller remained absent throughout acceptance');
}

await view('Files');
await page.getByLabel('File browser path', { exact: true }).fill(fixture);
await page.getByRole('button', { name: 'Go', exact: true }).click();
await page.locator('.file-entries').getByRole('button', { name: /notes.md/ }).click();
assert.match(await page.locator('.file-preview>pre').innerText(), /café λ 日本語 ✓/);
await page.locator('.file-entries').getByRole('button', { name: /binary.bin/ }).click();
assert.match(await page.locator('.file-preview>pre').innerText(), /Binary file/);
await page.locator('.file-entries').getByRole('button', { name: /large.txt/ }).click();
await page.getByText(/Preview limited to 128 KB/).waitFor();
assert((await page.locator('.file-preview>pre').innerText()).length <= 131072);
await page.getByLabel('Filter files', { exact: true }).fill('notes');
assert.equal(await page.locator('.file-entries>button').count(), 1);
log('Real file browsing, filtering, Unicode preview, binary detection and bounded read');

await view('Terminal'); await ready();
await page.getByRole('button', { name: 'Split terminal', exact: true }).click();
await page.waitForFunction(() => Array.from(document.querySelectorAll('.terminal-host')).filter(e => getComputedStyle(e).display !== 'none').length === 2);
await page.waitForTimeout(200);
const splitSizes = await page.locator('.terminal-host:visible').evaluateAll(els => els.map(e => e.getBoundingClientRect().width));
assert(splitSizes.every(w => w > 100));
await run('Write-Output ("SPLIT_PTY_SIZE=" + [Console]::WindowWidth + "x" + [Console]::WindowHeight)', 'SPLIT_PTY_SIZE=');
const dims = await page.locator('.status-dimensions').innerText();
assert((await output()).includes(`SPLIT_PTY_SIZE=${dims.replaceAll(' ', '').replace('×', 'x')}`));
await page.getByRole('button', { name: 'Close split view', exact: true }).click();
assert.equal(await page.locator('.terminal-host:visible').count(), 1);
log('Two live terminal panes; native ConPTY dimensions match active pane');
await page.keyboard.press('Control+Shift+p');
await page.getByLabel('Search commands', { exact: true }).fill('Processes, services');
await page.keyboard.press('Enter');
await page.getByRole('region', { name: 'Process workbench', exact: true }).waitFor();
log('Keyboard palette routes to connected process workspace');
await page.getByRole('button', {name:'Run a task',exact:true}).click();
await page.getByRole('dialog',{name:'Run a task',exact:true}).waitFor();
await page.getByLabel('Task name',{exact:true}).fill('Custom acceptance task');
await page.getByLabel('Task command',{exact:true}).fill('Write-Output "CUSTOM_TASK_OK"');
await page.getByLabel('Task folder',{exact:true}).fill(fixture);
await page.getByRole('button',{name:'Run in new session',exact:true}).click();
await page.waitForFunction(()=>document.querySelector('.terminal-host.pane-active')?.textContent.includes('CUSTOM_TASK_OK'));
await ready();
log('GUI launches arbitrary named PowerShell task with selected folder');

await native('plugin:window|set_size', { label: 'main', value: { Logical: { width: 1400, height: 880 } } });
await view('Projects'); await page.waitForTimeout(200);
await page.screenshot({ path: 'artifacts/desktop-acceptance/v2-projects-dark.png' });
await view('Processes'); await page.getByText('Remote Desktop Commander', { exact: true }).waitFor();
await page.screenshot({ path: 'artifacts/desktop-acceptance/v2-processes-dark.png' });
await view('Files'); await page.getByLabel('Filter files', { exact: true }).fill('');
await page.locator('.file-entries').getByRole('button', { name: /notes.md/ }).click();
await page.screenshot({ path: 'artifacts/desktop-acceptance/v2-files-dark.png' });
await view('Terminal'); await ready();
await page.screenshot({ path: 'artifacts/desktop-acceptance/v2-terminal-dark.png' });
await page.getByRole('button', { name: 'Settings · Ctrl+,', exact: true }).click();
await page.getByRole('button', { name: 'Light', exact: true }).click();
await page.getByRole('button', { name: 'Done', exact: true }).click();
await native('plugin:window|set_size', { label: 'main', value: { Logical: { width: 1366, height: 768 } } });
await view('Projects'); await page.waitForTimeout(200);
await page.screenshot({ path: 'artifacts/desktop-acceptance/v2-projects-light.png' });
await native('plugin:window|set_size', { label: 'main', value: { Logical: { width: 760, height: 500 } } });
await page.waitForTimeout(200);
const bounds = await page.locator('.workbench').evaluate(e => ({ scroll: e.scrollWidth, width: e.clientWidth }));
assert(bounds.scroll <= bounds.width + 1);
await page.screenshot({ path: 'artifacts/desktop-acceptance/v2-compact-light.png' });
log('Native desktop screenshots dark/light/compact; no workspace horizontal overflow');
await native('plugin:window|set_size', { label: 'main', value: { Logical: { width: 1400, height: 880 } } });
await page.getByRole('button', { name: 'Settings · Ctrl+,', exact: true }).click();
await page.getByRole('button', { name: 'Dark', exact: true }).click();
await page.getByRole('button', { name: 'Done', exact: true }).click();
await view('Terminal'); await run('Write-Output "V2_READY"', 'V2_READY');
assert.deepEqual(errors, []);
await fs.writeFile('artifacts/v2-test-fixture.json', JSON.stringify({ fixture, port }, null, 2));
await browser.close();
