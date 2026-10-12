import fs from 'node:fs/promises';
const files=['desktop-regression-results.json','desktop-acceptance-results.json','desktop-interaction-results.json'];
for(const file of files) {
  const data=JSON.parse(await fs.readFile('artifacts/'+file,'utf8'));
  const errors=data.errors||data.pageErrors||[];
  console.log(JSON.stringify({file,passed:data.results.filter(r=>r.pass).length,errors}));
  if(data.results.some(r=>!r.pass)||errors.length)throw new Error(file+' failed');
}
