(function () {
  var grid = document.getElementById('grid');
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.card'));
  var countEl = document.getElementById('count');
  var emptyEl = document.getElementById('empty');
  var state = { cat: '', year: '' };

  // 1) 최신순 정렬 (감상 완료일, 없으면 시작일 기준)
  cards.sort(function (a, b) { return b.dataset.date.localeCompare(a.dataset.date); });
  cards.forEach(function (c) { grid.appendChild(c); });

  // 2) 연도 메뉴 자동 생성
  var years = [];
  cards.forEach(function (c) { if (years.indexOf(c.dataset.year) < 0) years.push(c.dataset.year); });
  years.sort().reverse();
  var yearMenu = document.querySelector('[data-filter="year"] .dd-menu');
  years.forEach(function (y) {
    var li = document.createElement('li');
    li.innerHTML = '<button type="button" data-value="' + y + '">' + y + '</button>';
    yearMenu.appendChild(li);
  });

  var dropdowns = Array.prototype.slice.call(document.querySelectorAll('.dropdown'));

  function closeAll(except) {
    dropdowns.forEach(function (d) {
      if (d === except) return;
      d.classList.remove('open');
      d.querySelector('.dd-btn').setAttribute('aria-expanded', 'false');
    });
  }

  function render() {
    var shown = 0;
    cards.forEach(function (c) {
      var ok = (!state.cat || c.dataset.cat === state.cat) && (!state.year || c.dataset.year === state.year);
      c.hidden = !ok;
      if (ok) shown++;
    });
    countEl.textContent = shown + '개';
    emptyEl.hidden = shown > 0;

    dropdowns.forEach(function (d) {
      var key = d.dataset.filter, val = state[key];
      d.querySelector('.dd-value').textContent = val || '전체';
      d.classList.toggle('active', !!val);
      d.querySelectorAll('.dd-menu button').forEach(function (b) {
        b.setAttribute('aria-selected', b.dataset.value === val ? 'true' : 'false');
      });
    });

    var p = new URLSearchParams();
    if (state.cat) p.set('cat', state.cat);
    if (state.year) p.set('year', state.year);
    var q = p.toString() ? '?' + p.toString() : '';
    history.replaceState(null, '', location.pathname + q);
    try { sessionStorage.setItem('reviewFilter', q); } catch (e) {}
  }

  dropdowns.forEach(function (d) {
    var btn = d.querySelector('.dd-btn');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var willOpen = !d.classList.contains('open');
      closeAll(d);
      d.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
    d.querySelector('.dd-menu').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      state[d.dataset.filter] = b.dataset.value;
      closeAll();
      render();
    });
  });
  document.addEventListener('click', function () { closeAll(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

  // 3) URL 파라미터로 초기 상태 복원
  var params = new URLSearchParams(location.search);
  state.cat = params.get('cat') || '';
  state.year = params.get('year') || '';
  render();
})();
