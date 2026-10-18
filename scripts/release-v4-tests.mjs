import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
const root=process.cwd(),exe=path.resolve(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'src-tauri/target/release/relay-terminal.exe');
const portBase=30000+Math.floor(Math.random()*20000);
const cases=[['command-windows','command-native.mjs',false,false],['command-pwsh','command-native.mjs',true,false],['regression','desktop-regression.mjs',false,true],['acceptance','desktop-acceptance.mjs',true,true],['interactions','desktop-interactions.mjs',false,false],['appearance-studio','appearance-studio-native.mjs',false,false],['advanced','command-advanced.mjs',false,false],['captures','capture-v4.mjs',false,false]];
const summary=[];
for(const [index,[name,script,pwsh,seed]] of cases.entries()){
 if(process.argv.includes('--only') && process.argv[process.argv.indexOf('--only')+1]!==name)continue;
 const profile=path.resolve('artifacts/relay4/suites',name+'-'+Date.now());await fs.mkdir(profile,{recursive:true});
 await fs.writeFile(path.join(profile,'settings.json'),JSON.stringify({theme:'dark',fontSize:14,navigatorWidth:236,panelOpen:seed,composerVisible:seed,shell:pwsh?'pwsh':'windows',loadProfiles:false,restoreTabs:false}));
 const port=portBase+index;
 const env={...process.env,RELAY_DATA_DIR:profile,WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS:`--remote-debugging-port=${port} --remote-debugging-address=127.0.0.1`};
 if(pwsh)env.PATH=path.resolve('artifacts/relay4/pwsh')+';'+env.PATH;
 const child=spawn(exe,[],{env,cwd:root,windowsHide:true,stdio:'ignore'});
 try{
   let browser;
   for(let n=0;n<150;n++){
     try{
       const r=await fetch(`http://127.0.0.1:${port}/json/version`);
       if(r.ok){browser=await chromium.connectOverCDP(`http://127.0.0.1:${port}`);if(browser.contexts().flatMap(c=>c.pages()).some(p=>p.url().includes('tauri.localhost')))break;await browser.close();browser=undefined;}
     }catch{}
     await new Promise(r=>setTimeout(r,100));
   }
   if(!browser)throw new Error(`${name}: packaged window did not appear on CDP port ${port}`);
   await browser.close();
   const code=await new Promise(resolve=>{const t=spawn(process.execPath,[path.join('scripts',script),String(port)],{windowsHide:true,stdio:'inherit'});t.on('exit',resolve);});
   summary.push({name,code,profile});
   if(code!==0)throw new Error(`${name} failed: ${code}`);
 }finally{
   try{const b=await chromium.connectOverCDP(`http://127.0.0.1:${port}`);const p=b.contexts().flatMap(c=>c.pages()).find(p=>p.url().includes('tauri.localhost'));if(p){await p.keyboard.press('Escape');await p.getByRole('button',{name:'Close window',exact:true}).click();const confirm=p.getByRole('button',{name:'End sessions & close',exact:true});await confirm.click({timeout:1500}).catch(()=>{});}await b.close();}catch{}
   await new Promise(r=>setTimeout(r,500));if(child.exitCode===null)child.kill();
   await fs.writeFile('artifacts/relay4/suite-summary.json',JSON.stringify(summary,null,2));
 }
}
console.log('RELEASE SUITES',JSON.stringify(summary));
