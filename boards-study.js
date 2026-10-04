(() => {
  const { baseline } = window.STUDY.progress;
  const board = document.getElementById('board-md-006');
  const section = document.createElement('div');
  section.className = 'board-evidence';
  const title = document.createElement('h3');
  title.textContent = '接续实测记录 · 不清零';
  section.appendChild(title);
  const table = document.createElement('table');
  table.className = 'measurement-table';
  const head = table.createTHead().insertRow();
  for (const text of ['测点 / 现象', '状态', '原始结果']) {
    const th = document.createElement('th');
    th.textContent = text;
    head.appendChild(th);
  }
  const body = table.createTBody();
  for (const item of baseline.measurements) {
    const row = body.insertRow();
    for (const text of [item.point, item.state, item.value]) row.insertCell().textContent = text;
  }
  section.appendChild(table);
  const details = document.createElement('p');
  details.textContent = `${baseline.cpu} · ${baseline.memory} · ${baseline.psu}。重复冷启动和板载供电基准仍待补。`;
  section.appendChild(details);
  const link = document.createElement('a');
  link.href = 'knowledge.html?doc=h61-baseline';
  link.textContent = '查看完整实操过程、测点条件与标注图 →';
  section.appendChild(link);
  board.appendChild(section);
  board.dataset.search += ' i3-2120T PS_ON 5VSB Enermax 3.05 BIOS';
  const navigation = document.querySelector('.utility .crumb');
  if (navigation) {
    const knowledge = document.createElement('a');
    knowledge.href = 'knowledge.html';
    knowledge.textContent = '知识库';
    knowledge.style.marginLeft = '16px';
    navigation.appendChild(knowledge);
  }
})();
