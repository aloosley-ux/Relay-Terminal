import fs from 'node:fs';
let script=fs.readFileSync('scripts/startup-benchmark.mjs','utf8').replaceAll('benchmark-profile-', 'v2-benchmark-profile-').replaceAll('artifacts/startup-metrics.json','artifacts/v2-startup-metrics.json');
script=script.replace("  console.log(metrics.at(-1));", `  console.log(metrics.at(-1));
  if(iteration===2) {
    await page.waitForTimeout(1200);
    const idle=spawn('powershell.exe',['-NoProfile','-File','scripts/idle-metrics.ps1','-RootPid',String(child.pid),'-OutputFile','v2-idle-fresh.json'],{cwd:path.resolve('.'),stdio:'pipe',windowsHide:true});
    let idleOutput=''; idle.stdout.on('data',c=>idleOutput+=c); idle.stderr.on('data',c=>idleOutput+=c);
    await new Promise((resolve,reject)=>idle.on('exit',code=>code===0?resolve():reject(new Error(idleOutput))));
    console.log('Fresh one-session idle metrics saved.');
  }`);
fs.writeFileSync('scripts/benchmark-v2.mjs',script);
