import fs from 'node:fs/promises';
import ts from 'typescript';
import assert from 'node:assert/strict';
const source=await fs.readFile('src/appearance.ts','utf8');
const js=ts.transpile(source,{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022});
const api=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const {builtInThemes,validateTheme,importTheme,exportTheme,resolveAppearance,migrateAppearance}=api;
globalThis.matchMedia=()=>({matches:false});
for(const t of builtInThemes){assert.deepEqual(validateTheme(t),t);const imported=importTheme(exportTheme(t));assert.equal(imported.name,t.name);assert.deepEqual(imported.terminal,t.terminal);}
const legacy={theme:'light',fontSize:17};const store=migrateAppearance(legacy);assert.equal(resolveAppearance(store).terminal.fontSize,17);assert.equal(resolveAppearance(store).app.mode,'light');
store.workspaces.w={appTheme:'carbon',terminalTheme:'frost'};store.sessions.s={appTheme:'porcelain',terminalTheme:'landscape'};
assert.equal(resolveAppearance(store,{key:'s',workspaceId:'w'}).terminal.id,'landscape');assert.equal(resolveAppearance(store,{key:'other',workspaceId:'w'}).terminal.id,'frost');assert.equal(resolveAppearance(store).terminal.fontSize,17);
for(const patch of [{fontSize:NaN},{lineHeight:0},{cursorStyle:'evil'},{terminal:{...builtInThemes[0].terminal,red:'red;url(x)'}},{background:{...builtInThemes[0].background,image:'https://example.com/a.png'}},{background:{...builtInThemes[0].background,image:'data:image/svg+xml;base64,abcd'}},{background:{...builtInThemes[0].background,blur:1000}}])assert.throws(()=>validateTheme({...builtInThemes[0],...patch}));
assert.throws(()=>importTheme('{"format":"relay-theme","version":2}'));assert.throws(()=>importTheme('x'.repeat(6000001)));assert.throws(()=>importTheme('not json'));
await fs.mkdir('artifacts/appearance-tests',{recursive:true});await fs.writeFile('artifacts/appearance-tests/unit.json',JSON.stringify({pass:true,presets:5,checks:['preset roundtrip','legacy migration','scope precedence','CSS injection','remote URLs','SVG data URL','numeric bounds','version','size','invalid JSON']},null,2));
await fs.writeFile('artifacts/appearance-tests/exported-theme.json',exportTheme({...builtInThemes[2],name:'Imported Carbon'}));
if(process.argv.includes('--seed')){const profile=process.argv[process.argv.indexOf('--seed')+1];await fs.mkdir(profile,{recursive:true});await fs.writeFile(profile+'/settings.json',JSON.stringify({theme:'dark',fontSize:14,panelOpen:true,composerVisible:true,navigatorWidth:236,shell:'auto',loadProfiles:false,restoreTabs:false,appearance:{version:1,global:{appTheme:'harbor',terminalTheme:'harbor'},workspaces:{},sessions:{},themes:[]}},null,2));}
console.log('PASS Appearance schema, migration, scope precedence and invalid imports');
