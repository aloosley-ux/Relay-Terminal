import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const port = process.argv[2] || '9250';
const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
try {
  const page = browser.contexts().flatMap(context => context.pages()).find(candidate => candidate.url().includes('tauri.localhost'));
  assert(page, 'Installed Relay page was not found');
  page.setDefaultTimeout(15000);
  if (await page.locator('.statusbar[data-status="ready"]').count() === 0) {
    await page.getByRole('button', { name: 'Open a terminal', exact: true }).last().click();
  }
  await page.locator('.statusbar[data-status="ready"]').waitFor();
  await page.getByRole('button', { name: 'Actions', exact: true }).click();
  await page.getByRole('button', { name: 'Edit Upgrade retention marker', exact: true }).waitFor();
  console.log('PASS 4.0 settings action retained and loaded by installed 5.0 app');
} finally {
  await browser.close();
}
