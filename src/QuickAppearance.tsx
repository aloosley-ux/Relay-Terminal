import { useEffect, useState } from 'react';
import { Check, Palette, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { builtInThemes, resolveAppearance, type AppearanceChoice, type AppearanceStore } from './appearance';
import type { Session } from './types';

type Props={
  store:AppearanceStore;
  session:Session;
  update:(store:AppearanceStore)=>void;
  preview:(store:AppearanceStore|undefined)=>void;
  openStudio:()=>void;
  close:()=>void;
  position:{x:number;y:number};
  initialScope?:'session'|'workspace';
};

export default function QuickAppearance({store,session,update,preview,openStudio,close,position,initialScope}:Props){
  const [scope,setScope]=useState<'session'|'workspace'>(()=>initialScope||'session');
  const initial=()=>scope==='session'
    ?resolveAppearance(store,session).choice
    :resolveAppearance({...store,sessions:{}},session).choice;
  const [choice,setChoice]=useState<AppearanceChoice>(()=>structuredClone(initial()));
  const all=[...builtInThemes,...store.themes];
  const resolved=resolveAppearance({...store,global:choice,followSystem:false},undefined);
  const bg=resolved.terminal.background;
  const scoped=(base:AppearanceStore,c:AppearanceChoice)=>scope==='session'
    ?{...base,sessions:{...base.sessions,[session.key]:c}}
    :{...base,workspaces:{...base.workspaces,[session.workspaceId||session.key]:c}};

  useEffect(()=>{
    preview(scoped(store,choice));
    return()=>preview(undefined);
  },[choice,scope,store]);

  const inherit=()=>{
    const next={...store,sessions:{...store.sessions},workspaces:{...store.workspaces}};
    if(scope==='session')delete next.sessions[session.key];
    else if(session.workspaceId)delete next.workspaces[session.workspaceId];
    update(next);
    setChoice(structuredClone(resolveAppearance(scope==='workspace'?{...next,sessions:{}}:next,session).choice));
  };

  const changeScope=(next:'session'|'workspace')=>{
    setScope(next);
    setChoice(structuredClone(next==='session'
      ?store.sessions[session.key]||resolveAppearance({...store,sessions:{}},session).choice
      :session.workspaceId?store.workspaces[session.workspaceId]||resolveAppearance({...store,sessions:{}},session).choice:choice));
  };
  const top=Math.min(position.y,innerHeight-400);
  const left=Math.max(8,Math.min(position.x,innerWidth-336));

  return <div role="dialog" aria-label={`Quick appearance for ${session.name}`} className="quick-appearance" style={{left,top}}>
    <header><div><Palette size={15}/><strong>Quick appearance</strong></div><button aria-label="Close quick appearance" onClick={close}><X size={15}/></button></header>
    <div className="quick-target"><span>Target</span><strong>{session.name}</strong><small>{session.workspaceId?`Workspace · ${session.workspaceId}`:'No pinned workspace'}</small></div>
    <label className="quick-field">Apply to<select aria-label="Appearance target" value={scope} onChange={e=>changeScope(e.target.value as 'session'|'workspace')}>
      <option value="session">This session</option>{session.workspaceId&&<option value="workspace">This workspace</option>}
    </select></label>
    <div className="quick-inheritance"><span>{scope==='session'&&store.sessions[session.key]||scope==='workspace'&&session.workspaceId&&store.workspaces[session.workspaceId]?'Override':'Inherited'}</span><button onClick={inherit}><RotateCcw size={12}/>Use inherited</button></div>
    {scope==='workspace'&&store.sessions[session.key]&&<p className="quick-note">This session's override remains active; workspace edits apply to inheriting sessions.</p>}
    <label className="quick-field">Application chrome<select aria-label="Quick application theme" value={choice.appTheme} onChange={e=>setChoice(c=>({...c,appTheme:e.target.value,appCustom:undefined}))}>{all.map(t=><option value={t.id} key={t.id}>{t.name}</option>)}</select></label>
    <label className="quick-field">Terminal scheme<select aria-label="Quick terminal theme" value={choice.terminalTheme} onChange={e=>setChoice(c=>({...c,terminalTheme:e.target.value,custom:undefined}))}>{all.map(t=><option value={t.id} key={t.id}>{t.name}</option>)}</select></label>
    <label className="quick-field">Background<select aria-label="Quick terminal background" value={bg.type} onChange={e=>setChoice(c=>({...c,custom:{...resolved.terminal,background:{...resolved.terminal.background,type:e.target.value as typeof bg.type}}}))}><option value="solid">Solid</option><option value="gradient">Gradient</option><option value="wallpaper">Wallpaper</option><option value="ambient">Ambient</option></select></label>
    {bg.type!=='solid'&&<label className="quick-range"><span>Surface opacity <output>{Math.round(bg.opacity*100)}%</output></span><input aria-label="Quick surface opacity" type="range" min=".35" max="1" step=".01" value={bg.opacity} onChange={e=>setChoice(c=>({...c,custom:{...resolved.terminal,background:{...resolved.terminal.background,opacity:Number(e.target.value)}}}))}/></label>}
    <button className="quick-studio" onClick={()=>{preview(undefined);close();openStudio();}}><SlidersHorizontal size={14}/>Open full Appearance Studio</button>
    <footer><span>Live preview · unsaved</span><button className="quick-reset" onClick={()=>setChoice(structuredClone(initial()))}><RotateCcw size={13}/>Reset</button><button className="quick-apply" onClick={()=>{update(scoped(store,choice));close();}}><Check size={13}/>Apply</button></footer>
  </div>;
}
