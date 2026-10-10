import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const b=await chromium.connectOverCDP('http://127.0.0.1:9225');
const p=b.contexts()[0].pages().find(p=>p.url().includes('tauri.localhost'));
const ready=()=>p.locator('.statusbar').getByText('Ready',{exact:true}).waitFor();
if(await p.locator('.statusbar').getByText('Running',{exact:true}).count()) {
  await p.getByRole('button',{name:'Interrupt Ctrl C',exact:false}).click();
  await ready();
  await p.keyboard.press('Control+Shift+w');await p.getByRole('button',{name:'End session',exact:true}).click();await p.getByRole('dialog').waitFor({state:'hidden'});
}
await p.getByRole('button',{name:'New tab',exact:true}).click();
await ready();await p.waitForTimeout(60);
const encoded=Buffer.from('Write-Output ("CHILD_PID=" + $PID); Start-Sleep -Seconds 60','utf16le').toString('base64');
await p.getByLabel('Command input',{exact:true}).fill(`& "$PSHOME\\powershell.exe" -NoProfile -EncodedCommand ${encoded}`);
await p.locator('.command-bar').getByRole('button',{name:'Run',exact:true}).click();
await p.waitForFunction(()=>Array.from(document.querySelectorAll('.terminal-host .xterm-rows>div')).some(el=>/^CHILD_PID=\d+$/.test(el.textContent.trim())));
const text=await p.locator('.terminal-host:visible').innerText();
const pid=Number(text.match(/^CHILD_PID=(\d+)$/m)[1]);
await p.keyboard.press('Control+Shift+w');
await p.getByRole('dialog').waitFor();
await p.getByText('A command is still running in this tab.',{exact:false}).waitFor();
await p.getByRole('button',{name:'End session',exact:true}).click();
await p.getByRole('dialog').waitFor({state:'hidden'});
await fs.writeFile('artifacts/child-close-test.json',JSON.stringify({childPid:pid,guiClosedBusySession:true,terminationVerified:false},null,2));
console.log(`Closed running native child via GUI; verify process ${pid} is gone.`);
await b.close();
