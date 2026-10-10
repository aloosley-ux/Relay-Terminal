import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
const executable=path.resolve('src-tauri/target/release/relay-terminal.exe');
const metrics=[];
for(let iteration=0;iteration<3;iteration++) {
  const port=9230+iteration;
  const dataDir=path.resolve(`artifacts/benchmark-profile-${iteration}`);
  await fs.mkdir(dataDir,{recursive:true});
  await fs.writeFile(path.join(dataDir,'settings.json'),JSON.stringify({theme:'dark',restoreTabs:false}));
  const start=performance.now();
  const child=spawn(executable,[],{cwd:path.resolve('.'),env:{...process.env,RELAY_DATA_DIR:dataDir,WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS:`--remote-debugging-port=${port} --remote-debugging-address=127.0.0.1`},stdio:'ignore'});
  const deadline=start+15000;
  let browser;
  while(performance.now()<deadline) {
    try { const r=await fetch(`http://127.0.0.1:${port}/json/version`); if(r.ok) { browser=await chromium.connectOverCDP(`http://127.0.0.1:${port}`); break; } } catch {}
    await new Promise(r=>setTimeout(r,40));
  }
  if(!browser) {child.kill();throw new Error('WebView2 startup timed out');}
  const context=browser.contexts()[0];
  let page=context.pages().find(p=>p.url().includes('tauri.localhost')) || context.pages()[0];
  if(!page) {page=await context.waitForEvent('page',{timeout:15000});}
  await page.getByRole('button',{name:'New tab',exact:true}).waitFor();
  const windowReadyMs=Math.round(performance.now()-start);
  await page.locator('.statusbar').getByText('Ready',{exact:true}).waitFor({timeout:15000});
  await page.waitForFunction(()=>document.querySelector('.xterm-rows')?.textContent.includes('❯'));
  const shellReadyMs=Math.round(performance.now()-start);
  metrics.push({iteration:iteration+1,pid:child.pid,windowReadyMs,shellReadyMs});
  console.log(metrics.at(-1));
  if(iteration===2 && process.argv.includes('--keep-last')) {
    await browser.close(); child.unref(); continue;
  }
  const exited=new Promise((resolve,reject)=>{child.once('exit',resolve);setTimeout(()=>reject(new Error('GUI close did not exit the process')),10000).unref();});
  await page.getByRole('button',{name:'Close window',exact:true}).click();
  await page.getByRole('button',{name:'End sessions & close',exact:true}).click();
  await exited;
  await browser.close().catch(()=>{});
  await new Promise(r=>setTimeout(r,300));
}
await fs.writeFile('artifacts/startup-metrics.json',JSON.stringify({method:'Process spawn to rendered controls and real PowerShell prompt; 40 ms endpoint sampling; three consecutive warm filesystem runs; CDP observer overhead included.',metrics},null,2));
