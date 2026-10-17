import type { ITheme } from '@xterm/xterm';
import type { Session, Settings } from './types';
export const ansiKeys = ['black','red','green','yellow','blue','magenta','cyan','white','brightBlack','brightRed','brightGreen','brightYellow','brightBlue','brightMagenta','brightCyan','brightWhite'] as const;
export type AppColors = { background: string; raised: string; text: string; muted: string; accent: string; border: string };
export interface AppearanceTheme {
  id: string; name: string; mode: 'dark' | 'light'; app: AppColors;
  terminal: Required<Pick<ITheme, 'background' | 'foreground' | 'cursor' | 'selectionBackground'>> & Record<typeof ansiKeys[number], string>;
  fontFamily: string; fontSize: number; lineHeight: number; letterSpacing: number; padding: number;
  cursorStyle: 'bar' | 'block' | 'underline'; cursorBlink: boolean;
  background: { type: 'solid' | 'gradient' | 'wallpaper' | 'ambient'; image: string; from: string; to: string; angle: number; opacity: number; blur: number; intensity: number; animated: boolean; speed: number; positionX?: number; positionY?: number };
}
export interface AppearanceChoice { appTheme: string; terminalTheme: string; custom?: AppearanceTheme; appCustom?: AppearanceTheme; tabIdentity?: { color: string; icon: 'terminal' | 'folder' | 'code' | 'server' | 'star' } }
export interface AppearanceStore { version: 1; global: AppearanceChoice; workspaces: Record<string, AppearanceChoice>; sessions: Record<string, AppearanceChoice>; themes: AppearanceTheme[]; followSystem?: boolean }
const darkAnsi = ['#273442','#d99596','#96bca3','#d7bb87','#95b4d8','#b8a4d3','#8dbbc3','#d4dce5','#8292a3','#efb2b1','#b5d4bc','#ecd1a2','#b8cfee','#d6bfe9','#afd9df','#f3f6fa'];
const lightAnsi = ['#293742','#ad3c48','#32694d','#806022','#385f9c','#78528d','#236f7d','#687582','#6c7e89','#b74653','#387452','#886823','#456ba7','#855c9a','#2d7886','#79858e'];
function preset(id: string,name: string,mode: 'dark'|'light',base: string,bg: string,text: string,muted: string,accent: string): AppearanceTheme {
  return {id,name,mode,app:{background:bg,raised:mode==='dark'?'#27313d':'#ffffff',text,muted,accent,border:mode==='dark'?'#344352':'#c8d2db'},terminal:{background:base,foreground:text,cursor:accent,selectionBackground:mode==='dark'?'#435c75':'#c9daeb',...Object.fromEntries(ansiKeys.map((k,i)=>[k,(mode==='dark'?darkAnsi:lightAnsi)[i]]))} as AppearanceTheme['terminal'],fontFamily:'"Cascadia Mono", "Cascadia Code", Consolas, monospace',fontSize:14,lineHeight:1.25,letterSpacing:0,padding:20,cursorStyle:'bar',cursorBlink:false,background:{type:'solid',image:'',from:base,to:base,angle:135,opacity:1,blur:0,intensity:.35,animated:false,speed:30}};
}
const harbor=preset('harbor','Harbor','dark','#141e29','#1c2835','#e0e8ef','#a7b6c4','#93b8dd');
const porcelain=preset('porcelain','Porcelain','light','#f7f9fc','#eaf0f5','#243441','#526978','#356d9b');
const carbon=preset('carbon','Carbon','dark','#25211f','#302b27','#eee4d6','#bcad9c','#d9b687');
carbon.app.raised='#3b332d'; carbon.app.border='#50473e'; carbon.terminal.selectionBackground='#635044';
const landscape=preset('landscape','Tideland','dark','#152b33','#20343c','#e4f0ee','#adc4c7','#94c6c1');
landscape.background={...landscape.background,type:'wallpaper',image:'/wallpapers/tideland.svg',opacity:.8,intensity:.6};
const frost=preset('frost','Frost','dark','#18232e','#24323e','#e7eff5','#b3c4d2','#b6cfde');
frost.background={...frost.background,type:'gradient',from:'#2b465c',to:'#65747d',opacity:.8,blur:18,intensity:.5};
export const builtInThemes=[harbor,porcelain,carbon,landscape,frost];
export function migrateAppearance(settings: Settings): AppearanceStore {
  if (settings.appearance?.version===1) return settings.appearance;
  const light=settings.theme==='light'||settings.theme==='system'&&matchMedia('(prefers-color-scheme: light)').matches;
  const id=light?'porcelain':'harbor';
  return {version:1,global:{appTheme:id,terminalTheme:id,custom:{...structuredClone(light?porcelain:harbor),fontSize:settings.fontSize}},workspaces:{},sessions:{},themes:[],followSystem:settings.theme==='system'};
}
export function resolveAppearance(store: AppearanceStore, session?: Pick<Session,'key'|'workspaceId'>) {
  const automatic=matchMedia('(prefers-color-scheme: light)').matches?porcelain:harbor;
  const global=store.followSystem?{appTheme:automatic.id,terminalTheme:automatic.id,custom:{...automatic,fontSize:store.global.custom?.fontSize||automatic.fontSize}}:store.global;
  const choice=session&&store.sessions[session.key] || session?.workspaceId&&store.workspaces[session.workspaceId] || global;
  const all=[...builtInThemes,...store.themes];
  const terminal=choice.custom || all.find(t=>t.id===choice.terminalTheme) || harbor;
  const app=choice.appCustom || all.find(t=>t.id===choice.appTheme) || harbor;
  return {choice,terminal,app:choice.appCustom || (choice.custom&&choice.appTheme===choice.terminalTheme?choice.custom:app)};
}
const color=/^#[0-9a-f]{6}$/i;
const imagePattern=/^(?:|\/wallpapers\/tideland\.svg|data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+)$/;
export function validateTheme(value: unknown): AppearanceTheme {
  if (!value || typeof value!=='object' || Array.isArray(value)) throw Error('Choose a Relay theme JSON file.');
  const t=value as AppearanceTheme;
  if(typeof t.id!=='string'||!/^[-a-z0-9]{1,80}$/i.test(t.id)||typeof t.name!=='string'||!t.name.trim()||t.name.length>60||!['dark','light'].includes(t.mode)) throw Error('Theme identity is invalid.');
  for(const k of ['background','raised','text','muted','accent','border'] as const) if(!color.test(t.app?.[k])) throw Error(`Invalid application colour: ${k}`);
  for(const k of ['background','foreground','cursor','selectionBackground',...ansiKeys] as const) if(!color.test(t.terminal?.[k])) throw Error(`Invalid terminal colour: ${k}`);
  const number=(v:number,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
  if(typeof t.fontFamily!=='string'||t.fontFamily.length>200||/[;{}<>]/.test(t.fontFamily)||!number(t.fontSize,10,32)||!number(t.lineHeight,1,2)||!number(t.letterSpacing,-1,4)||!number(t.padding,4,48)||!['bar','block','underline'].includes(t.cursorStyle)||typeof t.cursorBlink!=='boolean') throw Error('Typography or cursor settings are invalid.');
  const b=t.background;
  if(!b||!['solid','gradient','wallpaper','ambient'].includes(b.type)||typeof b.image!=='string'||b.image.length>5600000||!imagePattern.test(b.image)||!color.test(b.from)||!color.test(b.to)||!number(b.opacity,.35,1)||!number(b.intensity,0,1)||!number(b.blur,0,40)||!number(b.angle,0,360)||!number(b.speed,10,120)||typeof b.animated!=='boolean') throw Error('Background settings are invalid. Use a local PNG, JPEG or WebP under 4 MB.');
  if (b.positionX !== undefined && !number(b.positionX,0,100) || b.positionY !== undefined && !number(b.positionY,0,100)) throw Error('Wallpaper position must be between 0 and 100.');
  return {id:t.id,name:t.name,mode:t.mode,app:Object.fromEntries(['background','raised','text','muted','accent','border'].map(k=>[k,t.app[k as keyof AppColors]])) as AppColors,
    terminal:Object.fromEntries(['background','foreground','cursor','selectionBackground',...ansiKeys].map(k=>[k,t.terminal[k as keyof AppearanceTheme['terminal']]])) as AppearanceTheme['terminal'],
    fontFamily:t.fontFamily,fontSize:t.fontSize,lineHeight:t.lineHeight,letterSpacing:t.letterSpacing,padding:t.padding,cursorStyle:t.cursorStyle,cursorBlink:t.cursorBlink,
    background:{type:b.type,image:b.image,from:b.from,to:b.to,angle:b.angle,opacity:b.opacity,blur:b.blur,intensity:b.intensity,animated:b.animated,speed:b.speed,...(b.positionX===undefined?{}:{positionX:b.positionX}),...(b.positionY===undefined?{}:{positionY:b.positionY})}};
}
export function importTheme(text: string) {
  if(text.length>6000000) throw Error('Theme exceeds 6 MB.');
  const value=JSON.parse(text);
  if(value?.format!=='relay-theme'||value.version!==1) throw Error('Unsupported theme format or version.');
  return {...validateTheme(value.theme),id:`custom-${crypto.randomUUID()}`};
}
export const exportTheme=(theme: AppearanceTheme)=>JSON.stringify({format:'relay-theme',version:1,theme:validateTheme(theme)},null,2);
