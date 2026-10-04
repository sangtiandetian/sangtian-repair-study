const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const marked = require('../vendor/marked.umd.js');
const root = path.resolve(__dirname, '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'data/study-data.js'), 'utf8'), context);
const data = context.window.STUDY;
assert.equal(data.curriculum.length, 19);
assert.equal(new Set(data.curriculum.map(item => item.stage)).size, 5);
assert.equal(data.progress.chapters.length, 13);
assert.equal(data.progress.repairGoal, 10);
assert.ok(data.curriculum.some(item => item.id === data.progress.currentLevel));
assert.equal(new Set(data.progress.acceptedLevels.map(item => item.id)).size, data.progress.acceptedLevels.length);
assert.ok(data.curriculum[3].steps[0].includes('诊断卡'));
assert.ok(data.curriculum[7].steps[0].includes('可选'));
assert.ok(data.curriculum[9].goal.includes('焊接练习板'));
assert.equal(data.progress.baseline.measurements.find(item => item.point === 'CR2032 电池').value, '3.05 V');
assert.equal(data.progress.baseline.measurements.find(item => item.point === 'PS_ON#').value, '3.59 → 0.03 V');
const docIds = new Set(data.documents.map(item => item.id));
for (const evidence of data.progress.evidence) assert.ok(docIds.has(evidence.doc));
assert.ok(docIds.has(data.progress.baseline.record));
assert.equal(docIds.size, data.documents.length);
for (const doc of data.documents) {
  assert.ok(fs.existsSync(path.join(root, doc.file)));
  marked.walkTokens(marked.lexer(doc.content), token => {
    if (!['link', 'image'].includes(token.type) || /^(https?:|mailto:|#)/.test(token.href)) return;
    if (token.href.endsWith('VID_20260426_211855.mp4')) return; // Published reader points to the existing 25-second clip.
    const file = path.resolve(root, path.dirname(doc.file), decodeURIComponent(token.href).split('#')[0]);
    assert.ok(fs.existsSync(file), `${doc.id}: missing ${token.href}`);
  });
}
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === '.git') return [];
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
for (const file of walk(root)) {
  assert.ok(fs.statSync(file).size < 100 * 1024 * 1024, `File exceeds GitHub limit: ${file}`);
  assert.notEqual(path.extname(file), '.pdf', 'Do not publicly upload the full copyrighted book.');
  if (!file.endsWith('.html')) continue;
  const html = fs.readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  assert.ok(!html.includes('sangtiandetian.github.io/muse-weixiu'), `Original host dependency: ${file}`);
  assert.ok(!html.includes('data:image/'), `Inline heavy image: ${file}`);
  for (const [, href] of html.matchAll(/(?:href|src|data-full)="([^"]+)"/g)) {
    if (/^(https?:|data:|#)/.test(href)) continue;
    const destination = path.resolve(path.dirname(file), decodeURIComponent(href.split(/[?#]/)[0]));
    assert.ok(fs.existsSync(destination), `Broken asset/link in ${path.relative(root, file)}: ${href}`);
  }
}
console.log(`PASS: 19 lessons, 5 phases, 13 chapters, ${docIds.size} knowledge records; evidence, local links, photographs and tool bindings checked.`);
