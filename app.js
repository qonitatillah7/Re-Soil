/* Shell aplikasi: navigasi, peran, router hash */
(function () {
  const U = RS.ui, { esc } = U, P = RS.pages;
  const ROLES = {
    admin: { label: 'Admin', allow: '*' },
    researcher: { label: 'Researcher', allow: ['command', 'map', 'sites', 'site', 'peatscan', 'priority', 'recommend', 'planner', 'batches', 'monitoring', 'detox', 'regen', 'alerts', 'reports', 'research', 'stakeholder', 'datamodel'] },
    ranger: { label: 'Field Ranger / Community', allow: ['command', 'map', 'sites', 'site', 'peatscan', 'monitoring', 'alerts', 'reports', 'portal'] },
    gov: { label: 'Government / Stakeholder', allow: ['command', 'map', 'sites', 'site', 'priority', 'monitoring', 'detox', 'regen', 'alerts', 'recommend', 'reports', 'stakeholder'] },
    public: { label: 'Public', allow: ['map', 'stakeholder', 'portal'] }
  };
  const NAV = [
    ['Ringkasan', [['command', 'Command Center', '◉'], ['map', 'Peta Kondisi Gambut', '⌖'], ['sites', 'Daftar Site', '▤']]],
    ['Assess · Prioritize', [['peatscan', 'PeatScan', '◈'], ['priority', 'Priority Index', '▲'], ['recommend', 'Rekomendasi Adaptif', '✦']]],
    ['Deploy', [['planner', 'Deployment Planner', '⬢'], ['batches', 'Batch Tracker', '▣']]],
    ['Monitor', [['monitoring', 'Monitoring Lingkungan', '≈'], ['detox', 'Detox Progress', '⚗'], ['regen', 'Regeneration Index', '❦'], ['alerts', 'Peringatan Dini', '⚠']]],
    ['Report · Evaluate', [['reports', 'Pelaporan', '✎'], ['portal', 'Portal Ranger / Edukasi', '☘'], ['research', 'Research Hub', '⚛'], ['stakeholder', 'Dashboard Stakeholder', '▥'], ['datamodel', 'Model Data', '⛁']]]
  ];
  const allowed = r => { const a = ROLES[RS.state.role].allow; return r === 'landing' || a === '*' || a.includes(r); };
  const parse = () => { const h = (location.hash || '#/landing').replace(/^#\/?/, ''), p = h.split('/'); return { name: p[0] || 'landing', args: p.slice(1) }; };
  const app = () => document.getElementById('app');
  let rendered = null;

  function nav(cur) {
    const act = RS.state.alerts.filter(a => a.status === 'Aktif').length;
    return NAV.map(([g, items]) => { const its = items.filter(i => allowed(i[0])); return its.length ? `<div class="navg">${g}</div>${its.map(i => `<a href="#/${i[0]}" class="${cur === i[0] || (cur === 'site' && i[0] === 'sites') ? 'on' : ''}"><span class="ico">${i[2]}</span>${i[1]}${i[0] === 'alerts' && act && RS.state.role !== 'public' ? `<span class="cnt">${act}</span>` : ''}</a>`).join('')}` : ''; }).join('');
  }
  function shell() {
    app().innerHTML = `<div class="shell"><aside class="side" id="side"><a class="brand" href="#/landing"><img src="assets/favicon.svg" alt="" width="38" height="38"><span><b>RE-SOIL</b><small>Digital Restoration Loop</small></span></a><nav class="nav" id="nav" aria-label="Navigasi utama"></nav><div class="sidefoot"><label for="role">Peran pengguna (demo)</label><select id="role">${Object.entries(ROLES).map(([k, v]) => `<option value="${k}" ${RS.state.role === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select><button class="btn" id="reset">Reset data demo</button></div></aside><div class="scrim" id="scrim"></div><div class="main"><div class="top"><button id="burger" aria-label="Buka menu">☰</button><b>RE-SOIL</b><span class="small" style="margin-left:auto;opacity:.8" id="ttl"></span></div><div class="view" id="view"></div></div></div>`;
    document.getElementById('role').onchange = e => { RS.state.role = e.target.value; RS.save(); const r = parse().name; if (!allowed(r)) location.hash = '#/' + (ROLES[RS.state.role].allow === '*' ? 'command' : ROLES[RS.state.role].allow[0]); else route(); };
    document.getElementById('reset').onclick = () => { const r = RS.state.role; RS.resetState(); RS.state.role = r; RS.save(); U.toast('Data demo direset'); route(); };
    const side = document.getElementById('side'), sc = document.getElementById('scrim'), tg = () => { side.classList.toggle('open'); sc.classList.toggle('on'); };
    document.getElementById('burger').onclick = tg; sc.onclick = tg;
    document.getElementById('nav').onclick = e => { if (e.target.closest('a')) { side.classList.remove('open'); sc.classList.remove('on'); } };
  }
  RS.refreshNav = () => { const n = document.getElementById('nav'); if (n) n.innerHTML = nav(parse().name); };

  function route() {
    const { name, args } = parse(), page = P[name];
    U.closeModal();
    if (name === 'landing' || !page) {
      if (name !== 'landing' && !page) { location.hash = '#/landing'; return; }
      rendered = 'landing'; app().innerHTML = P.landing.render(); document.title = 'RE-SOIL Digital Restoration Loop'; window.scrollTo && window.scrollTo(0, 0); return;
    }
    if (rendered !== 'shell') { shell(); rendered = 'shell'; }
    document.getElementById('nav').innerHTML = nav(name);
    document.getElementById('ttl').textContent = page.title || '';
    document.title = (page.title || 'RE-SOIL') + ' · RE-SOIL';
    const view = document.getElementById('view'), draw = () => {
      view.innerHTML = ''; const root = document.createElement('div'); view.appendChild(root);
      if (!allowed(name)) { root.innerHTML = U.empty('Akses dibatasi untuk peran ini', 'Halaman ini tidak tersedia untuk peran ' + ROLES[RS.state.role].label + '. Ganti peran di panel kiri (demo).', '<a class="btn sec sm" href="#/stakeholder">Ke Dashboard Stakeholder</a>'); return; }
      try { root.innerHTML = page.render(args); if (page.mount) page.mount(args, root); } catch (err) { console.error(err); root.innerHTML = U.empty('Terjadi kesalahan', 'Halaman gagal dimuat: ' + err.message); }
      window.scrollTo && window.scrollTo(0, 0);
    };
    if (RS.fast) draw(); else { view.innerHTML = U.skeleton(); setTimeout(() => { if (parse().name === name) draw(); }, 280); }
  }
  RS.route = route;
  document.addEventListener('click', e => { const a = e.target.closest('[data-anchor]'); if (a) { e.preventDefault(); const t = document.querySelector(a.getAttribute('href')); if (t && t.scrollIntoView) t.scrollIntoView({ behavior: 'smooth' }); } });
  window.addEventListener('hashchange', route);
  RS.start = () => { if (!location.hash) location.hash = '#/landing'; route(); };
  if (!window.__RS_TEST__) RS.start();
})();
