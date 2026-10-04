(() => {
  'use strict';
  const { curriculum: levels, progress } = window.STUDY;
  const stages = [
    ['测量基本功', '先把表用对、元件认清、读数说准'],
    ['六大电路', '按开机、供电、时钟、复位、固件与接口建立诊断框架'],
    ['焊接基本功', '先在练习板上掌握拆焊、补焊与更换元件'],
    ['进阶能力', '把图纸、测试点与经验沉淀成独立能力'],
    ['维修实践', '按故障由简到难，用证据完成诊断与维修闭环']
  ];
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = id => document.getElementById(id);
  const docLink = (id, label) => `<a href="knowledge.html?doc=${encodeURIComponent(id)}">${esc(label)}</a>`;
  const accepted = new Set(progress.acceptedLevels.map(entry => entry.id));
  const current = levels.find(level => level.id === progress.currentLevel);
  const percentage = Math.round(accepted.size / levels.length * 100);

  $('heroProgress').style.width = percentage + '%';
  $('heroPercent').textContent = percentage + '%';
  $('heroCurrent').textContent = `当前：第 ${current.id} 关 · ${current.title} · 待验收`;
  document.querySelector('.summary-number').textContent = `${accepted.size} / ${levels.length}`;
  document.querySelector('.summary-track span').style.width = percentage + '%';
  document.querySelector('.utility .status').lastChild.textContent = ` 第 ${current.id} 关待验收`;
  document.querySelector('#lesson .section-head h2').textContent = `第 ${current.id} 关 · ${current.title}`;
  document.querySelector('#lesson .section-head p').textContent = '状态：待独立验收';
  document.querySelector('.footer-row code').textContent = `更新 ${progress.updated} · 独立修复 ${progress.independentRepairs.length}/${progress.repairGoal}`;

  $('stageList').innerHTML = stages.map(([name, subtitle], index) => {
    const members = levels.filter(level => level.stage === index + 1);
    return `<article class="stage"><div class="stage-head"><div><h3>第${['一', '二', '三', '四', '五'][index]}阶段 · ${name}</h3><p>${subtitle}</p></div><span class="stage-count">${members[0].id}—${members.at(-1).id} 关</span></div><div class="level-grid">${members.map(level => {
      const done = accepted.has(level.id);
      const active = level.id === current.id;
      return `<button class="level-card${done ? ' done' : active ? ' current' : ''}" type="button" data-level="${level.id}"><span class="level-no">第 ${level.id} 关</span><span class="level-state">${done ? '已验收' : active ? '待验收' : ''}</span><h4>${esc(level.title)}</h4><p>${esc(level.sub)}</p></button>`;
    }).join('')}</div></article>`;
  }).join('');

  const baseline = progress.baseline;
  const task = progress.resume;
  $('resumeContent').innerHTML = `<div class="resume-intro"><h3>${esc(task.title)}</h3><p>${esc(task.intro)}</p></div><div class="measurement-wrap"><table class="measurement-table"><caption>${esc(baseline.board)} · ${esc(baseline.model)} · 已记录的事实</caption><thead><tr><th>测点 / 现象</th><th>状态</th><th>原始结果</th></tr></thead><tbody>${baseline.measurements.map(row => `<tr><td>${esc(row.point)}</td><td>${esc(row.state)}</td><td>${esc(row.value)}</td></tr>`).join('')}</tbody></table></div><p class="source-line">${esc(baseline.voltageMethod)} · ${docLink(baseline.record, '完整测量记录与照片')}</p><div class="question-list">${task.questions.map((question, i) => `<details class="question"${i === 0 ? ' open' : ''}><summary>${esc(question.title)}</summary><p>${esc(question.question)}</p></details>`).join('')}</div><p class="task-next"><strong>接下来</strong>${esc(task.next)}</p><details class="preparation"><summary>下一次实操准备清单</summary><dl><dt>必须</dt><dd>${esc(task.preparation.required)}</dd><dt>可选</dt><dd>${esc(task.preparation.optional)}</dd><dt>后续需要</dt><dd>${esc(task.preparation.later)}</dd></dl><p class="stop-condition">${esc(task.stop)}</p></details>`;

  $('evidenceLedger').innerHTML = `<div class="evidence-heading"><h3>已经做过的，不清零</h3><span>实操证据 ≠ 课程通关</span></div>${progress.evidence.map(item => `<article class="evidence-row"><div><time>${esc(item.date)}</time><span class="evidence-status">${esc(item.status)}</span></div><h4>${docLink(item.doc, item.title)}</h4><p>${esc(item.detail)}</p></article>`).join('')}<div class="repair-counter"><strong>独立维修 ${progress.independentRepairs.length} / ${progress.repairGoal} 块</strong><span>正常板点亮、建档和跟做不算独立修复。</span></div>`;
  const completed = document.querySelector('.ledger-empty');
  if (progress.acceptedLevels.length) {
    completed.innerHTML = progress.acceptedLevels.map(item => `<article class="evidence-row"><time>${esc(item.date)}</time><h4>第 ${item.id} 关 · ${esc(levels[item.id - 1].title)}</h4><p>${esc(item.review)}</p>${docLink(item.doc, '查看验收证据')}</article>`).join('');
  } else {
    completed.innerHTML = '<strong>课程独立验收尚未记入</strong><p>已有实测保留在上方。先补理解验收，通过后由教练记录日期、证据和复盘，不需要重做整套测量。</p>';
  }
  document.querySelector('.ledger-note').textContent = '先做、再解释、再独立验收。进度与记录保存在仓库，可跨设备查阅。';

  $('chapterGrid').innerHTML = progress.chapters.map(chapter => {
    const verified = chapter.verified === true;
    const status = verified ? '已核定' : chapter.evidence ? '有实测 · 待理解核定' : '待学习与核定';
    return `<div class="chapter" role="listitem"><span class="chapter-name">第 ${chapter.id} 章 · ${esc(chapter.title)}</span><span class="chapter-track"><span class="chapter-fill" style="width:${verified ? 100 : 0}%"></span></span><span class="chapter-percent">${verified ? '完成' : '待核定'}</span><small class="chapter-note">书内 ${chapter.pages.join('—')} 页 / PDF ${chapter.pages.map(p => p + 16).join('—')} 页 · ${status}${chapter.evidence ? ' · ' + docLink(chapter.evidence, '查证据') : ''}</small></div>`;
  }).join('');
  $('bookCount').textContent = `已核定 ${progress.chapters.filter(c => c.verified).length}/13 章`;

  if (current.id !== 1) {
    document.querySelector('.lesson-head h3').textContent = current.title;
    document.querySelector('.lesson-head p').textContent = current.sub;
    document.querySelector('.lesson-head .tag').textContent = '待独立验收';
    document.querySelector('.lesson-blocks').innerHTML = `<div class="lesson-block"><h4>目标说明</h4><p>${esc(current.goal)}</p></div><div class="lesson-block"><h4>动手步骤</h4><ol>${current.steps.map(step => `<li>${esc(step)}</li>`).join('')}</ol></div><div class="lesson-block"><h4>验收标准</h4><p>${esc(current.pass)}</p></div><div class="lesson-block"><h4>复盘要点</h4><p>${esc(current.review)}</p></div>`;
    document.querySelector('.lesson-resources').hidden = true;
  }

  const levelDialog = $('levelDialog');
  $('stageList').addEventListener('click', event => {
    const button = event.target.closest('[data-level]');
    if (!button) return;
    const level = levels.find(item => item.id === Number(button.dataset.level));
    $('modalCode').textContent = `第 ${level.id} 关 · ${stages[level.stage - 1][0]}`;
    $('modalTitle').textContent = level.title;
    $('modalIntro').textContent = level.sub;
    $('modalGoal').textContent = level.goal;
    $('modalSteps').innerHTML = level.steps.map(step => `<li>${esc(step)}</li>`).join('');
    $('modalPass').textContent = level.pass;
    $('modalReview').textContent = level.review;
    const archives = { 16: 'md-002', 17: 'md-004', 18: 'md-003', 19: 'md-001' };
    $('modalArchive').innerHTML = archives[level.id] ? `<a href="boards.html#board-${archives[level.id]}">查看主板档案 →</a>` : level.id === 1 ? docLink(baseline.record, '查看已完成的基准测量') : '';
    levelDialog.showModal();
  });
  $('closeModal').addEventListener('click', () => levelDialog.close());
  levelDialog.addEventListener('click', event => { if (event.target === levelDialog) levelDialog.close(); });
  $('pptPreviewToggle').addEventListener('click', () => {
    const panel = $('pptPreview');
    panel.hidden = !panel.hidden;
    $('pptPreviewToggle').setAttribute('aria-expanded', String(!panel.hidden));
    $('pptPreviewToggle').querySelector('.resource-copy span').textContent = panel.hidden ? '在线预览 · 万用表上手' : '收起预览 · 万用表上手';
    const iframe = panel.querySelector('iframe');
    if (!panel.hidden && !iframe.hasAttribute('src') && /^https?:$/.test(location.protocol)) {
      iframe.src = 'https://view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent(new URL(iframe.dataset.ppt, location.href).href);
    }
  });

  const toggle = $('menuToggle');
  function setMenu(open) {
    $('sideMenu').classList.toggle('open', open);
    $('drawerBackdrop').classList.toggle('open', open);
    document.body.classList.toggle('drawer-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('span').textContent = open ? '关闭' : '打开';
  }
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $('drawerBackdrop').addEventListener('click', () => setMenu(false));
  $('sideMenu').addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', () => { if (innerWidth > 900) setMenu(false); });

  const mediaDialog = $('mediaDialog');
  document.addEventListener('click', event => {
    const button = event.target.closest('.media-open');
    if (!button) return;
    $('mediaFull').src = button.dataset.full;
    $('mediaFull').alt = button.querySelector('img')?.alt || '';
    $('mediaCaption').textContent = button.dataset.caption || '';
    mediaDialog.showModal();
  });
  $('closeMedia').addEventListener('click', () => mediaDialog.close());
  mediaDialog.addEventListener('click', event => { if (event.target === mediaDialog) mediaDialog.close(); });
})();
