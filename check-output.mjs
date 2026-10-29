import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('./dist/index.html', import.meta.url), 'utf8');
let failures = 0;
for (const id of ['no-style', 'spread-string', 'spread-object', 'explicit']) {
  const tag = html.match(new RegExp(`<div id="${id}"[^>]*>`))?.[0];
  assert.ok(tag, `Missing box: ${id}`);
  const styles = Array.from(tag.matchAll(/\sstyle="([^"]*)"/g), match => match[1]);
  const merged = styles.length === 1 && styles[0].includes('--colour:');
  console.log(JSON.stringify({ id, styles, merged, tag }));
  if (id === 'no-style' || id === 'explicit') assert.ok(merged, `${id}: control must define --colour`);
  else if (!merged) failures++;
}
if (failures) {
  console.error(`Reproduced: ${failures} boxes have conflicting style attributes instead of one merged style.`);
  process.exitCode = 1;
}
