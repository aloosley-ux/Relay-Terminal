import fs from 'node:fs/promises';
import path from 'node:path';
const project=path.resolve('.');
const target=path.resolve('artifacts/test-profile/settings.json');
if(!target.startsWith(project+path.sep)) throw new Error('Test profile must be inside the project');
await fs.rename(target,target+'.previous-test').catch(e=>{if(e.code!=='ENOENT')throw e});
console.log('Isolated test settings reset; previous test preserved.');
