import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { renderHome } from '../lib/site.mjs';

test('the header preserves the full accessible name and a responsive WOPD mark', async () => {
  const snapshot = JSON.parse(await fs.readFile('public-data/wop-publication-snapshot-v2/snapshot.json', 'utf8'));
  const html = renderHome(snapshot);
  const header = html.match(/<header class="site-header">[\s\S]*?<\/header>/)?.[0];
  assert.ok(header);
  assert.match(header, /aria-label="Wiki of Open Polymer Data home"/);
  assert.equal((header.match(/class="wordmark__plate"/g) || []).length, 4);
  assert.equal((header.match(/class="wordmark__initial"/g) || []).length, 5);
  assert.doesNotMatch(header, /Open polymer reference/);

  const style = await fs.readFile('site-assets/site.css', 'utf8');
  assert.match(style, /@media \(max-width: 420px\)\s*\{[\s\S]*?\.site-header__inner\s*\{[^}]*flex-wrap:\s*wrap/);
  assert.match(style, /@media \(max-width: 420px\)\s*\{[\s\S]*?\.wordmark\s*\{[^}]*width:\s*100%/);
  assert.doesNotMatch(style, /\.wordmark\s*>\s*span:not\(\.wordmark__mark\)\s*\{[^}]*display:\s*none/);
});
