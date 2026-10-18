import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
const out = here;
const H = '#1C2835', R = '#27313D', T = '#141E29', F = '#E0E8EF', M = '#A7B6C4', A = '#93B8DD', B = '#344352', S = '#435C75';
const appRoles = [['Background','#1C2835'],['Raised surface','#27313D'],['Text','#E0E8EF'],['Muted text','#A7B6C4'],['Accent','#93B8DD'],['Border','#344352']];
const termRoles = [['Background','#141E29'],['Foreground','#E0E8EF'],['Cursor','#93B8DD'],['Selection','#435C75']];
const ansi = [
  ['black','#273442'],['red','#D99596'],['green','#96BCA3'],['yellow','#D7BB87'],['blue','#95B4D8'],['magenta','#B8A4D3'],['cyan','#8DBBC3'],['white','#D4DCE5'],
  ['brightBlack','#8292A3'],['brightRed','#EFB2B1'],['brightGreen','#B5D4BC'],['brightYellow','#ECD1A2'],['brightBlue','#B8CFEE'],['brightMagenta','#D6BFE9'],['brightCyan','#AFD9DF'],['brightWhite','#F3F6FA']
];
const e = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const r = (x,y,w,h,fill,rx=0,stroke='none',sw=1,extra='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
const l = (x1,y1,x2,y2,color=B,sw=1) => `<path d="M${x1} ${y1}H${x2}" stroke="${color}" stroke-width="${sw}"/>`;
const v = (x,y1,y2,color=B,sw=1) => `<path d="M${x} ${y1}V${y2}" stroke="${color}" stroke-width="${sw}"/>`;
const c = (cx,cy,rad,fill,stroke='none',sw=1) => `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const tx = (x,y,s,size=11,color=F,weight=400,font='Segoe UI',extra='') => `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${color}" ${extra}>${e(s)}</text>`;
const mono = (x,y,s,size=11,color=F,weight=400,extra='') => tx(x,y,s,size,color,weight,'Cascadia Mono',extra);
const iconCache = new Map();
function icon(name,x,y,size=15,color=M,stroke=1.7){
  if(!iconCache.has(name)){
    const file=join(root,'node_modules/lucide-react/dist/esm/icons',`${name}.js`);
    const src=readFileSync(file,'utf8');
    const block=src.match(/const __iconNode = \[([\s\S]*?)\];/)?.[1];
    if(!block) throw new Error(`Lucide icon source not found: ${name}`);
    const nodes=[];
    for(const match of block.matchAll(/\[\s*"([^"]+)"\s*,\s*\{([\s\S]*?)\}\s*\]/g)){
      const tag=match[1], attrs={};
      for(const a of match[2].matchAll(/([A-Za-z][A-Za-z0-9]*):\s*(?:"([^"]*)"|(\d+(?:\.\d+)?)|(true|false))/g)) attrs[a[1]]=a[2]??a[3]??a[4];
      delete attrs.key;
      const mapped=Object.entries(attrs).map(([k,val])=>`${k.replace(/[A-Z]/g,m=>`-${m.toLowerCase()}`)}="${e(val)}"`).join(' ');
      nodes.push(`<${tag} ${mapped}/>`);
    }
    if(!nodes.length) throw new Error(`No vector data parsed for Lucide icon: ${name}`);
    iconCache.set(name,nodes.join(''));
  }
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${iconCache.get(name)}</svg>`;
}
const mark = (x=43,y=10,size=23,color=A,bg=H) => `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"><path d="M4 5h7.5c4 0 4 6.5 0 6.5H9.8c-4 0-4 6.5 0 6.5H20" stroke="${color}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11.5" cy="11.5" r="2.5" fill="${bg}"/><circle cx="11.5" cy="11.5" r="1.15" fill="${color}"/></svg>`;
const defs = `<defs>
<linearGradient id="terminalWash" x2="1" y2="1"><stop stop-color="#2B465C"/><stop offset="1" stop-color="#65747D"/></linearGradient>
<linearGradient id="tideSky" x2="0" y2="1"><stop stop-color="#4C707F"/><stop offset=".6" stop-color="#A0B9B2"/><stop offset="1" stop-color="#D5CEB0"/></linearGradient>
<linearGradient id="tideDeep" x2="1" y2="1"><stop stop-color="#476F78"/><stop offset="1" stop-color="#12343E"/></linearGradient>
<linearGradient id="hue" x1="0" x2="1"><stop stop-color="#FF0000"/><stop offset=".17" stop-color="#FFFF00"/><stop offset=".33" stop-color="#00FF00"/><stop offset=".5" stop-color="#00FFFF"/><stop offset=".67" stop-color="#0000FF"/><stop offset=".83" stop-color="#FF00FF"/><stop offset="1" stop-color="#FF0000"/></linearGradient>
<linearGradient id="hueVertical" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#FF0000"/><stop offset=".17" stop-color="#FFFF00"/><stop offset=".33" stop-color="#00FF00"/><stop offset=".5" stop-color="#00FFFF"/><stop offset=".67" stop-color="#0000FF"/><stop offset=".83" stop-color="#FF00FF"/><stop offset="1" stop-color="#FF0000"/></linearGradient>
<linearGradient id="svWhite"><stop stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="svBlack" x2="0" y2="1"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000"/></linearGradient>
<filter id="panelShadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="12"/></filter>
</defs>`;
function titlebar(selected='appearance'){
  const tools=[['terminal','terminal'],['folder','projects'],['list','processes'],['files','files'],['palette','appearance'],['settings','settings']];
  let s=r(0,0,1080,44,H)+l(0,43,1080,B);
  s+=icon('panel-left-open',13,14,16,M)+mark(42,10,23,A,H)+tx(72,27,'Relay',15,F,600);
  s+=r(392,8,168,28,T,5,B)+icon('search',402,15,14,M)+tx(425,26,'Find a command',11,M)+r(524,14,27,16,R,3)+tx(529,25,'Ctrl P',8,'#8293A4',500,'Segoe UI','letter-spacing=".2"');
  tools.forEach(([name,id],i)=>{const x=588+i*38; if(id===selected)s+=r(x-3,6,34,32,'#273442',5,'#41576B'); s+=icon(name,x+6,14,15,id===selected?A:M);});
  for(let i=0;i<3;i++){const x=942+i*46; s+=r(x,0,46,44,'transparent')+icon(['minus','square','x'][i],x+15,14,14,i===2?M:'#A7B6C4');}
  return s;
}
function navSidebar(){
  let s=r(0,44,248,648,H)+v(247,44,692,B);
  s+=r(12,55,224,30,T,5)+r(15,58,111,24,R,4)+icon('folder',23,63,14,A)+tx(43,75,'Workspaces',11,F,500)+icon('zap',147,63,14,M)+tx(168,75,'Actions',11,M,400);
  s+=r(13,96,222,30,R,5,B)+icon('search',23,104,14,M)+tx(45,116,'Find a folder or project',10,M);
  s+=tx(17,151,'Pinned workspaces',11,M,600)+icon('plus',214,139,14,M);
  s+=r(12,163,224,42,'#233344',5)+icon('folder',21,175,16,A)+tx(46,181,'Relay Terminal',12,F,500)+tx(46,196,'C:\\AI\\Projects\\Relay-Terminal',9,M);
  s+=tx(17,235,'Recent folders',11,M,600)+icon('clock-3',216,224,13,M);
  s+=icon('folder',22,250,14,M)+tx(44,262,'Relay-Terminal',11,F)+icon('folder',22,282,14,M)+tx(44,294,'Windows SDK',11,F);
  s+=r(15,608,218,31,R,5,B)+icon('folder-open',25,616,15,M)+tx(47,628,'Browse folders',10,F,500);
  s+=l(0,649,248,B)+icon('circle-question-mark',20,664,14,M)+tx(42,677,'Shortcuts',10,M);
  return s;
}
function terminalHeader(mainX,width,active='PowerShell 7'){
  let s=r(mainX,44,width,40,H)+l(mainX,83,mainX+width,B);
  s+=r(mainX+12,48,151,35,T,5)+r(mainX+12,80,151,2,A)+c(mainX+24,63,2,'#9AC8AC')+tx(mainX+34,67,active,11,F,500)+icon('x',mainX+142,59,11,M);
  s+=tx(mainX+174,66,'Build',11,M)+c(mainX+168,62,2,'#DDBB85')+icon('plus',mainX+236,58,16,M);
  s+=icon('columns-2',mainX+width-76,57,16,M)+icon('ellipsis',mainX+width-39,56,17,M);
  s+=r(mainX,84,width,32,T)+icon('folder',mainX+15,93,14,M)+tx(mainX+38,105,'C:',10,M)+tx(mainX+60,105,'›',10,'#738597')+tx(mainX+76,105,'AI',10,M)+tx(mainX+92,105,'›',10,'#738597')+tx(mainX+108,105,'Projects',10,M)+tx(mainX+163,105,'›',10,'#738597')+tx(mainX+179,105,'Relay-Terminal',10,F,500);
  s+=icon('star',mainX+width-125,92,15,M)+icon('external-link',mainX+width-89,92,14,M)+icon('search',mainX+width-48,92,14,M);
  return s;
}
function shellArea(mainX,width,{backdrop='solid',split=false,compact=false}={}){
  const y=116,h=576; let s=r(mainX,y,width,h,T);
  if(split)s+=r(mainX+width/2,y,width/2,h,'#25211F');
  if(backdrop==='ambient') s+=r(mainX,y,width,h,'url(#terminalWash)')+r(mainX,y,width,h,'#141E29B8');
  if(backdrop==='wallpaper'){
    s+=r(mainX,y,width,h,'url(#tideSky)')+`<circle cx="${mainX+width*.71}" cy="${y+118}" r="34" fill="#F7E2B5" opacity=".58"/>`+
      `<path d="M${mainX} ${y+275}Q${mainX+90} ${y+226} ${mainX+190} ${y+270}T${mainX+420} ${y+256}T${mainX+width} ${y+265}V${y+h}H${mainX}Z" fill="#63858A"/>`+
      `<path d="M${mainX} ${y+350}Q${mainX+160} ${y+302} ${mainX+300} ${y+366}T${mainX+width} ${y+344}V${y+h}H${mainX}Z" fill="url(#tideDeep)"/>`+r(mainX,y,width,h,'#141E2999');
  }
  if(split){
    s+=v(mainX+width/2,y+38,y+h-14,'#52697C',1)+tx(mainX+18,y+24,'PowerShell 7  ·  Harbor',10,F,500)+tx(mainX+width/2+18,y+24,'pwsh  ·  Carbon',10,'#D4C7B5',500);
  }
  const x=mainX+24+(split?0:0), top=y+(split?54:40);
  s+=mono(x,top,'PS C:\\AI\\Projects\\Relay-Terminal>',12,'#95B4D8',500)+mono(x+266,top,'Get-ChildItem src',12,F);
  s+=mono(x,top+25,'    Directory: C:\\AI\\Projects\\Relay-Terminal\\src',10.5,M)+mono(x,top+51,'Mode      LastWriteTime        Length Name',10,M);
  s+=l(x,top+59,mainX+width-22,'#314453');
  s+=mono(x,top+82,'d----     10/17/2026  9:12 AM         components',10,'#96BCA3')+
    mono(x,top+104,'-a---     10/17/2026  9:06 AM   14,802  AppearanceStudio.tsx',10,F)+
    mono(x,top+126,'-a---     10/17/2026  8:44 AM    9,031  appearance.ts',10,F)+
    mono(x,top+148,'-a---     10/16/2026  5:20 PM    2,911  terminals.ts',10,F);
  s+=mono(x,top+205,'PS C:\\AI\\Projects\\Relay-Terminal>',12,'#95B4D8',500)+mono(x+266,top+205,'git status --short',12,'#E0E8EF');
  s+=mono(x,top+230,' M src/AppearanceStudio.tsx',11,'#D7BB87')+mono(x,top+252,' M src/studio.css',11,'#D99596');
  s+=mono(x,top+309,'PS C:\\AI\\Projects\\Relay-Terminal>',12,'#95B4D8',500);
  s+=r(x+267,top+297,2,15,A,1);
  if(split){
    const xr=mainX+width/2+18;
    s+=mono(xr,top,'PS C:\\AI\\Projects\\Relay-Terminal>',10,'#D9B687',500)+mono(xr+229,top,'cargo check',10,'#EEE4D6')+mono(xr,top+28,'Finished dev profile in 0.42s',9.5,'#AFC1A5')+mono(xr,top+55,'PS C:\\AI\\Projects\\Relay-Terminal>',10,'#D9B687',500);
  }
  return s;
}
function statusbar(mainX,width){
  return r(0,692,1080,28,H)+l(0,692,1080,B)+icon('terminal',mainX+12,699,14,M)+tx(mainX+35,711,'PowerShell 7',10,M)+tx(mainX+125,711,'· Ready',10,'#9AC8AC')+tx(mainX+width-116,711,'100 × 32',10,M);
}
function appFrame({studio=true,selectedTool='palette',backdrop='solid',split=false}={}){
  const mainX=studio?0:248, width=1080-mainX;
  let s=r(0,0,1080,720,H)+titlebar(selectedTool);
  if(!studio)s+=navSidebar();
  s+=terminalHeader(mainX,width)+shellArea(mainX,width,{backdrop,split})+statusbar(mainX,width);
  return s;
}
function studioPanel(section='themes',scope='This workspace',source='Global  ›  Relay Terminal'){
  const x=714,w=366; let s=r(x,44,w,648,H)+v(x,44,692,B);
  s+=icon('palette',730,57,17,A)+tx(755,71,'Appearance Studio',15,F,600)+icon('x',1044,57,16,M);
  s+=tx(730,94,'APPLY TO',8,M,700,'Segoe UI','letter-spacing=".9"')+r(809,81,254,27,T,5,B)+tx(820,99,scope,10,F,500)+icon('chevron-down',1041,88,12,M);
  const scopeState=scope==='This session'?'Session override':scope==='This workspace'?'Workspace override':'Global base';
  s+=icon('git-branch',731,118,12,'#9AC8AC')+tx(750,128,source,9,M)+r(964,106,99,22,'#273442',4)+tx(scopeState==='Session override'?969:973,121,scopeState,8,'#B8CFEE',600);
  s+=tx(730,151,'Preview is live · not saved',9,'#DDBB85',500)+icon('rotate-ccw',1045,137,13,M);
  s+=l(x+14,159,x+w-14,B);
  const tabs=[['palette','Themes','themes'],['sliders-horizontal','Colour','colour'],['type','Type','type'],['image','Backdrop','backdrop']];
  tabs.forEach(([ic,label,id],i)=>{const bx=x+12+i*86, active=section===id; if(active)s+=r(bx,164,82,29,'#273442',4); s+=icon(ic,bx+7,172,13,active?A:M)+tx(bx+25,184,label,9.5,active?F:M,active?600:400); if(active)s+=r(bx+6,191,70,2,A,1);});
  return s;
}
function studioFooter(target='this workspace',reset='Reset preview',apply='Apply changes'){
  return l(714,649,1080,B)+
    r(730,660,120,25,'transparent',4,B)+icon('rotate-ccw',739,666,12,M)+tx(758,677,reset,9,F,500)+
    r(962,660,102,25,A,5)+icon('check',972,666,12,T)+tx(991,677,apply,9,T,650);
}
function roleTile(x,y,w,label,value,selected=false){
  let s=r(x,y,w,31,R,4,selected?A:'#344352',selected?1.3:1)+r(x+6,y+6,19,19,value,3,'#FFFFFF22')+tx(x+31,y+13,label,8.2,F,500)+tx(x+31,y+24,value,7.3,M,400,'Cascadia Mono');
  if(selected)s+=r(x+w-9,y+2,2,27,A,1);
  return s;
}
function ansiTile(x,y,label,value,w=40,selected=false){
  const name=label.replace('bright','B.');
  let s=r(x,y,w,38,'#202E3B',3,selected?A:'#394A5A',selected?1.25:1)+r(x+4,y+3,w-8,14,value,2,'#FFFFFF26')+tx(x+w/2,y+26,name,7.3,F,500,'Segoe UI','text-anchor="middle"')+tx(x+w/2,y+35,value,6.3,M,400,'Cascadia Mono','text-anchor="middle"');
  return s;
}
function themeThumb(x,y,w,h,name,base,fg,accent,kind='solid',selected=false){
  let sample=base;
  if(kind==='gradient') sample='url(#terminalWash)';
  if(kind==='wallpaper') sample='url(#tideSky)';
  let s=r(x,y,w,h,sample,4,selected?A:'#405261',selected?1.5:1);
  if(kind==='wallpaper')s+=`<path d="M${x} ${y+h*.66}Q${x+w*.24} ${y+h*.46} ${x+w*.48} ${y+h*.69}T${x+w} ${y+h*.58}V${y+h}H${x}Z" fill="#234D54"/>`;
  const sx=x+8, sy=y+16;
  s+=mono(sx,sy,`PS > ${name==='Porcelain'?'Get-Location':'git status'}`,7.5,fg)+mono(sx,sy+12,'working tree clean',7,'#96BCA3')+r(sx,sy+18,Math.min(w-18,44),3,accent,1)+tx(x+8,y+h-7,name,8.5,fg,600);
  if(selected)s+=c(x+w-9,y+9,3,A);
  return s;
}
function themeStudio(){
  let s=appFrame({studio:true})+studioPanel('themes','This workspace','Global  ›  Relay Terminal')+tx(730,213,'Relay themes',10,F,600)+tx(1007,213,'5 built-in',8,M,500);
  s+=r(730,222,334,75,'url(#terminalWash)',5,A,1.4)+r(738,229,126,61,T,4,'#718599')+mono(746,246,'PS > Get-Location',7.2,'#B8CFEE')+mono(746,260,'C:\\Relay-Terminal',7.2,'#E7EFF5')+mono(746,275,'cursor ▏',7.2,'#96BCA3');
  s+=tx(878,244,'Frost',14,'#E7EFF5',650)+tx(878,261,'Selected terminal scheme',8.5,'#D3E0E9',500)+tx(878,276,'Gradient background  ·  18 px blur',7.5,'#B3C4D2')+r(878,282,22,3,'#2B465C',1)+r(904,282,22,3,'#65747D',1)+tx(933,287,'two-stop gradient',7,M);
  s+=themeThumb(730,305,160,48,'Harbor','#141E29','#E0E8EF','#93B8DD','solid',false)+themeThumb(898,305,166,48,'Porcelain','#F7F9FC','#243441','#356D9B','solid',false);
  s+=themeThumb(730,359,160,48,'Carbon','#25211F','#EEE4D6','#D9B687','solid',false)+themeThumb(898,359,166,48,'Tideland','#152B33','#E4F0EE','#94C6C1','wallpaper',false);
  s+=tx(730,429,'Mix the two appearance layers',10,F,600)+tx(730,444,'Application chrome and each terminal stay independent.',8,M);
  s+=icon('panels-top-left',731,455,13,M)+tx(751,466,'Application chrome',8.5,M,500)+r(862,450,202,25,T,4,B)+tx(872,467,'Harbor',9,F,500)+icon('chevron-down',1044,457,12,M);
  s+=icon('terminal',731,484,13,M)+tx(751,495,'Terminal scheme',8.5,M,500)+r(862,479,202,25,T,4,B)+tx(872,496,'Frost',9,F,500)+icon('chevron-down',1044,486,12,M);
  s+=l(730,513,1064,B)+tx(730,531,'CUSTOM THEMES',8,M,700,'Segoe UI','letter-spacing=".8"')+tx(989,531,'08 / 40',8,M,500,'Cascadia Mono');
  s+=r(730,539,334,33,'#202E3B',4)+r(738,546,18,18,'#263A48',3,A)+tx(765,552,'After Rain',9,F,550)+tx(765,565,'Custom · saved',7.5,M)+icon('pencil',925,548,13,M)+icon('copy',953,548,13,M)+icon('download',981,548,13,M)+icon('trash-2',1035,548,13,M);
  s+=r(730,579,160,25,'transparent',4,B)+icon('plus',739,585,12,M)+tx(758,596,'Save current as…',8.5,F,500)+r(898,579,80,25,'transparent',4,B)+icon('upload',905,585,12,M)+tx(923,596,'Import',8.5,F,500)+r(985,579,79,25,'transparent',4,B)+icon('download',992,585,12,M)+tx(1010,596,'Export',8.5,F,500);
  s+=tx(730,622,'Save/edit applies to scope · Import previews until Apply.',7.5,M)+tx(730,637,'Edit/rename · duplicate · delete with undo · JSON validated.',7.5,M);
  s+=studioFooter('this workspace','Reset preview','Apply');
  return s;
}
function typeStudio(){
  let s=appFrame({studio:true})+studioPanel('type','This workspace','Global  ›  Relay Terminal');
  s+=tx(730,213,'TERMINAL TYPOGRAPHY',8,M,700,'Segoe UI','letter-spacing=".7"')+
    tx(730,234,'Font family',8.5,M,500)+r(730,242,334,34,T,5,B)+icon('type',742,252,14,A)+tx(766,264,'Cascadia Mono',10,F,550)+icon('chevron-down',1044,253,12,M)+
    tx(730,294,'Search installed fonts · NEW',7.5,'#DDBB85',600)+r(961,280,103,22,'#273442',4)+tx(972,295,'Compare · NEW',7.2,'#B8CFEE',600)+
    l(730,313,1064,B)+tx(730,332,'SIZE & SPACING',8,M,700,'Segoe UI','letter-spacing=".7"')+
    rangeRow(730,362,'Font size','14 px','10','32',.25,334)+
    rangeRow(730,399,'Line height','1.20','1','2',.20,334)+
    rangeRow(730,436,'Letter spacing','0 px','-1','4',.20,334)+
    rangeRow(730,473,'Terminal padding','18 px','4','48',.32,334)+
    l(730,491,1064,B)+tx(730,510,'CURSOR',8,M,700,'Segoe UI','letter-spacing=".7"')+
    tx(730,535,'Shape',8.5,F,500)+
    r(814,518,82,34,'#31465A',5,A,1)+r(828,527,2,17,A,1)+tx(844,540,'Bar',8.5,F,550)+
    r(902,518,78,34,T,5,B)+r(912,526,12,18,A,2)+tx(931,540,'Block',8.5,M)+
    r(986,518,78,34,T,5,B)+r(996,526,14,18,T,0,A,2)+tx(1016,540,'Underline',8.1,M)+
    tx(730,577,'Blinking cursor',9,F,500)+tx(730,594,'Keeps the insertion point visible in live terminals.',7.5,M)+
    r(1018,563,46,22,'#315F63',12,'#5A9694')+c(1052,574,8,'#E4F0EE')+
    r(730,610,334,28,'#202E3B',4,'#3C5367')+icon('info',741,617,13,A)+tx(763,629,'Changes preview immediately; shell sessions continue running.',7.3,M);
  s+=studioFooter('this workspace','Reset preview','Apply');
  return s;
}
function splitSessionDemo(){
  return appFrame({studio:false,selectedTool:'terminal',split:true});
}
function colorStudio(){
  let s=appFrame({studio:true})+studioPanel('colour','This workspace','Global  ›  Relay Terminal')+tx(730,211,'APPLICATION CHROME',8,M,700,'Segoe UI','letter-spacing=".7"');
  s+=tx(24,513,'ANSI OUTPUT · live specimen',8,'#A7B6C4',650,'Segoe UI','letter-spacing=".7"')+l(24,520,690,'#344352')+
    mono(24,543,'PS> Get-Content build.log | Select-Object -Last 5',10,'#95B4D8',500)+
    mono(24,566,'[INFO]   09:41:12  worker started  ·  4 suites',10,'#8DBBC3')+
    mono(24,589,'[WARN]   retrying request in 500 ms',10,'#D7BB87')+
    mono(24,612,'[ERROR]  E_ACCESSDENIED  ·  src/session.ts:48',10,'#D99596')+
    mono(24,635,'[PASS]   31 tests passed  ·  0 failed',10,'#96BCA3')+
    mono(24,658,'diff:  - legacy token   + resolved terminal palette',10,'#B8A4D3');
  const aw=162, gap=10; appRoles.forEach((a,i)=>{const row=Math.floor(i/2),col=i%2; s+=roleTile(730+col*(aw+gap),219+row*35,aw,a[0],a[1],false);});
  s+=tx(730,335,'TERMINAL FOUNDATION',8,M,700,'Segoe UI','letter-spacing=".7"');
  termRoles.forEach((a,i)=>{const row=Math.floor(i/2),col=i%2; s+=roleTile(730+col*(aw+gap),343+row*35,aw,a[0],a[1],false);});
  s+=l(730,419,1064,B)+tx(730,437,'ANSI PALETTE',9,F,600)+tx(1005,437,'16 values',8,M,500);
  const cell=40.5, cg=1.35;
  s+=tx(730,451,'NORMAL',7.2,M,700,'Segoe UI','letter-spacing=".5"');
  ansi.slice(0,8).forEach(([name,value],i)=>{s+=ansiTile(730+i*(cell+cg),457,name,value,cell,false);});
  s+=tx(730,506,'BRIGHT',7.2,M,700,'Segoe UI','letter-spacing=".5"');
  ansi.slice(8).forEach(([name,value],i)=>{s+=ansiTile(730+i*(cell+cg),512,name,value,cell,false);});
  s+=r(730,561,334,35,'#202E3B',4,A,1.2)+r(738,569,18,18,'#95B4D8',3)+tx(764,574,'Selected · ANSI blue',8.5,F,550)+tx(764,588,'#95B4D8   RGB 149 180 216',7.5,M,400,'Cascadia Mono')+icon('pipette',1037,570,14,A);
  s+=tx(730,613,'Each role opens the same exact-value colour editor.',7.5,M)+tx(730,628,'Readability hint advises; it never alters your palette.',7.5,M);
  s+=studioFooter('this workspace','Reset preview','Apply');
  // Accurate square spectrum and direct values, attached to the selected ANSI role.
  s+=`<g filter="url(#panelShadow)">${r(388,151,318,492,'#00000066',9)}</g>`;
  s+=r(378,145,322,493,'#27313D',8,'#50647A',1.1)+l(378,190,700,'#3A4B5C');
  s+=icon('palette',395,159,16,A)+tx(420,172,'Terminal colour',12,F,600)+icon('x',677,158,14,M);
  s+=tx(395,187,'ANSI blue  ·  focused output colour',8.5,M);
  s+=r(394,198,256,256,'#6E9ED2',3,'#61758A')+r(394,198,256,256,'url(#svWhite)',3)+r(394,198,256,256,'url(#svBlack)',3)+c(562,300,7,'none','#FFFFFF',2)+c(562,300,2,'#FFFFFF');
  s+=r(660,198,16,256,'url(#hueVertical)',4,B)+r(657,264,22,3,'#FFFFFF',1);
  s+=tx(394,472,'CURRENT',7.5,M,700,'Segoe UI','letter-spacing=".6"')+tx(498,472,'PROPOSED',7.5,M,700,'Segoe UI','letter-spacing=".6"');
  s+=r(394,480,84,29,'#95B4D8',4,'#596D82')+tx(487,499,'#95B4D8',9,F,500,'Cascadia Mono')+r(589,480,61,29,'#6E9ED2',4,'#B7CDE2');
  s+=tx(394,527,'HEX',7.5,M,650)+r(394,533,122,28,T,4,'#50647A')+tx(405,552,'#6E9ED2',10,F,500,'Cascadia Mono');
  s+=tx(528,527,'RGB',7.5,M,650)+r(528,533,122,28,T,4,'#50647A')+tx(537,552,'110   158   210',8.3,F,500,'Cascadia Mono');
  s+=tx(394,578,'Picked value appears in the live ANSI sample.',8,M);
  s+=r(394,595,111,28,'transparent',4,'#50647A')+tx(413,613,'Cancel',9,F,500)+r(516,595,134,28,A,5)+icon('check',528,603,13,T)+tx(548,614,'Use this colour',9,T,650);
  return s;
}
function rangeRow(x,y,label,val,min,max,ratio,w=334){
  return tx(x,y,label,8.5,F,500)+r(x+104,y-9,w-177,4,'#405365',2)+r(x+104,y-9,(w-177)*ratio,4,A,2)+c(x+104+(w-177)*ratio,y-7,5,A,'#D8E7F3',1)+r(x+w-63,y-19,63,21,T,4,B)+tx(x+w-54,y-5,val,8.5,F,500,'Cascadia Mono')+tx(x+w-68,y-5,`${min}–${max}`,6.4,M,400,'Cascadia Mono','text-anchor="end"');
}
function backgroundStudio(mode='ambient',wallpaper=false){
  let s=appFrame({studio:true,backdrop:wallpaper?'wallpaper':'ambient'})+studioPanel('backdrop','This workspace','Global  ›  Relay Terminal');
  s+=tx(730,213,'BACKGROUND STYLE',8,M,700,'Segoe UI','letter-spacing=".7"');
  const modes=[['square','Solid'],['blend','Gradient'],['image','Wallpaper'],['wind','Ambient']];
  modes.forEach(([ic,label],i)=>{const bx=730+i*84,active=(wallpaper?label==='Wallpaper':label==='Ambient');s+=r(bx,222,80,34,active?'#31465A':T,5,active?A:B,active?1.2:1)+icon(ic,bx+7,232,13,active?A:M)+tx(bx+25,245,label,8.2,active?F:M,active?600:400);});
  if(!wallpaper){
    s+=tx(730,279,'Ambient gradient',11,F,600)+r(1013,263,51,20,'#263A48',4)+tx(1021,276,'LIVE',7.5,'#9AC8AC',700);
    s+=r(730,289,334,44,'url(#terminalWash)',5,'#526B80')+r(738,297,24,24,'#2B465C',4,'#A3BBCD')+tx(768,304,'Start colour',7.5,M)+tx(768,322,'#2B465C',8.5,F,500,'Cascadia Mono')+r(883,297,24,24,'#65747D',4,'#A3BBCD')+tx(913,304,'End colour',7.5,M)+tx(913,322,'#65747D',8.5,F,500,'Cascadia Mono')+icon('arrow-right',1032,303,15,F);
    s+=tx(730,354,'Gradient angle',8.5,F,500)+r(949,338,115,25,T,4,B)+icon('rotate-cw',957,344,13,M)+tx(978,355,'135°',9,F,500,'Cascadia Mono')+icon('chevron-down',1045,345,11,M);
    s+=l(730,374,1064,B)+tx(730,392,'BACKDROP EFFECTS',8,M,700,'Segoe UI','letter-spacing=".7"');
    s+=rangeRow(730,415,'Surface opacity','0.78','0.35','1.00',.66,334)+rangeRow(730,447,'Backdrop intensity','0.62','0','1',.62,334)+rangeRow(730,479,'Blur','18 px','0','40',.45,334);
    s+=l(730,500,1064,B)+tx(730,520,'Ambient motion',9,F,550)+r(1018,506,46,22,'#315F63',12,'#5A9694')+c(1052,517,8,'#E4F0EE')+tx(730,543,'Animation duration · 10–120 sec',8.2,M)+r(934,528,130,25,T,4,B)+tx(945,545,'30 seconds',9,F,500,'Cascadia Mono')+icon('chevron-down',1045,535,11,M);
    s+=r(730,566,334,44,'#202E3B',4,'#3C5367')+icon('clock-3',741,576,13,A)+tx(761,580,'Motion behavior',8.3,F,550)+tx(741,598,'Pauses while hidden/minimised · respects reduced motion',7.3,M);
    s+=tx(730,631,'Solid, gradient, wallpaper and ambient share this effect stack.',7.1,M);
  } else {
    s+=tx(730,279,'Wallpaper source',11,F,600)+tx(730,296,'Local image or Relay’s bundled Tideland artwork.',8,M);
    s+=r(730,307,334,98,'url(#tideSky)',6,'#526B80')+`<circle cx="${991}" cy="340" r="23" fill="#F7E2B5" opacity=".62"/><path d="M730 378 Q805 346 873 381T1064 370 V405 H730Z" fill="#234D54"/><path d="M730 392 Q819 372 892 400T1064 397 V405 H730Z" fill="#173C43"/>`;
    s+=r(741,317,112,20,'#18232EBD',4)+icon('image',748,321,11,F)+tx(765,331,'Tideland · bundled',7.5,F,550);
    s+=r(730,414,160,30,'#31465A',5,A)+icon('upload',740,422,13,A)+tx(760,433,'Choose local image',8.1,F,550)+r(898,414,166,30,T,5,B)+icon('image',907,422,13,M)+tx(927,433,'Use Tideland',8.1,F,500);
    s+=tx(730,458,'WALLPAPER SAFETY',7.8,M,700,'Segoe UI','letter-spacing=".7"')+tx(730,475,'PNG · JPEG · WebP     up to 4 MB',8.2,F,500)+tx(730,489,'8192 px max edge · 16 megapixels',7.8,M)+tx(730,503,'Local only · remote URLs and SVG data are refused.',7.3,M);
    s+=l(730,514,1064,B)+tx(730,532,'BACKDROP EFFECTS',8,M,700,'Segoe UI','letter-spacing=".7"')+rangeRow(730,555,'Surface opacity','0.82','0.35','1.00',.72,334)+rangeRow(730,582,'Backdrop intensity','0.58','0','1',.58,334)+rangeRow(730,609,'Blur','18 px','0','40',.45,334);
  }
  s+=studioFooter('this workspace','Reset preview','Apply');
  if(!wallpaper){
    // Screen-space gradient vector: two existing stops and one precise angle, no invented extra stops.
    s+=l(714,405,714,405,'none',0);
    s+=r(64,153,630,420,'#00000033',6,'#D7E1EB44')+tx(82,178,'AMBIENT PREVIEW',8,'#C6D6E2',650,'Segoe UI','letter-spacing=".8"');
    s+=l(144,231,525,521,'#DCE7EF',2)+c(144,231,8,'#2B465C','#E7EFF5',2)+c(525,521,8,'#65747D','#E7EFF5',2);
    s+=r(93,218,104,21,'#18232EBB',4)+tx(103,232,'Start · #2B465C',7.5,F,500,'Cascadia Mono')+r(469,525,98,21,'#18232EBB',4)+tx(479,539,'End · #65747D',7.5,F,500,'Cascadia Mono');
    s+=r(85,566,221,26,'#27313DE8',5,'#526B80')+icon('sliders-horizontal',95,572,13,A)+tx(116,584,'Angle 135°  ·  drag direction line',8.2,F,500);
    s+=r(434,552,220,38,'#27313D',5,'#53687A')+tx(446,568,'Compare saved  ·  NEW preview',7.4,'#DDBB85',600)+tx(446,582,'Tap to show the stored appearance beside this draft.',7.1,M);
  }
  return s;
}
function quickAppearance(stage=1){
  const mainX=248,width=832;
  let s=r(0,0,1080,720,H)+titlebar('terminal')+navSidebar()+terminalHeader(mainX,width)+shellArea(mainX,width,{backdrop:'solid'})+statusbar(mainX,width);
  if(stage===1){
    // One compact context menu only. The new entry sits with tab-level commands.
    s+=`<g filter="url(#panelShadow)">${r(280,78,260,206,'#00000055',7)}</g>`+r(274,74,260,204,'#27313D',7,'#465A6D')+tx(291,96,'POWERSHELL 7',8,M,700,'Segoe UI','letter-spacing=".7"')+l(286,105,522,B);
    s+=icon('terminal',290,114,14,M)+tx(313,126,'Focus this session',10,F)+icon('copy',290,141,14,M)+tx(313,153,'Copy tab path',10,F)+l(286,163,522,B);
    s+=r(282,168,244,30,'#31465A',4)+icon('palette',291,176,14,A)+tx(314,188,'Quick appearance…',10,F,600)+icon('chevron-right',500,177,13,M);
    s+=icon('pencil',290,207,14,M)+tx(313,219,'Rename tab',10,F)+icon('x',290,236,14,M)+tx(313,248,'Close tab',10,F)+tx(291,267,'Appearance targets this session.',7.5,M);
  }
  if(stage===2){
    s+=`<g filter="url(#panelShadow)">${r(283,83,373,418,'#00000055',8)}</g>`+r(276,78,373,418,'#27313D',8,'#50647A')+icon('palette',294,95,16,A)+tx(319,109,'Quick appearance',13,F,600)+icon('x',632,95,14,M)+l(292,120,633,B);
    s+=r(292,132,341,38,'#202E3B',5)+icon('terminal',304,143,14,'#9AC8AC')+tx(326,148,'PowerShell 7',9,F,550)+tx(326,161,'This session  ·  inherits from Relay Terminal',7.5,M)+icon('chevron-down',611,144,12,M);
    s+=tx(292,190,'Application chrome',8,M,500)+r(292,197,162,28,T,4,B)+icon('panels-top-left',301,204,13,M)+tx(322,216,'Harbor',9,F,500)+icon('chevron-down',438,205,11,M);
    s+=tx(470,190,'Terminal scheme',8,M,500)+r(470,197,163,28,T,4,B)+icon('terminal',479,204,13,M)+tx(500,216,'Frost',9,F,500)+icon('chevron-down',617,205,11,M);
    s+=tx(292,247,'Background',8,M,500);
    [['square','Solid'],['blend','Gradient'],['image','Wallpaper'],['wind','Ambient']].forEach(([ic,label],i)=>{const bx=292+i*86,active=label==='Gradient';s+=r(bx,254,81,32,active?'#31465A':T,5,active?A:B,active?1.2:1)+icon(ic,bx+7,263,13,active?A:M)+tx(bx+25,276,label,8,active?F:M,active?600:400);});
    s+=rangeRow(292,310,'Surface opacity','0.82','0.35','1.00',.72,341);
    s+=r(292,328,341,38,'#202E3B',5,'#3E5364')+icon('git-branch',302,339,14,'#9AC8AC')+tx(323,344,'Inheritance',8,F,550)+tx(323,357,'First change creates a session override.',7.5,M)+icon('info',610,340,13,M);
    s+=r(292,376,341,30,'#202E3B',5,'#3E5364')+icon('tag',302,384,13,'#DDBB85')+tx(322,396,'Tab identity · new proposal',8.3,F,550)+r(489,383,22,16,'#587C9F',4)+icon('terminal',493,385,12,'#E0E8EF')+tx(518,395,'Icon + cue',7.7,M);
    s+=r(292,416,341,34,A,5)+icon('external-link',306,425,14,T)+tx(329,436,'Open complete Appearance Studio',9,T,650)+icon('arrow-up-right',611,425,13,T);
    s+=l(292,457,633,B);
    s+=r(292,462,106,26,'transparent',4,B)+icon('rotate-ccw',300,468,12,M)+tx(319,479,'Reset preview',8,F,500)+r(510,462,123,26,A,5)+icon('check',519,469,12,T)+tx(539,479,'Apply to session',8,T,650);
  }
  if(stage===3){
    s=appFrame({studio:true})+studioPanel('backdrop','This session','Global  ›  Relay Terminal  ›  PowerShell 7')+
      tx(730,213,'BACKGROUND STYLE',8,M,700,'Segoe UI','letter-spacing=".7"')+r(730,222,80,34,T,5,B)+icon('square',737,232,13,M)+tx(755,245,'Solid',8,M)+r(814,222,80,34,T,5,B)+icon('blend',821,232,13,M)+tx(839,245,'Gradient',8,M)+r(898,222,80,34,T,5,B)+icon('image',905,232,13,M)+tx(923,245,'Wallpaper',8,M)+r(982,222,82,34,'#31465A',5,A)+icon('wind',989,232,13,A)+tx(1007,245,'Ambient',8,F,600)+tx(730,278,'Ambient gradient',11,F,600)+r(730,292,334,58,'url(#terminalWash)',5,'#536B7D')+
      tx(730,370,'Start',8,M)+r(730,377,160,29,T,4,B)+r(737,383,18,18,'#2B465C',3)+tx(763,396,'#2B465C',8.4,F,500,'Cascadia Mono')+tx(898,370,'End',8,M)+r(898,377,166,29,T,4,B)+r(905,383,18,18,'#65747D',3)+tx(931,396,'#65747D',8.4,F,500,'Cascadia Mono')+
      tx(730,428,'Gradient angle',8.5,F)+r(949,411,115,25,T,4,B)+tx(962,428,'135°',9,F,500,'Cascadia Mono')+rangeRow(730,464,'Surface opacity','0.78','0.35','1.00',.66,334)+rangeRow(730,495,'Backdrop intensity','0.62','0','1',.62,334)+rangeRow(730,526,'Blur','18 px','0','40',.45,334)+tx(730,556,'Animate ambient background',8.6,F,500)+r(1018,540,46,22,'#315F63',12,'#5A9694')+c(1052,551,8,'#E4F0EE')+tx(730,581,'Duration · 10–120 sec',8.2,M)+r(934,566,130,25,T,4,B)+tx(945,583,'30 seconds',9,F,500,'Cascadia Mono')+tx(730,613,'Reduced motion disables animation; hidden/minimised pauses it.',7.3,M)+studioFooter('this session','Reset preview','Apply');
  }
  return s;
}

// Focused refinement pages: real controls live in the docked Studio panel so
// editing never places handles over terminal output.
function refinedGradient(){
  let s=appFrame({studio:true,backdrop:'ambient'})+studioPanel('backdrop','This session','Global  ›  Relay Terminal  ›  PowerShell 7');
  s+=tx(730,213,'BACKGROUND STYLE',8,M,700,'Segoe UI','letter-spacing=".7"');
  [['square','Solid'],['blend','Gradient'],['image','Wallpaper'],['wind','Ambient']].forEach(([ic,label],i)=>{const bx=730+i*84,active=label==='Ambient';s+=r(bx,222,80,33,active?'#31465A':T,5,active?A:B,active?1.2:1)+icon(ic,bx+7,232,13,active?A:M)+tx(bx+25,244,label,8,active?F:M,active?600:400);});
  s+=tx(730,279,'Ambient gradient',11,F,600)+r(1011,263,53,20,'#263A48',4)+c(1021,273,3,'#9AC8AC')+tx(1029,276,'Live',7.4,'#9AC8AC',650);
  s+=r(730,288,334,67,'url(#terminalWash)',5,'#566E82')+tx(743,305,'PREVIEW · 334 × 67',7,M,650,'Segoe UI','letter-spacing=".5"')+l(765,335,1008,309,'#E6EEF5',1.5)+c(765,335,5,'#2B465C','#E6EEF5',1.5)+c(1008,309,5,'#65747D','#E6EEF5',1.5)+tx(743,348,'Two existing stops · direction only',7.4,'#D6E1EA');
  s+=tx(730,378,'START COLOUR',7.4,M,650,'Segoe UI','letter-spacing=".5"')+tx(900,378,'END COLOUR',7.4,M,650,'Segoe UI','letter-spacing=".5"');
  s+=r(730,385,160,32,T,4,B)+r(738,392,19,18,'#2B465C',3,'#647A8C')+tx(765,404,'#2B465C',9,F,500,'Cascadia Mono')+icon('chevron-down',873,394,11,M);
  s+=r(900,385,164,32,T,4,B)+r(908,392,19,18,'#65747D',3,'#8395A4')+tx(935,404,'#65747D',9,F,500,'Cascadia Mono')+icon('chevron-down',1047,394,11,M);
  s+=tx(730,439,'ANGLE',7.4,M,650,'Segoe UI','letter-spacing=".5"')+r(730,446,73,55,T,5,B)+c(766,470,16,'#202E3B',A,1)+l(755,478,775,462,A,2)+c(755,478,3,A)+r(812,446,110,55,'#202E3B',5,B)+tx(823,463,'Degrees',7.2,M)+tx(823,486,'135°',12,F,550,'Cascadia Mono')+r(930,446,134,55,'#202E3B',5,B)+tx(941,463,'Normalized direction',7.1,M)+tx(941,486,'0°  —  360°',9,F,500,'Cascadia Mono');
  s+=l(730,512,1064,B)+tx(730,530,'BACKDROP EFFECTS',8,M,700,'Segoe UI','letter-spacing=".7"')+rangeRow(730,553,'Surface opacity','0.78','0.35','1.00',.66,334)+rangeRow(730,581,'Backdrop intensity','0.62','0','1',.62,334)+rangeRow(730,609,'Blur','18 px','0','40',.45,334);
  s+=r(730,618,164,24,'#202E3B',4,'#3C5367')+tx(741,634,'Ambient animation',7.8,F,500)+r(856,622,28,16,'#315F63',9,'#5A9694')+c(875,630,5,'#E4F0EE')+r(902,618,162,24,T,4,B)+tx(912,634,'30 s',8.3,F,500,'Cascadia Mono')+tx(1015,634,'10–120 s',6.7,M,400,'Cascadia Mono');
  s+=studioFooter('this session','Reset preview','Apply');
  return s;
}
function refinedWallpaper(){
  let s=appFrame({studio:true,backdrop:'wallpaper'})+studioPanel('backdrop','This session','Global  ›  Relay Terminal  ›  PowerShell 7');
  s+=tx(730,213,'BACKGROUND STYLE',8,M,700,'Segoe UI','letter-spacing=".7"');
  [['square','Solid'],['blend','Gradient'],['image','Wallpaper'],['wind','Ambient']].forEach(([ic,label],i)=>{const bx=730+i*84,active=label==='Wallpaper';s+=r(bx,222,80,33,active?'#31465A':T,5,active?A:B,active?1.2:1)+icon(ic,bx+7,232,13,active?A:M)+tx(bx+25,244,label,8,active?F:M,active?600:400);});
  s+=tx(730,276,'Tideland wallpaper',10.5,F,600)+tx(730,291,'Bundled · Center / Cover',7.5,M)+r(730,298,334,62,'url(#tideSky)',5,'#536C80')+`<circle cx="995" cy="318" r="13" fill="#F7E2B5" opacity=".72"/><path d="M730 344Q802 328 873 346T1000 341T1064 340V360H730Z" fill="#63858A"/><path d="M730 352Q820 340 903 354T1064 351V360H730Z" fill="url(#tideDeep)"/>`+r(738,303,101,18,'#18232ECC',4)+icon('image',746,306,10,F)+tx(763,316,'Tideland · built-in',6.9,F,550);
  s+=r(730,367,160,26,A,5)+icon('upload',740,374,11,T)+tx(760,384,'Choose local image',7.2,T,600)+r(898,367,166,26,T,5,B)+icon('image',908,374,11,M)+tx(927,384,'Use Tideland',7.6,F,500);
  s+=tx(730,407,'PNG · JPEG · WebP  ·  under 4 MB',7.4,F,500)+tx(730,420,'≤ 8192 px per edge  ·  ≤ 16 megapixels',7.2,M)+tx(730,433,'Local only · no remote URLs or SVG data.',7,M);
  s+=r(730,440,334,33,'#202E3B',5,'#9B805B')+icon('sparkles',740,449,12,'#DDBB85')+tx(759,453,'NEW PROPOSAL · POSITION',7.3,'#E6C89A',700,'Segoe UI','letter-spacing=".5"')+tx(759,466,'Current behavior remains Center / Cover.',7.1,F,500);
  // Proposed positioning stays inside Studio. The live shell keeps no crop handles.
  s+=r(730,478,180,42,T,4,B)+r(736,483,168,32,'url(#tideSky)',3)+`<path d="M736 509Q773 497 801 508T904 505V515H736Z" fill="#234D54"/>`+c(820,499,4,'#E0E8EF','#1C2835',1.2)+l(808,499,832,499,'#E0E8EF',1)+v(820,488,510,'#E0E8EF',1)+tx(918,490,'X',6.8,M)+r(936,480,52,18,T,4,B)+tx(946,493,'50%',7.2,F,500,'Cascadia Mono')+tx(918,512,'Y',6.8,M)+r(936,502,52,18,T,4,B)+tx(946,515,'50%',7.2,F,500,'Cascadia Mono')+icon('rotate-ccw',1037,492,13,M);
  s+=l(730,526,1064,B)+tx(730,541,'BACKDROP EFFECTS',7.5,M,700,'Segoe UI','letter-spacing=".6"')+rangeRow(730,561,'Surface opacity','0.82','0.35','1.00',.72,334)+rangeRow(730,589,'Backdrop intensity','0.58','0','1',.58,334)+rangeRow(730,617,'Blur','18 px','0','40',.45,334);
  s+=tx(730,642,'Text, cursor and selection remain opaque.',7.2,M)+studioFooter('this session','Reset preview','Apply');
  return s;
}
function refinedRoleAtlas(){
  let s=appFrame({studio:true})+studioPanel('colour','This workspace','Global  ›  Relay Terminal')+tx(730,211,'APPLICATION COLOURS',7.6,M,700,'Segoe UI','letter-spacing=".6"');
  appRoles.forEach(([name,value],i)=>{let x=730+(i%2)*169,y=220+Math.floor(i/2)*31;s+=roleTile(x,y,162,name,value,false);});
  s+=tx(730,327,'TERMINAL FOUNDATION',7.6,M,700,'Segoe UI','letter-spacing=".6"');
  termRoles.forEach(([name,value],i)=>{let x=730+(i%2)*169,y=336+Math.floor(i/2)*31;s+=roleTile(x,y,162,name,value,false);});
  s+=l(730,404,1064,B)+tx(730,420,'ANSI COLOURS',8.6,F,650)+tx(986,420,'16 independent values',7.2,M,500,'Cascadia Mono')+tx(730,431,'NORMAL  ·  0–7',6.8,M,650,'Segoe UI','letter-spacing=".45"');
  const bw=79, bg=5, bh=36;
  ansi.slice(0,8).forEach(([name,value],i)=>{const col=i%4,row=Math.floor(i/4),x=730+col*(bw+bg),y=437+row*(bh+3);s+=r(x,y,bw,bh,'#202E3B',4,'#394A5A')+r(x+5,y+4,17,17,value,3,'#FFFFFF30')+tx(x+27,y+12,name,7.3,F,550)+tx(x+27,y+29,value,6.8,M,400,'Cascadia Mono');});
  s+=tx(730,522,'BRIGHT  ·  8–15',6.8,M,650,'Segoe UI','letter-spacing=".45"');
  ansi.slice(8).forEach(([name,value],i)=>{const col=i%4,row=Math.floor(i/4),x=730+col*(bw+bg),y=528+row*(bh+3);s+=r(x,y,bw,bh,'#202E3B',4,'#394A5A')+r(x+5,y+4,17,17,value,3,'#FFFFFF30')+tx(x+27,y+12,name.replace('bright',''),7.1,F,550)+tx(x+27,y+29,value,6.8,M,400,'Cascadia Mono');});
  s+=r(730,612,334,23,'#202E3B',4,'#3C5367')+icon('mouse-pointer-2',740,617,11,A)+tx(761,628,'Select any role to open its precision editor.',7.5,F,500)+tx(730,646,'Role names and normal/bright grouping remain visible without relying on hue.',6.7,M);
  s+=studioFooter('this workspace','Reset preview','Apply');
  s+=r(24,500,665,170,'#101A24CC',5,'#344352')+tx(43,522,'ANSI SPECIMEN · real output roles',8,M,700,'Segoe UI','letter-spacing=".7"')+
    mono(43,550,'PS> Get-Content build.log | Select-Object -Last 5',11,'#95B4D8',500)+
    mono(43,575,'[INFO]   09:41:12  worker started  ·  4 suites',11,'#8DBBC3')+
    mono(43,600,'[WARN]   retrying request in 500 ms',11,'#D7BB87')+
    mono(43,625,'[ERROR]  E_ACCESSDENIED  ·  src/session.ts:48',11,'#D99596')+
    mono(43,650,'[PASS]   31 tests passed  ·  0 failed',11,'#96BCA3');
  return s;
}
function refinedAnsiPicker(){
  let s=appFrame({studio:true})+studioPanel('colour','This session','Global  ›  Relay Terminal  ›  PowerShell 7');
  s+=tx(730,212,'ANSI PALETTE',7.6,M,700,'Segoe UI','letter-spacing=".6"')+tx(982,212,'16 editable roles',7.5,M,500,'Cascadia Mono');
  const cellW=79,g=5,h=38;
  ansi.forEach(([name,value],i)=>{const x=730+(i%4)*(cellW+g),y=222+Math.floor(i/4)*(h+4),sel=name==='blue';s+=r(x,y,cellW,h,sel?'#31465A':'#202E3B',4,sel?A:'#394A5A',sel?1.2:1)+r(x+5,y+5,17,17,value,3,'#FFFFFF35')+tx(x+27,y+13,name.replace('bright','Bright '),7.3,F,550)+tx(x+27,y+29,value,6.7,M,400,'Cascadia Mono');});
  s+=l(730,395,1064,B)+r(730,404,334,220,'#202E3B',5,'#445A6D')+r(730,404,334,30,'#263643',5)+icon('palette',742,412,13,A)+tx(764,424,'ANSI blue',9.3,F,600)+tx(943,424,'Edited value previews live',7.2,'#DDBB85',500);
  // Square spectrum approximates a precision selector; direct fields stay visible.
  s+=r(742,445,170,124,'#6E9ED2',3,'#607487')+r(742,445,170,124,'url(#svWhite)',3)+r(742,445,170,124,'url(#svBlack)',3)+c(839,499,6,'none','#FFFFFF',1.8)+c(839,499,2,'#FFFFFF')+r(919,445,13,124,'url(#hueVertical)',4,B)+r(916,480,19,3,'#FFF',1);
  s+=tx(945,458,'CURRENT',6.8,M,700)+r(945,464,48,21,'#95B4D8',3,'#6B8092')+tx(1000,458,'NEW VALUE',6.8,M,700)+r(1000,464,48,21,'#6E9ED2',3,'#B7CDE2');
  s+=tx(945,502,'HEX',6.8,M,650)+r(945,507,103,21,T,4,B)+tx(953,522,'#6E9ED2',8,F,500,'Cascadia Mono')+tx(945,542,'RGB',6.8,M,650)+r(945,547,103,21,T,4,B)+tx(953,562,'110 158 210',7.6,F,500,'Cascadia Mono')+tx(945,582,'HSV',6.8,M,650)+r(945,587,103,21,T,4,B)+tx(953,602,'211 48 82',7.6,F,500,'Cascadia Mono');
  s+=r(742,577,190,34,'#263643',4)+icon('info',751,585,12,'#B8CFEE')+tx(770,589,'Readability estimate · 7.85:1',7.4,F,600)+tx(770,602,'AA text reference 4.5:1',6.9,M);
  s+=tx(730,635,'ADVISORY · NEW PROPOSAL',7.2,'#E6C89A',700)+tx(730,647,'No colour is blocked or changed automatically.',7.1,M);
  s+=studioFooter('this session','Reset preview','Apply');
  s+=r(22,500,665,168,'#101A24D9',5,'#344352')+tx(42,522,'LIVE SPECIMEN · colour remains visible while editing',8,M,700,'Segoe UI','letter-spacing=".5"')+
    mono(42,551,'PS> Get-Content build.log | Select-Object -Last 5',11,'#95B4D8',500)+
    mono(42,577,'[INFO]   09:41:12  worker started  ·  4 suites',11,'#8DBBC3')+
    mono(42,603,'[WARN]   retrying request in 500 ms',11,'#D7BB87')+
    mono(42,629,'[ERROR]  E_ACCESSDENIED  ·  src/session.ts:48',11,'#D99596')+
    mono(42,655,'[PASS]   31 tests passed  ·  0 failed',11,'#96BCA3');
  return s;
}
function scopeWorkflow(){
  let s=appFrame({studio:true})+studioPanel('themes','This session','Global  ›  Relay Terminal  ›  PowerShell 7');
  s+=tx(730,211,'APPEARANCE TARGET',8,M,700,'Segoe UI','letter-spacing=".7"')+r(730,222,334,36,T,5,A,1)+icon('layers-2',741,233,14,A)+tx(765,245,'This session · PowerShell 7',9.5,F,550)+icon('chevron-up',1044,233,12,M);
  s+=r(730,261,334,123,'#202E3B',5,'#4A6073')+tx(744,281,'Apply to',8,M,550)+l(744,289,1050,B)+r(741,296,312,28,'#31465A',4)+icon('earth',750,303,13,M)+tx(772,315,'All terminals  ·  Global',8.7,F,500)+tx(1036,315,'G',7.5,M,600,'Cascadia Mono')+r(741,327,312,28,'#31465A',4)+icon('folder',750,334,13,M)+tx(772,346,'This workspace  ·  Relay Terminal',8.7,F,500)+tx(1036,346,'W',7.5,M,600,'Cascadia Mono')+r(741,358,312,21,'#3E5A70',4,A)+icon('terminal',750,362,12,A)+tx(772,373,'This session  ·  PowerShell 7',8.2,F,600)+tx(1036,373,'S',7.5,'#B8CFEE',700,'Cascadia Mono');
  s+=tx(730,408,'HOW THIS SESSION RESOLVES',7.5,M,700,'Segoe UI','letter-spacing=".5"')+r(730,417,334,56,'#202E3B',5,'#3C5367')+tx(742,435,'Session override',8.2,F,600)+tx(742,450,'None · inherits from Relay Terminal',8.3,'#9AC8AC',500)+icon('corner-down-right',1018,430,16,'#9AC8AC')+tx(730,491,'Effective application',7.4,M,500)+r(730,498,162,30,T,4,B)+tx(740,517,'Harbor',9,F,550)+tx(900,491,'Effective terminal',7.4,M,500)+r(900,498,164,30,T,4,B)+tx(910,517,'Frost',9,F,550);
  s+=l(730,539,1064,B)+tx(730,557,'Active session drives application chrome.',8.3,F,550)+tx(730,574,'Its terminal palette remains independent.',7.6,M)+r(730,584,334,46,'#202E3B',5,'#3C5367')+icon('panel-top',741,595,14,A)+tx(764,600,'PowerShell 7  ·  Harbor chrome',7.6,F,550)+icon('terminal',741,614,13,'#B6CFDE')+tx(764,624,'Frost terminal  ·  inherited from workspace',7.4,M);
  s+=r(730,637,334,20,'#202E3B',4,'#3C5367')+icon('info',739,641,11,A)+tx(757,651,'Choosing a scope changes the edit target, not shell state.',6.8,M);
  s=s.replaceAll('Session override','Inherits from workspace').replace('None · inherits from Relay Terminal','Effective · Relay Terminal');
  s+=studioFooter('this session','Reset preview','Apply');
  return s;
}
function scopeOverride(){
  let s=appFrame({studio:true})+studioPanel('themes','This session','Global  ›  Relay Terminal  ›  PowerShell 7');
  s+=tx(730,211,'SESSION APPEARANCE',8,M,700,'Segoe UI','letter-spacing=".7"')+r(730,221,334,35,'#202E3B',5,'#B8CFEE')+icon('git-branch',741,231,14,'#B8CFEE')+tx(764,244,'Session override',9.2,F,600)+tx(949,244,'Unsaved draft',7.4,'#DDBB85',600);
  s+=tx(730,275,'Inheritance path',7.4,M,600)+r(730,282,334,29,T,4,B)+tx(741,301,'Global',8,M)+icon('chevron-right',787,290,11,M)+tx(806,301,'Relay Terminal',8,M)+icon('chevron-right',893,290,11,M)+r(912,286,140,21,'#31465A',4,A)+tx(922,301,'PowerShell 7',7.8,F,550);
  s+=r(730,320,334,30,'#202E3B',4,'#3C5367')+icon('rotate-ccw',740,328,13,A)+tx(762,340,'Use workspace appearance',8.2,F,550)+tx(951,340,'Removes override',7,M);
  s+=tx(730,373,'Mix application and terminal independently',9.2,F,600)+tx(730,391,'The active session’s application theme colors Relay chrome.',7.4,M);
  s+=tx(730,417,'Application theme',7.5,M,500)+r(730,424,160,31,T,4,B)+icon('panels-top-left',740,433,13,A)+tx(762,445,'Porcelain',8.8,F,550)+icon('chevron-down',875,433,11,M)+tx(900,417,'Terminal scheme',7.5,M,500)+r(900,424,164,31,T,4,B)+icon('terminal',910,433,13,A)+tx(932,445,'Carbon',8.8,F,550)+icon('chevron-down',1049,433,11,M);
  s+=l(730,465,1064,B)+tx(730,484,'SESSION TERMINAL PREVIEW',7.5,M,700,'Segoe UI','letter-spacing=".6"')+themeThumb(730,493,334,83,'Carbon','#25211F','#EEE4D6','#D9B687','solid',true)+
    tx(730,586,'Preview follows the active tab immediately.',8.1,F,550)+tx(730,601,'Apply saves this session choice; Reset restores the saved value.',7.0,M)+tx(730,614,'Close Studio discards the unsaved draft.',7.0,M)+
    r(730,620,334,28,'#202E3B',4,'#3C5367')+icon('sun',741,628,12,'#356D9B')+tx(761,640,'Relay chrome preview · Porcelain',7.7,F,550)+tx(986,640,'live',7.4,'#9AC8AC',600);
  s+=studioFooter('this session','Reset preview','Apply');
  // Light chrome treatment is visible on the top rail when this session is active.
  s=s.replace(r(0,0,1080,44,H),r(0,0,1080,44,'#EAF0F5')).replace(r(0,43,1080,B),r(0,43,1080,'#C8D2DB'));
  s=s.replace(mark(42,10,23,A,H),mark(42,10,23,'#356D9B','#EAF0F5')).replace(tx(72,27,'Relay',15,F,600),tx(72,27,'Relay',15,'#243441',600));
  s=s.replace(r(392,8,168,28,T,5,B),r(392,8,168,28,'#F7F9FC',5,'#C8D2DB')).replace(tx(425,26,'Find a command',11,M),tx(425,26,'Find a command',11,'#526978'));
  const uiMap={'#1C2835':'#EAF0F5','#27313D':'#FFFFFF','#141E29':'#F7F9FC','#202E3B':'#FFFFFF','#263643':'#FFFFFF','#273442':'#DCE7EF','#31465A':'#DCE7EF','#3C5367':'#C8D2DB','#344352':'#C8D2DB','#435C75':'#C9DAEB','#E0E8EF':'#243441','#A7B6C4':'#526978','#93B8DD':'#356D9B'};
  s=s.replace(/<rect\b([^>]*)>/g,(whole,attrs)=>{const x=Number(attrs.match(/\bx="([0-9.]+)/)?.[1]||0),y=Number(attrs.match(/\by="([0-9.]+)/)?.[1]||0),fill=attrs.match(/\bfill="([^"]+)"/)?.[1];let next=attrs;if(x>=714||y<116||y>=692){if(uiMap[fill])next=next.replace(`fill="${fill}"`,`fill="${uiMap[fill]}"`);}else if(fill==='#141E29')next=next.replace(`fill="${fill}"`,'fill="#25211F"');return `<rect${next}>`;});
  s=s.replace(/<text\b([^>]*)>/g,(whole,attrs)=>{const x=Number(attrs.match(/\bx="([0-9.]+)/)?.[1]||0),y=Number(attrs.match(/\by="([0-9.]+)/)?.[1]||0),fill=attrs.match(/\bfill="([^"]+)"/)?.[1];let next=attrs;if(x>=714||y<116||y>=692){const chromeText={...uiMap,'#B8CFEE':'#356D9B','#9AC8AC':'#32684A','#DDBB85':'#826027'};if(chromeText[fill])next=next.replace(`fill="${fill}"`,`fill="${chromeText[fill]}"`);}else if(y>=116){const termMap={'#E0E8EF':'#EEE4D6','#A7B6C4':'#BCAD9C','#95B4D8':'#D9B687'};if(termMap[fill])next=next.replace(`fill="${fill}"`,`fill="${termMap[fill]}"`);}return `<text${next}>`;});
  for(const [from,to] of [['#344352','#C8D2DB'],['#A7B6C4','#526978'],['#93B8DD','#356D9B']])s=s.replaceAll(`stroke="${from}"`,`stroke="${to}"`);
  return s;
}
function themeLifecycle(){
  let s=appFrame({studio:true})+studioPanel('themes','This workspace','Global  ›  Relay Terminal');
  s+=tx(730,211,'CUSTOM THEMES',8,M,700,'Segoe UI','letter-spacing=".7"')+tx(991,211,'08 / 40 saved',7.4,M,500,'Cascadia Mono');
  const themes=[['After Rain','#182834','#DCE7EF','#85AECF'],['Paper Trail','#F7F9FC','#243441','#356D9B'],['Copper Night','#25211F','#EEE4D6','#D9B687']];
  themes.forEach(([name,bg,fg,accent],i)=>{let y=219+i*49,sel=i===0;s+=r(730,y,334,43,sel?'#293B4B':'#202E3B',5,sel?A:'#3D5060',sel?1.2:1)+r(738,y+5,61,33,bg,4)+mono(743,y+19,'PS> git status',6.2,fg)+mono(743,y+30,'clean',6,accent)+tx(811,y+18,name,8.7,F,550)+tx(811,y+33,sel?'Selected · custom':'Custom theme',7.0,M)+icon('pencil',958,y+13,12,M)+icon('trash-2',1001,y+13,12,'#DDBB85')+tx(1018,y+27,'Delete now',6.8,'#E6C89A',600);});
  s+=tx(730,374,'RENAME / EDIT SELECTED THEME',7.5,M,700,'Segoe UI','letter-spacing=".5"')+r(730,382,334,26,T,4,B)+tx(741,399,'After Rain · dusk',8.6,F,500)+icon('type',1039,388,13,M);
  s+=r(730,414,334,34,A,5)+icon('check',741,423,13,T)+tx(763,428,'Save theme changes',8.7,T,650)+tx(934,428,'SAVES + APPLIES NOW',7.0,T,700);
  s+=l(730,456,1064,B)+tx(730,470,'LIBRARY ACTIONS · IMMEDIATE',7.4,'#E6C89A',700,'Segoe UI','letter-spacing=".4"');
  s+=r(730,476,162,41,T,4,'#50647A')+icon('copy',739,483,13,A)+tx(760,490,'Save a copy',8.1,F,600)+tx(739,506,'Saves + applies now',7.2,'#B8CFEE',600);
  s+=r(898,476,80,41,T,4,'#50647A')+icon('upload',905,483,12,M)+tx(925,490,'Import',7.8,F,600)+tx(904,506,'Saved now',6.8,'#B8CFEE',600);
  s+=r(984,476,80,41,T,4,'#50647A')+icon('download',990,483,12,M)+tx(1010,490,'Export',7.8,F,600)+tx(990,506,'Writes JSON',6.8,M,500);
  s+=r(730,522,334,31,'#392F28',4,'#9B805B')+icon('undo-2',740,531,13,'#E6C89A')+tx(761,542,'Deleted now · references fall back to Harbor',7.6,'#F0DEC3',600)+tx(966,542,'Undo',7.8,'#F0DEC3',650);
  s+=r(730,561,334,56,'#202E3B',5,'#3C5367')+icon('clock-3',741,572,13,'#DDBB85')+tx(762,577,'APPEARANCE PREVIEW · STAGED',7.6,'#E6C89A',700)+tx(741,596,'Import previews live; Apply keeps that selection.',7.5,F,500)+tx(741,609,'Unsaved edits and theme mixes also wait for Apply.',7.3,M);
  s+=studioFooter('this workspace','Reset preview','Apply changes');
  return s;
}
function globalSystemPreference(){
  let s=appFrame({studio:true})+studioPanel('themes','All terminals','Global appearance');
  s+=tx(730,211,'GLOBAL APPEARANCE',8,M,700,'Segoe UI','letter-spacing=".7"')+r(730,223,334,63,'#202E3B',5,'#9B805B')+icon('monitor',742,235,16,'#DDBB85')+tx(768,239,'NEW PROPOSAL · Follow Windows',9.2,F,650)+tx(768,258,'Model supports this; current Studio has no switch.',7.6,M)+r(1014,237,38,23,'#315F63',12,'#5A9694')+c(1040,248,8,'#E4F0EE')+tx(768,277,'Proposed control shown ON',7.2,'#E6C89A',600);
  s+=tx(730,308,'WINDOWS SETTING',7.5,M,600)+r(730,315,160,37,T,5,B)+icon('sun',741,326,14,M)+tx(762,339,'Light',8.8,M,500)+r(900,315,164,37,'#31465A',5,A)+icon('moon',911,326,14,'#B8CFEE')+tx(932,339,'Dark',8.8,F,600);
  s+=r(730,372,334,70,'#202E3B',5,'#3C5367')+icon('check',742,384,14,'#9AC8AC')+tx(765,390,'Effective now · Harbor / Harbor',8.7,F,600)+tx(742,409,'Dark Windows → dark Relay chrome + terminal.',7.7,M)+tx(742,428,'Workspace/session overrides still take precedence.',7.4,M);
  s+=tx(730,466,'GLOBAL PRESETS',7.5,M,700,'Segoe UI','letter-spacing=".5"')+themeThumb(730,475,160,57,'Porcelain','#F7F9FC','#243441','#356D9B','solid',false)+themeThumb(898,475,166,57,'Harbor','#141E29','#E0E8EF','#93B8DD','solid',true);
  s+=r(730,549,334,50,'#202E3B',5,'#3C5367')+tx(742,568,'Automatic source resolves app + terminal together.',8.0,F,550)+tx(742,586,'Local overrides keep their own independent palettes.',7.4,M);
  s+=studioFooter('all terminals','Reset preview','Apply');
  return s;
}
function importErrorState(){
  let s=appFrame({studio:true})+studioPanel('themes','This workspace','Global  ›  Relay Terminal');
  s+=tx(730,211,'IMPORT THEME',8,M,700,'Segoe UI','letter-spacing=".7"')+r(730,222,334,72,'#202E3B',5,'#3C5367')+icon('file',743,237,18,A)+tx(774,245,'theme-night.json',9.2,F,550)+tx(774,264,'Selected · 18 KB',7.6,M)+tx(774,281,'Relay theme JSON · version 1',7.4,M);
  s+=r(730,307,334,91,'#3A262C',5,'#8D5960')+icon('circle-alert',743,320,16,'#EEA0A4')+tx(770,326,'Theme could not be imported',9.4,'#F2C4C7',600)+tx(743,348,'Unsupported theme format or version.',7.8,F)+tx(743,367,'No library item was added. Choose another file or repair',7.4,'#E3BEC2')+tx(743,383,'the JSON and import again.',7.4,'#E3BEC2');
  s+=tx(730,426,'VALIDATION & RECOVERY',7.5,M,700,'Segoe UI','letter-spacing=".6"')+r(730,435,334,61,'#202E3B',5,'#3C5367')+tx(742,453,'File size',7.6,M)+tx(942,453,'Maximum 6 MB',7.8,F,550)+l(742,461,1051,B)+tx(742,480,'Themes',7.6,M)+tx(942,480,'Up to 40 saved',7.8,F,550)+
    r(730,506,334,51,'#202E3B',5,'#3C5367')+tx(742,525,'Embedded wallpaper',7.6,M)+tx(892,525,'≤ 8192 px edge',7.8,F,550)+tx(742,543,'≤ 16 megapixels · image payload ≤ 4 MB',7.3,M);
  s+=r(730,570,160,30,A,5)+icon('upload',740,578,13,T)+tx(761,590,'Choose JSON file',8.2,T,600)+r(900,570,164,30,T,5,B)+icon('download',910,578,13,M)+tx(932,590,'Export selected',8.2,F,500)+
    tx(730,618,'Valid import adds to the library immediately and previews live.',7.3,M)+tx(730,633,'Use Apply to persist the appearance choice.',7.3,M);
  s+=studioFooter('this workspace','Reset preview','Apply');
  return s;
}
function compactRefinement(){
  // Keep the shell at 420 px. The compact Studio uses a single task view,
  // 27 px controls, direct values, and internal scrolling for sections below.
  let s=r(0,0,760,500,H)+r(0,0,760,40,H)+l(0,39,760,B)+icon('panel-left-open',10,12,15,M)+mark(37,8,22,A,H)+tx(66,25,'Relay',14,F,600)+r(287,6,138,27,T,5,B)+icon('search',298,13,13,M)+tx(320,24,'Find a command',9.5,M);
  for(let i=0;i<3;i++)s+=r(620+i*36,0,36,40,'transparent')+icon(['minus','square','x'][i],631+i*36,13,13,M);
  s+=r(0,40,420,38,H)+r(12,44,123,31,T,5)+r(12,73,123,2,A,1)+tx(25,63,'PowerShell 7',10.5,F,500)+tx(150,63,'Build',9.5,M)+icon('plus',186,52,15,M)+icon('columns-2',363,52,15,M)+r(0,78,420,25,T)+icon('folder',12,84,12,M)+tx(31,96,'C:  ›  AI  ›  Projects  ›  Relay-Terminal',8.8,M);
  s+=r(0,103,420,369,T)+mono(18,134,'PS C:\\Relay-Terminal> Get-Content build.log',10.5,'#95B4D8')+mono(18,162,'[INFO]  worker started  ·  4 suites',10,'#8DBBC3')+mono(18,189,'[WARN]  retrying request in 500 ms',10,'#D7BB87')+mono(18,216,'[PASS]  31 tests passed  ·  0 failed',10,'#96BCA3')+mono(18,260,'PS C:\\Relay-Terminal>',10.5,'#95B4D8')+r(195,248,2,14,A,1);
  s+=r(0,472,760,28,H)+l(0,472,760,B)+icon('terminal',10,479,12,M)+tx(30,491,'PowerShell 7 · Ready',9,M);
  s+=r(420,40,340,460,H)+v(420,40,500,B)+icon('palette',432,51,15,A)+tx(454,65,'Appearance Studio',13,F,600)+icon('x',741,51,13,M)+
    tx(432,89,'Apply to',9.5,M)+r(481,72,259,25,T,4,B)+tx(491,89,'This workspace',10,F,500)+icon('chevron-down',723,79,11,M)+tx(432,113,'Global  ›  Relay Terminal',8.8,M)+r(648,98,92,19,'#273442',4)+tx(657,111,'Override',8,'#B8CFEE',600)+l(432,122,748,B);
  [['palette','Themes'],['sliders-horizontal','Colour'],['type','Type'],['image','Backdrop']].forEach(([ic,label],i)=>{const bx=432+i*79,sel=label==='Backdrop';if(sel)s+=r(bx,126,75,26,R,4);s+=icon(ic,bx+5,133,12,sel?A:M)+tx(bx+22,144,label,9,sel?F:M,sel?600:400);});
  s+=tx(432,171,'Ambient gradient',11,F,600)+[['square','Solid'],['blend','Gradient'],['image','Wallpaper'],['wind','Ambient']].map(([ic,t],i)=>{let x=432+i*78,sel=t==='Ambient';return r(x,179,74,30,sel?'#31465A':T,4,sel?A:B,sel?1.2:1)+icon(ic,x+6,188,12,sel?A:M)+tx(x+24,199,t,9,sel?F:M,sel?600:400)}).join('');
  s+=r(432,215,307,46,'url(#terminalWash)',4,'#526B80')+l(449,250,720,224,'#DCE7EF',1.3)+c(449,250,4,'#2B465C','#E7EFF5',1)+c(720,224,4,'#65747D','#E7EFF5',1)+tx(442,229,'START',7.3,'#E1E9F1',650)+tx(685,255,'END',7.3,'#E1E9F1',650)+tx(432,277,'Live on the running terminal',8.8,M);
  s+=tx(432,296,'Start colour',9.2,F,500)+r(432,301,145,27,T,4,B)+r(439,307,16,15,'#2B465C',2,'#647A8C')+tx(465,320,'#2B465C',9.5,F,550,'Cascadia Mono')+tx(589,296,'End colour',9.2,F,500)+r(589,301,150,27,T,4,B)+r(596,307,16,15,'#65747D',2,'#8395A4')+tx(622,320,'#65747D',9.5,F,550,'Cascadia Mono');
  s+=tx(432,345,'Angle  0–360°',9.2,F,500)+r(555,337,121,5,'#405365',2)+r(555,337,46,5,A,2)+c(601,339,5,A,'#D8E7F3',1)+r(682,328,57,26,T,4,B)+tx(690,346,'135°',9.5,F,550,'Cascadia Mono');
  const compactEffect=(y,label,value,min,max,ratio)=>tx(432,y,label,9,F,500)+tx(507,y,min+'–'+max,7.7,M,400,'Cascadia Mono')+r(576,y-8,99,5,'#405365',2)+r(576,y-8,99*ratio,5,A,2)+c(576+99*ratio,y-6,4.5,A,'#D8E7F3',1)+r(682,y-18,57,25,T,4,B)+tx(689,y-1,value,9.3,F,550,'Cascadia Mono');
  s+=compactEffect(369,'Surface opacity','0.78','0.35','1.00',.66)+compactEffect(397,'Intensity','0.62','0','1',.62)+compactEffect(425,'Blur','18 px','0','40 px',.45);
  s+=r(432,433,307,17,'#202E3B',4,'#3C5367')+icon('clock-3',439,435,12,A)+tx(458,446,'Animation',8.8,F,500)+r(525,434,29,14,'#315F63',8)+c(545,441,5,'#E4F0EE')+tx(562,446,'On',8.8,F,600)+tx(591,446,'Duration',8.6,M)+r(647,434,92,15,T,3,B)+tx(655,446,'30 s · 10–120 s',8.4,F,500,'Cascadia Mono');
  s+=r(748,171,3,274,'#344352',2)+r(748,183,3,210,'#93B8DD',2)+tx(432,463,'Scroll for reduced-motion and visibility behavior',7.8,M);
  s+=r(420,472,340,28,H)+l(420,472,760,B)+r(431,474,112,23,'transparent',4,B)+icon('rotate-ccw',438,480,11,M)+tx(457,491,'Reset preview',8.8,F,500)+tx(555,491,'Unsaved preview',8.4,'#DDBB85',500)+r(653,474,95,23,A,4)+icon('check',661,480,11,T)+tx(680,491,'Apply',9.5,T,650);
  return s;
}
function splitContext(){
  let s=appFrame({studio:false,selectedTool:'terminal',split:true});
  const mx=248, ww=832, split=mx+ww/2;
  s+=r(702,155,218,180,'#17222D',6,'#536A7D')+r(706,159,210,172,'#27313D',5,'#465C6E')+icon('terminal',719,173,14,A)+tx(742,184,'PowerShell 7',9,F,550)+tx(873,184,'Carbon',7.5,'#D9B687',600)+l(718,194,903,B)+icon('palette',719,207,13,A)+tx(742,219,'Appearance',8.7,F,550)+icon('chevron-right',890,208,12,M)+l(718,229,903,B)+icon('external-link',719,241,13,M)+tx(742,253,'Open terminal settings',8.3,F)+icon('terminal',719,274,13,M)+tx(742,286,'Rename tab',8.3,F)+icon('x',719,304,13,M)+tx(742,316,'Close tab',8.3,F);
  s+=r(split+4,145,ww/2-20,29,'#3B332D',4,'#79664F')+icon('pointer',split+12,153,13,'#D9B687')+tx(split+34,164,'Right-clicked session · pwsh / Carbon',8.2,'#F0E6D7',550);
  return s;
}
function splitQuickEditor(){
  let s=appFrame({studio:false,selectedTool:'terminal',split:true});
  // Anchored to the Carbon right split; the full bounded flyout ends above
  // Relay's status bar and leaves the left shell fully available.
  s+=r(704,128,354,535,'#27313D',7,'#50647A')+icon('palette',720,143,16,A)+tx(745,157,'Quick appearance',12,F,600)+icon('x',1038,143,14,M)+l(719,170,1043,B);
  s+=r(720,181,322,43,'#202E3B',5,'#9B805B')+icon('terminal',732,190,14,'#D9B687')+tx(755,196,'This session · pwsh',9.1,F,600)+tx(755,211,'Right split · Carbon terminal scheme',8.0,M)+icon('check',1017,193,14,'#9AC8AC');
  s+=tx(720,242,'Application chrome',8.4,M,500)+r(720,249,153,31,T,4,B)+icon('panels-top-left',729,258,13,A)+tx(750,270,'Harbor',9.1,F,550)+icon('chevron-down',856,257,10,M)+tx(889,242,'Terminal scheme',8.4,M,500)+r(889,249,153,31,T,4,B)+icon('terminal',898,258,13,'#D9B687')+tx(919,270,'Carbon',9.1,F,550)+icon('chevron-down',1026,257,10,M);
  s+=tx(720,303,'Background',8.4,M,500)+[['square','Solid'],['blend','Gradient'],['image','Wallpaper'],['wind','Ambient']].map(([ic,label],i)=>{const bx=720+i*81,active=label==='Solid';return r(bx,310,76,31,active?'#31465A':T,4,active?A:B,active?1.1:1)+icon(ic,bx+6,319,12,active?A:M)+tx(bx+24,331,label,7.8,active?F:M,active?600:400)}).join('');
  s+=r(720,350,322,46,'#202E3B',5,'#53687A')+r(731,360,26,26,'#25211F',4,'#8A7660')+tx(770,368,'Solid colour',8.1,M,500)+tx(770,386,'#25211F',9.5,F,600,'Cascadia Mono')+icon('chevron-down',1018,366,11,M);
  s+=tx(720,414,'Backdrop effects',8.3,M,600)+r(720,422,322,45,T,4,B)+tx(732,439,'Opacity —',8.2,M,500)+tx(838,439,'Intensity —',8.2,M,500)+tx(957,439,'Blur —',8.2,M,500)+tx(732,458,'Not used for Solid · choose another mode to edit.',7.7,M);
  s+=r(720,478,322,45,'#202E3B',5,'#3C5367')+icon('git-branch',731,488,13,'#9AC8AC')+tx(753,493,'Session override',8.3,F,600)+tx(753,509,'Local to pwsh · right split',7.7,M)+r(931,486,101,27,T,4,'#53687A')+tx(940,497,'Use workspace',8.0,F,550)+tx(940,508,'Saved now',7.0,'#B8CFEE',600);
  s+=r(720,534,322,36,A,5)+icon('external-link',733,545,14,T)+tx(758,557,'Open full Appearance Studio',9.2,T,650);
  s+=r(720,579,112,28,'transparent',4,B)+icon('rotate-ccw',730,587,12,M)+tx(750,598,'Reset preview',8.2,F,500)+tx(842,590,'Preview · not saved',7.8,'#DDBB85',550)+r(936,579,106,28,A,4)+icon('check',945,587,12,T)+tx(965,598,'Apply to session',8.1,T,650);
  s+=r(720,614,322,34,'#202E3B',4,'#3C5367')+icon('info',730,621,12,'#D9B687')+tx(751,628,'Targets pwsh only; app chrome follows the active session.',7.6,'#D1C2AE')+tx(751,640,'Use workspace removes this override and saves immediately.',7.3,M);
  return s;
}
function themeExportDialog(){
  let s=appFrame({studio:true})+studioPanel('themes','This workspace','Global  ›  Relay Terminal');
  s+=tx(730,211,'CUSTOM THEME SELECTED',8,M,700,'Segoe UI','letter-spacing=".7"')+themeThumb(730,220,334,60,'After Rain','#182834','#DCE7EF','#85AECF','solid',true)+
    r(730,292,160,30,T,4,B)+icon('download',740,300,13,A)+tx(761,312,'Export selected',8.2,F,550)+tx(730,342,'Portable JSON includes the palette and supported wallpaper data.',7.3,M);
  s+=studioFooter('this workspace','Reset preview','Apply');
  // This is the existing native Windows Save dialog, shown as the single active
  // interaction state. Its default filename is source-backed.
  s+=r(186,142,706,492,'#11182066',8)+r(174,130,706,492,'#F5F7F9',8,'#AFBAC5',1.1)+r(175,131,704,38,'#EAF0F5',8)+icon('download',190,142,16,'#356D9B')+tx(216,155,'Export Relay theme',12,'#243441',600)+icon('x',856,143,14,'#5C6D7C');
  s+=r(191,183,180,34,'#FFFFFF',4,'#C8D2DB')+icon('chevron-left',200,194,13,'#526978')+icon('chevron-right',221,194,13,'#526978')+icon('arrow-up',245,194,13,'#526978')+r(376,183,311,34,'#FFFFFF',4,'#C8D2DB')+icon('folder',386,193,13,'#526978')+tx(407,205,'This PC  ›  Documents  ›  Relay themes',9,'#243441',500)+icon('chevron-down',666,194,11,'#526978');
  s+=r(191,226,155,312,'#EEF2F5',3,'#D4DCE3')+icon('star',205,240,13,'#738391')+tx(228,252,'Quick access',9,'#243441',500)+icon('monitor',205,276,13,'#738391')+tx(228,288,'Desktop',9,'#526978')+icon('download',205,308,13,'#738391')+tx(228,320,'Downloads',9,'#526978')+icon('file',205,340,13,'#738391')+tx(228,352,'Documents',9,'#243441',550)+r(198,361,143,24,'#DCE7EF',4);
  s+=r(358,226,503,312,'#FFFFFF',3,'#D4DCE3')+r(358,226,503,25,'#F5F7F9')+tx(373,243,'Name',8,'#526978',600)+tx(673,243,'Date modified',8,'#526978',600)+l(358,252,861,'#D4DCE3')+icon('folder',375,270,15,'#9B805B')+tx(399,282,'Reference themes',9,'#243441',500)+tx(673,282,'Today',8,'#526978')+icon('file',375,302,15,'#356D9B')+tx(399,314,'Harbor-backup.json',9,'#243441',500)+tx(673,314,'Yesterday',8,'#526978');
  s+=tx(196,558,'File name:',8.5,'#243441',500)+r(262,544,365,29,'#FFFFFF',4,'#8BAAC2')+tx(273,563,'relay-theme.json',9,'#243441',500,'Segoe UI')+tx(646,558,'Save as type:',8.5,'#243441',500)+r(718,544,141,29,'#FFFFFF',4,'#C8D2DB')+tx(728,563,'Relay theme (*.json)',7.8,'#243441',500)+icon('chevron-down',841,552,11,'#526978')+r(726,579,62,29,'#FFFFFF',4,'#AAB7C2')+tx(742,598,'Cancel',9,'#243441',500)+r(796,579,63,29,'#356D9B',4,'#356D9B')+tx(809,598,'Save',9,'#FFFFFF',600);
  return s;
}
function svg(content,w=1080,h=720){return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}${content}</svg>`;}
const files=[
  ['01-complete-appearance-studio.svg',svg(themeStudio())],
  ['01c-type-and-cursor.svg',svg(typeStudio())],
  ['01d-independent-split-sessions.svg',svg(splitSessionDemo())],
  ['01b-appearance-studio-compact-760x500.svg',svg((()=>{
    // Compact, still recognisably Relay: 760 × 500 with the terminal, tab strip and a 340 px Studio.
    let s=r(0,0,760,500,H)+r(0,0,760,40,H)+l(0,39,760,B)+icon('panel-left-open',10,12,15,M)+mark(37,8,22,A,H)+tx(66,25,'Relay',14,F,600)+r(300,6,120,27,T,5,B)+icon('search',309,13,13,M)+tx(330,24,'Find command',9,M);
    for(let i=0;i<3;i++)s+=r(620+i*36,0,36,40,'transparent')+icon(['minus','square','x'][i],631+i*36,13,13,M);
    s+=r(0,40,420,38,H)+r(12,44,110,31,T,5)+r(12,73,110,2,A)+tx(25,63,'PowerShell',10,F,500)+icon('plus',139,52,15,M)+icon('columns-2',363,52,15,M)+r(0,78,420,25,T)+icon('folder',12,84,12,M)+tx(31,96,'C:  ›  AI  ›  Projects  ›  Relay-Terminal',8.5,M);
    s+=r(0,103,420,369,T)+mono(18,133,'PS C:\\Relay-Terminal> git status',10,'#95B4D8')+mono(18,157,' M src/AppearanceStudio.tsx',9.4,F)+mono(18,180,' M src/studio.css',9.4,F)+mono(18,227,'PS C:\\Relay-Terminal>',10,'#95B4D8')+r(177,215,2,14,A,1);
    s+=r(0,472,760,28,H)+l(0,472,760,B)+icon('terminal',10,479,12,M)+tx(30,491,'PowerShell 7 · Ready',8.5,M);
    s+=r(420,40,340,460,H)+v(420,40,500,B)+icon('palette',432,51,15,A)+tx(454,65,'Appearance Studio',13,F,600)+icon('x',741,51,13,M);
    s+=tx(434,88,'Apply to',8,M)+r(483,72,258,24,T,4,B)+tx(493,88,'This workspace',9,F,500)+icon('chevron-down',724,78,10,M)+tx(434,111,'Global  ›  Relay Terminal',7.8,M)+r(647,97,94,19,'#273442',4)+tx(655,110,'Override',7.5,'#B8CFEE',600);
    s+=l(432,122,748,B);
    [['palette','Themes'],['sliders-horizontal','Colour'],['type','Type'],['image','Backdrop']].forEach(([ic,label],i)=>{const bx=432+i*79,sel=label==='Themes';if(sel)s+=r(bx,126,75,25,R,4);s+=icon(ic,bx+5,132,12,sel?A:M)+tx(bx+22,143,label,7.8,sel?F:M,sel?600:400);});
    s+=tx(434,172,'Choose a theme',9,F,600)+themeThumb(434,179,307,49,'Frost','#18232E','#E7EFF5','#B6CFDE','gradient',true);
    s+=themeThumb(434,234,147,42,'Harbor','#141E29','#E0E8EF','#93B8DD','solid')+themeThumb(589,234,152,42,'Porcelain','#F7F9FC','#243441','#356D9B','solid');
    s+=themeThumb(434,282,147,42,'Carbon','#25211F','#EEE4D6','#D9B687','solid')+themeThumb(589,282,152,42,'Tideland','#152B33','#E4F0EE','#94C6C1','wallpaper');
    s+=tx(434,345,'Application chrome',7.8,M)+r(434,351,147,23,T,4,B)+tx(443,366,'Harbor',8.2,F,500)+icon('chevron-down',564,357,10,M)+tx(589,345,'Terminal scheme',7.8,M)+r(589,351,152,23,T,4,B)+tx(598,366,'Frost',8.2,F,500)+icon('chevron-down',724,357,10,M);
    s+=tx(434,396,'Custom themes',8.5,F,550)+tx(688,396,'08 / 40',7.5,M,500,'Cascadia Mono')+r(434,403,307,27,'#202E3B',4)+tx(443,420,'After Rain',8.3,F,500)+icon('pencil',676,410,12,M)+icon('copy',699,410,12,M)+icon('trash-2',724,410,12,M);
    s+=r(434,438,94,23,'transparent',4,B)+icon('upload',441,444,11,M)+tx(458,454,'Import',7.8,F)+r(536,438,91,23,'transparent',4,B)+icon('download',543,444,11,M)+tx(560,454,'Export',7.8,F)+r(635,438,106,23,'transparent',4,B)+icon('plus',642,444,11,M)+tx(659,454,'Save as',7.8,F);
    s+=l(420,467,760,B)+r(431,473,116,21,'transparent',4,B)+icon('rotate-ccw',437,478,10,M)+tx(454,487,'Reset preview',7.1,F)+r(653,473,94,21,A,4)+icon('check',661,478,10,T)+tx(678,487,'Apply',8,T,650);
    return s;
  })(),760,500)],
  ['02-professional-colour-ansi.svg',svg(colorStudio())],
  ['03a-ambient-background-effects.svg',svg(backgroundStudio('ambient',false))],
  ['03b-wallpaper-background-editor.svg',svg(backgroundStudio('wallpaper',true))],
  ['04a-tab-context-menu.svg',svg(quickAppearance(1))],
  ['04b-context-quick-editor.svg',svg(quickAppearance(2))],
  ['04c-context-to-full-studio.svg',svg(quickAppearance(3))],
  ['05a-background-gradient-docked-editor.svg',svg(refinedGradient())],
  ['05b-background-wallpaper-position-proposal.svg',svg(refinedWallpaper())],
  ['06a-colour-role-atlas.svg',svg(refinedRoleAtlas())],
  ['06b-ansi-precision-editor.svg',svg(refinedAnsiPicker())],
  ['07a-scope-target-and-inheritance.svg',svg(scopeWorkflow())],
  ['07b-session-override-and-chrome.svg',svg(scopeOverride())],
  ['07c-global-windows-appearance.svg',svg(globalSystemPreference())],
  ['08a-theme-library-lifecycle.svg',svg(themeLifecycle())],
  ['08b-import-validation-recovery.svg',svg(importErrorState())],
  ['08c-theme-export-save-dialog.svg',svg(themeExportDialog())],
  ['09a-compact-760x500-backdrop.svg',svg(compactRefinement(),760,500)],
  ['10a-split-session-context-menu.svg',svg(splitContext())],
  ['10b-split-session-quick-editor.svg',svg(splitQuickEditor())]
];
mkdirSync(join(out,'professional-src'),{recursive:true});
for(const [name,data] of files)writeFileSync(join(out,'professional-src',name),data);
const refinementFiles=files.filter(([name])=>/^(05|06|07|08|09|10)/.test(name));
mkdirSync(join(out,'refinement-src'),{recursive:true});
for(const [name,data] of refinementFiles)writeFileSync(join(out,'refinement-src',name),data);
console.log(files.map(([name])=>join(out,'professional-src',name)).join('\n'));
