const fs = require('node:fs');
const path = require('node:path');

const site = path.resolve(__dirname, '..');
if (!process.argv[2]) throw new Error('Usage: node scripts/import-project.cjs <local-project-directory>');
const root = path.resolve(process.argv[2]);
for (const dir of ['知识库', '学习笔记']) {
  if (!fs.existsSync(path.join(root, dir))) throw new Error(`Missing source folder: ${dir}`);
  fs.cpSync(path.join(root, dir), path.join(site, 'records', dir), { recursive: true });
}
const photoTarget = path.join(site, 'records/库存资料/主板');
fs.mkdirSync(photoTarget, { recursive: true });
for (const name of fs.readdirSync(path.join(root, '库存资料/主板'))) {
  if (/\.jpe?g$/i.test(name)) fs.copyFileSync(path.join(root, '库存资料/主板', name), path.join(photoTarget, name));
}
console.log('Imported knowledge, notes, annotated diagrams and original board photographs. Original source files unchanged.');
