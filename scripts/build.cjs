const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
function read(file) { return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')); }
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const ids = {
  '00-学习总览与进度.md': 'book-map', 'README.md': 'knowledge-guide',
  '00-学习台账.md': 'ledger', '04-错题与误判.md': 'mistakes',
  '001-5VSB与PS_ON.md': 'atx-signals', '001-H61正常基准.md': 'h61-baseline',
  '000-设备与练习板建档.md': 'equipment', '主板库存清单.md': 'inventory'
};
const documents = walk(path.join(root, 'records')).filter(file => file.endsWith('.md')).map(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file).replaceAll('\\', '/');
  const base = path.basename(file);
  const category = base === '000-模板.md' ? '模板' : relative.includes('学习笔记') ? '教材' : relative.includes('知识卡片') ? '知识卡' : relative.includes('实操记录') ? '实操' : relative.includes('故障案例') ? '案例' : base.includes('错题') ? '错题' : '总览';
  return { id: ids[base] || relative.replace(/^records\//, '').replace(/\.md$/, ''), title: content.match(/^# (.+)/m)?.[1] || base, category, file: relative, content };
});
const progress = read('data/progress.json');
const curriculum = read('data/curriculum.json');
const data = { progress, curriculum, documents };
fs.writeFileSync(path.join(root, 'data/study-data.js'), `window.STUDY = ${JSON.stringify(data)};\n`);
console.log(`Built ${curriculum.length} lessons, ${progress.chapters.length} chapters, ${documents.length} knowledge records.`);
