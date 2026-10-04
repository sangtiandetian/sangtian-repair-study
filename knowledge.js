(() => {
  'use strict';
  const { documents, progress } = window.STUDY;
  const $ = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const params = new URLSearchParams(location.search);
  let selected = params.get('doc') || 'h61-baseline';
  let category = '全部';
  $('knowledgeSearch').value = params.get('q') || '';
  const categories = ['全部', '实操', '知识卡', '教材', '总览', '错题', '模板'];
  $('categoryTabs').innerHTML = categories.map(label => `<button type="button" data-category="${label}" aria-pressed="${label === category}">${label}</button>`).join('');
  const rank = ['h61-baseline', 'atx-signals', 'ledger', 'book-map', 'equipment', 'inventory', 'mistakes', 'knowledge-guide'];
  const sorted = [...documents].sort((a, b) => {
    const ar = rank.indexOf(a.id), br = rank.indexOf(b.id);
    return (ar < 0 ? 99 : ar) - (br < 0 ? 99 : br);
  });
  const galleries = {
    'h61-baseline': [
      ['img/md006-bios.jpg', '进入 BIOS 的原始证据'],
      ['img/md006-assembly.jpg', '最小系统装配前 · 内存与供电尚未接入'],
      ['records/知识库/标注图/MD-006_01_内存供电电感1R2.png', '内存供电电感 1R2 · 后续测量前需再次确认测点'],
      ['img/md006-front1.jpg', 'MD-006 正面，供区域识别使用']
    ],
    'equipment': [['img/workbench-multimeter.jpg', '万用表与测试配件'], ['img/workbench-psu-board.jpg', 'MD-006 与 Enermax 电源']],
    'atx-signals': [['img/md006-bios.jpg', '本卡片源自 MD-006 正常基准实践']]
  };
  marked.use({ renderer: { html(token) { return esc(token.text); } } });

  function renderRecord() {
    const doc = documents.find(item => item.id === selected);
    if (!doc) {
      $('recordCategory').textContent = '没有匹配记录';
      $('recordDownload').hidden = true;
      $('recordSource').textContent = '';
      $('recordContent').innerHTML = '<p>换一个关键词或切回全部分类。</p>';
      $('recordMedia').hidden = true;
      return;
    }
    $('recordCategory').textContent = `${doc.category} · 资料同步 ${progress.updated}`;
    $('recordSource').textContent = doc.file.replace(/^records\//, '');
    $('recordDownload').href = doc.file;
    $('recordDownload').hidden = false;
    $('recordContent').innerHTML = marked.parse(doc.content);
    const base = new URL(doc.file, location.href);
    $('recordContent').querySelectorAll('a, img').forEach(element => {
      const attribute = element.tagName === 'IMG' ? 'src' : 'href';
      const original = element.getAttribute(attribute);
      if (!original) return;
      const url = new URL(original.replaceAll('\\', '/'), base);
      if (!['http:', 'https:', 'file:', 'mailto:'].includes(url.protocol)) {
        element.removeAttribute(attribute);
        return;
      }
      if (decodeURIComponent(url.pathname).endsWith('/VID_20260426_211855.mp4')) {
        element.setAttribute(attribute, 'media/md007.mp4');
        element.textContent = 'MD-007 视频节选（25 秒；完整原始视频保留在本地）';
        return;
      }
      element.setAttribute(attribute, url.href);
      const linkedDoc = documents.find(item => new URL(item.file, location.href).href === url.href.split('#')[0]);
      if (linkedDoc) {
        element.setAttribute(attribute, `knowledge.html?doc=${encodeURIComponent(linkedDoc.id)}`);
        element.dataset.doc = linkedDoc.id;
      } else if (element.tagName === 'A' && url.origin !== location.origin) {
        element.target = '_blank';
        element.rel = 'noopener noreferrer';
      }
    });
    $('recordContent').querySelectorAll('table').forEach(table => {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-scroll';
      table.replaceWith(wrapper);
      wrapper.appendChild(table);
    });
    $('recordContent').querySelectorAll('code').forEach(code => {
      const text = code.textContent;
      if (/^(\.\.\/|\.\/).+\.(jpe?g|png)$/i.test(text)) {
        const anchor = document.createElement('a');
        anchor.href = new URL(text, base).href;
        anchor.textContent = text.split('/').at(-1);
        code.replaceWith(anchor);
      }
    });
    const gallery = galleries[doc.id];
    $('recordMedia').hidden = !gallery;
    if (gallery) {
      $('recordMedia').innerHTML = `<h2>实拍与标注证据</h2><div class="media-gallery">${gallery.map(([file, caption]) => `<figure class="media-shot"><button class="media-open" type="button" data-full="${esc(file)}" data-caption="${esc(caption)}"><img src="${esc(file)}" alt="${esc(caption)}" loading="lazy"></button><figcaption>${esc(caption)}</figcaption></figure>`).join('')}</div>`;
    }
  }

  function renderList() {
    const query = $('knowledgeSearch').value.trim().toLowerCase();
    const results = sorted.filter(doc => (category === '全部' || category === doc.category) && (!query || (doc.title + '\n' + doc.content).toLowerCase().includes(query)));
    if (!results.some(doc => doc.id === selected)) selected = results[0]?.id || '';
    $('knowledgeCount').textContent = `${results.length} / ${documents.length} 份记录 · 事实与结论分开保存`;
    $('recordList').innerHTML = results.length ? results.map(doc => `<button type="button" data-doc="${esc(doc.id)}" aria-current="${doc.id === selected}"><span>${esc(doc.category)}</span><strong>${esc(doc.title)}</strong></button>`).join('') : '<p class="empty-list">没有匹配记录</p>';
    renderRecord();
  }

  function selectDocument(id, updateUrl = true) {
    selected = id;
    if (updateUrl) {
      const url = new URL(location.href);
      url.search = '';
      url.searchParams.set('doc', id);
      history.pushState(null, '', url);
    }
    $('recordList').querySelectorAll('[data-doc]').forEach(button => button.setAttribute('aria-current', String(button.dataset.doc === id)));
    renderRecord();
  }
  $('knowledgeSearch').addEventListener('input', renderList);
  $('categoryTabs').addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    category = button.dataset.category;
    $('categoryTabs').querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    renderList();
  });
  $('recordList').addEventListener('click', event => {
    const button = event.target.closest('[data-doc]');
    if (button) selectDocument(button.dataset.doc);
  });
  $('recordContent').addEventListener('click', event => {
    const link = event.target.closest('[data-doc]');
    if (!link) return;
    event.preventDefault();
    category = '全部';
    $('knowledgeSearch').value = '';
    $('categoryTabs').querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.category === category)));
    selected = link.dataset.doc;
    renderList();
    selectDocument(selected);
  });
  window.addEventListener('popstate', () => {
    const params = new URLSearchParams(location.search);
    selected = params.get('doc') || 'h61-baseline';
    category = '全部';
    $('knowledgeSearch').value = params.get('q') || '';
    $('categoryTabs').querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.category === category)));
    renderList();
  });
  const dialog = $('mediaDialog');
  $('recordMedia').addEventListener('click', event => {
    const button = event.target.closest('.media-open');
    if (!button) return;
    $('mediaFull').src = button.dataset.full;
    $('mediaFull').alt = button.dataset.caption;
    $('mediaCaption').textContent = button.dataset.caption;
    dialog.showModal();
  });
  $('closeMedia').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  renderList();
})();
