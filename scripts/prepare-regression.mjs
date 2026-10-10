import fs from 'node:fs';
const original = fs.readFileSync('scripts/gui-test.mjs', 'utf8');
fs.writeFileSync('scripts/gui-regression-v2.mjs', original.replaceAll('artifacts/test-profile', 'artifacts/v2-regression-profile').replaceAll('artifacts/gui-test-results.json', 'artifacts/v2-regression-results.json'));
fs.writeFileSync('scripts/gui-release-regression-v2.mjs', original.replaceAll('artifacts/test-profile', 'artifacts/v2-final-regression-profile').replaceAll('artifacts/gui-test-results.json', 'artifacts/v2-regression-results.json'));
