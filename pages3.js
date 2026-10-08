/* Halaman 3: Monitoring, Detox, Regenerasi, Peringatan, Rekomendasi, Pelaporan */
(function () {
  const U = RS.ui, { esc, badge, kpi, table, empty } = U, C = RS.calc, D = RS.data, P = RS.pages, parts = RS.parts;
  const role = () => RS.state.role;
  const ROLE_NAME = { admin: 'Admin RE-SOIL', researcher: 'Peneliti', ranger: 'Ranger / Komunitas', gov: 'Pemangku kepentingan', public: 'Publik' };
  const canReview = () => ['admin', 'researcher', 'gov'].includes(role());
  const pick = (root, id, fn) => { const el = root.querySelector('#' + id); el.addEventListener('change', () => fn(el.value)); return el; };

  /* ===== Monitoring Lingkungan ===== */
  P.monitoring = {
    title: 'Monitoring Lingkungan',
    render() {
      return `<div class="pagehead"><div><div class="eyebrow">MONITOR</div><h1>Monitoring Lingkungan</h1><p>Kelembapan, muka air, hujan, suhu, pH, vegetasi, dan risiko kebakaran selama 12 bulan terakhir.</p></div><label class="f" style="min-width:260px">Site${U.siteSelect('ms', 'S01')}</label></div><div id="body"></div>`;
    },
    mount(a, root) { const draw = id => { const s = D.sites.find(x => x.id === id); root.querySelector('#body').innerHTML = parts.envBadges(s) + '<div class="mt"></div>' + parts.envCharts(s); }; pick(root, 'ms', draw); draw('S01'); }
  };

  /* ===== Detox Progress ===== */
  P.detox = {
    title: 'Detox Progress',
    render() {
      return `<div class="pagehead"><div><div class="eyebrow">MONITOR · ${U.labTag}</div><h1>Detox Progress</h1><p>Fenantren sebagai PAH model utama; pirena opsional. Seluruh konsentrasi PAH pada halaman ini adalah data laboratorium.</p></div><label class="f" style="min-width:260px">Site${U.siteSelect('ds', 'S01')}</label></div>
      <div class="row mb"><label class="chip"><input type="checkbox" id="pyr"> Tampilkan pirena (opsional)</label></div><div id="body"></div>
      <div class="card mt"><h3>Status seluruh site ${U.labTag}</h3>${table([['Site', r => esc(r.name)], ['Minggu lab', r => r.lab ? r.lab.weeks : '—'], ['Reduksi fenantren', r => r.pah ? C.reduction(r) + '%' : '—'], ['Status', r => r.pah ? badge(C.detoxStatus(r)) : badge('Belum ada data', 'neutral')]], D.sites)}<p class="small muted mt">Aturan demo: ≥ minggu 8 &amp; reduksi ≥ 60% → Transition Candidate; ≥ minggu 8 &amp; reduksi &lt; 35% → Further Remediation Required; selain itu Detox in Progress.</p></div>`;
    },
    mount(a, root) {
      const draw = () => { const s = D.sites.find(x => x.id === root.querySelector('#ds').value); root.querySelector('#body').innerHTML = parts.detoxPanel(s, root.querySelector('#pyr').checked); };
      root.querySelector('#ds').onchange = draw; root.querySelector('#pyr').onchange = draw; draw();
    }
  };

  /* ===== Regeneration Index ===== */
  P.regen = {
    title: 'Regeneration Index',
    render() {
      return `<div class="pagehead"><div><div class="eyebrow">MONITOR</div><h1>Regeneration Index</h1><p>Skor 0–100 dari perkecambahan, survival, tinggi bibit, tutupan vegetasi, dan mortalitas.</p></div><label class="f" style="min-width:260px">Site${U.siteSelect('rs', 'S04')}</label></div><div id="body"></div>
      <div class="card mt"><h3>Perbandingan site</h3>${table([['Site', r => esc(r.name)], ['Fase', r => badge(r.phase)], ['Skor', r => r.germ ? `<b>${C.regenScore(r.germ, r.veg)}</b>` : '—'], ['Kategori', r => r.germ ? badge(C.regenCat(C.regenScore(r.germ, r.veg))) : badge('Belum ada data', 'neutral')]], D.sites)}</div>`;
    },
    mount(a, root) { const draw = id => { root.querySelector('#body').innerHTML = parts.regenPanel(D.sites.find(x => x.id === id)); }; pick(root, 'rs', draw); draw('S04'); }
  };

  /* ===== Risk Alerts ===== */
  P.alerts = {
    title: 'Risk Alert & Early Warning',
    render() {
      return `<div class="pagehead"><div><div class="eyebrow">MONITOR · EARLY WARNING</div><h1>Risk Alert & Early Warning</h1><p>Setiap peringatan memuat tingkat keparahan, alasan, rekomendasi, waktu, dan status.</p></div></div>
      <div class="toolbar"><input type="search" id="q" placeholder="Cari jenis / site…" aria-label="Cari peringatan"><select id="fv"><option value="">Semua tingkat</option><option>Kritis</option><option>Tinggi</option><option>Sedang</option><option>Rendah</option></select><select id="fs"><option value="">Semua status</option><option>Aktif</option><option>Ditinjau</option><option>Selesai</option></select></div><div id="list"></div>`;
    },
    mount(a, root) {
      const draw = () => {
        const q = root.querySelector('#q').value.toLowerCase(), fv = root.querySelector('#fv').value, fs = root.querySelector('#fs').value;
        const rows = RS.state.alerts.filter(x => (!q || (x.type + U.siteName(x.site)).toLowerCase().includes(q)) && (!fv || x.severity === fv) && (!fs || x.status === fs));
        root.querySelector('#list').innerHTML = rows.length ? `<div class="grid g2">${rows.map(x => `<div class="card alert sev-${x.severity}"><div class="row between"><b>${esc(x.type)}</b><span>${badge(x.severity)} ${badge(x.status)}</span></div><div class="small muted">${esc(U.siteName(x.site))} · ${esc(x.ts)}</div><p class="small mt"><b>Alasan:</b> ${esc(x.reason)}</p><p class="small"><b>Rekomendasi:</b> ${esc(x.reco)}</p>${canReview() && x.status !== 'Selesai' ? `<div class="row">${x.status === 'Aktif' ? `<button class="btn sec sm" data-a="${x.id}" data-to="Ditinjau">Tandai ditinjau</button>` : ''}<button class="btn sm" data-a="${x.id}" data-to="Selesai">Selesaikan</button></div>` : ''}</div>`).join('')}</div>` : empty('Tidak ada peringatan', 'Tidak ada peringatan yang cocok dengan filter.');
      };
      root.addEventListener('input', draw);
      root.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b) { RS.state.alerts.find(x => x.id === b.dataset.a).status = b.dataset.to; RS.save(); draw(); RS.refreshNav && RS.refreshNav(); U.toast('Status peringatan diperbarui'); } });
      draw();
    }
  };

  /* ===== Rekomendasi Adaptif ===== */
  P.recommend = {
    title: 'Adaptive Recommendation Engine',
    render() {
      return `<div class="pagehead"><div><div class="eyebrow">ADAPT · Explainable rule-based</div><h1>Adaptive Recommendation Engine</h1><p>Rekomendasi dibangkitkan dari aturan eksplisit. Setiap rekomendasi selalu menampilkan <b>mengapa</b> ia muncul.</p></div><label class="f" style="min-width:260px">Site${U.siteSelect('cs', 'S08')}</label></div>
      <div class="grid g21"><div class="card" id="body"></div><div class="card"><h3>Ringkasan semua site</h3>${table([['Site', r => esc(r.name)], ['Rekomendasi', r => { const f = C.recommend(r).filter(x => x.fired); return f.length ? f.map(x => badge(x.title, x.id === 'R1' || x.id === 'R6' ? 'bad' : x.id === 'R5' ? 'ok' : 'info')).join(' ') : badge('Pemantauan rutin', 'neutral'); }]], D.sites)}</div></div>`;
    },
    mount(a, root) {
      const draw = id => { const s = D.sites.find(x => x.id === id); root.querySelector('#body').innerHTML = `<h3>${esc(s.name)}</h3>${parts.recPanel(s)}<div class="note mt small">Aturan bersifat pendukung keputusan dan membutuhkan verifikasi lapangan serta laboratorium sebelum tindakan.</div>`; };
      pick(root, 'cs', draw); draw('S08');
    }
  };

  /* ===== Pelaporan ===== */
  const FLOW = ['Submitted', 'Reviewed', 'Action Required', 'Resolved'], TYPES = ['Routine Monitoring Report', 'Incident Report', 'Laboratory Report'];
  parts.reportForm = () => `<div class="form"><label class="f">Jenis laporan<select id="rt">${TYPES.map(t => `<option>${t}</option>`).join('')}</select></label><label class="f">Site${U.siteSelect('rsite', 'S01')}</label><label class="f">Tanggal<input type="date" id="rdate" value="2026-10-08"></label><label class="f">Pelapor<input id="rrep" value="${esc(ROLE_NAME[role()])}"></label><label class="f">Tingkat keparahan<select id="rsev"><option>Rendah</option><option>Sedang</option><option>Tinggi</option><option>Kritis</option></select></label><label class="f">Foto / bukti<input type="file" id="rfile" accept="image/*,.pdf"></label><label class="f full">Deskripsi<textarea id="rdesc" rows="3" placeholder="Jelaskan temuan…"></textarea></label><label class="f full">Tindak lanjut<input id="rfu" placeholder="Opsional"></label><div class="full"><button class="btn" id="rsub">Kirim laporan</button> <span class="small muted" id="rerr"></span></div></div>`;
  parts.reportSubmit = root => {
    const $ = s => root.querySelector(s), d = $('#rdesc').value.trim();
    if (!d) { $('#rerr').textContent = 'Deskripsi wajib diisi.'; return null; }
    const f = $('#rfile').files && $('#rfile').files[0], n = RS.state.reports.length + 1, r = { id: 'RPT-2026-' + String(n).padStart(3, '0'), type: $('#rt').value, site: $('#rsite').value, date: $('#rdate').value, reporter: $('#rrep').value || 'Anonim', desc: d, evidence: f ? f.name : '', severity: $('#rsev').value, status: 'Submitted', follow: $('#rfu').value };
    RS.state.reports.push(r); RS.save(); U.toast('Laporan ' + r.id + ' terkirim'); return r;
  };
  P.reports = {
    title: 'Smart Reporting',
    render() {
      return `<div class="pagehead"><div><div class="eyebrow">REPORT</div><h1>Smart Reporting System</h1><p>Alur: Submitted → Reviewed → Action Required → Resolved.</p></div><button class="btn" id="new">+ Laporan baru</button></div>
      <div class="toolbar"><input type="search" id="q" placeholder="Cari ID / deskripsi / site…" aria-label="Cari laporan"><select id="ft"><option value="">Semua jenis</option>${TYPES.map(t => `<option>${t}</option>`).join('')}</select><select id="fs"><option value="">Semua status</option>${FLOW.map(t => `<option>${t}</option>`).join('')}</select></div><div id="list"></div>`;
    },
    mount(a, root) {
      const draw = () => {
        const q = root.querySelector('#q').value.toLowerCase(), ft = root.querySelector('#ft').value, fs = root.querySelector('#fs').value;
        const rows = RS.state.reports.filter(r => (!ft || r.type === ft) && (!fs || r.status === fs) && (!q || (r.id + r.desc + U.siteName(r.site)).toLowerCase().includes(q))).slice().reverse();
        root.querySelector('#list').innerHTML = table([['ID', r => `<b>${r.id}</b>`], ['Jenis', r => esc(r.type)], ['Site', r => esc(U.siteName(r.site))], ['Tanggal', r => r.date], ['Tingkat', r => badge(r.severity)], ['Status', r => badge(r.status)]], rows, { rowAttr: r => `data-r="${r.id}" data-go="x"`, empty: 'Belum ada laporan yang cocok', emptyHint: 'Buat laporan baru atau ubah filter.' });
      };
      const open = id => {
        const r = RS.state.reports.find(x => x.id === id), i = FLOW.indexOf(r.status);
        U.modal(`<div class="eyebrow">${esc(r.type)}</div><h2>${r.id}</h2><div class="steps mb">${FLOW.map((f, k) => `<div class="stp ${k < i || r.status === 'Resolved' ? 'done' : k === i ? 'cur' : ''}">${f}</div>`).join('')}</div><dl class="kv"><dt>Site</dt><dd>${esc(U.siteName(r.site))}</dd><dt>Tanggal</dt><dd>${r.date}</dd><dt>Pelapor</dt><dd>${esc(r.reporter)}</dd><dt>Keparahan</dt><dd>${badge(r.severity)}</dd><dt>Status</dt><dd>${badge(r.status)}</dd><dt>Deskripsi</dt><dd style="font-weight:400">${esc(r.desc)}</dd><dt>Foto / bukti</dt><dd>${r.evidence ? '📎 ' + esc(r.evidence) : '—'}</dd><dt>Tindak lanjut</dt><dd style="font-weight:400">${esc(r.follow) || '—'}</dd></dl>${r.type === 'Laboratory Report' ? `<p class="note small mt">${U.labTag} Data PAH pada laporan laboratorium berasal dari analisis laboratorium.</p>` : ''}${canReview() && i < FLOW.length - 1 ? `<div class="row mt"><button class="btn" id="adv">→ ${FLOW[i + 1]}</button>${i === 1 ? '' : ''}</div>` : ''}`);
        const b = document.getElementById('adv'); if (b) b.onclick = () => { r.status = FLOW[i + 1]; RS.save(); U.closeModal(); draw(); open(id); };
      };
      root.addEventListener('input', draw);
      root.addEventListener('click', e => {
        const t = e.target.closest('[data-r]'); if (t) open(t.dataset.r);
        if (e.target.id === 'new') { if (role() === 'public') return U.toast('Peran Publik tidak dapat mengirim laporan'); const m = U.modal(`<h2>Laporan baru</h2>${parts.reportForm()}`); m.querySelector('#rsub').onclick = () => { if (parts.reportSubmit(m)) { U.closeModal(); draw(); } }; }
      });
      draw();
    }
  };
})();
