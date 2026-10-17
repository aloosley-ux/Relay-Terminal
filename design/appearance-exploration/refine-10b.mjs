import { readFileSync, writeFileSync } from 'node:fs';
const path = 'design/appearance-exploration/generate-professional-review.mjs';
let source = readFileSync(path, 'utf8');
const start = source.indexOf('function splitQuickEditor(){');
const end = source.indexOf('\nfunction themeExportDialog(){', start);
if (start < 0 || end < 0) throw new Error('Could not locate splitQuickEditor boundaries');
const replacement = String.raw`function splitQuickEditor(){
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
}`;
writeFileSync(path, source.slice(0, start) + replacement + source.slice(end));
