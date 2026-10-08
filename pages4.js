/* Halaman 4: Portal Ranger, Research Hub, Dashboard Stakeholder, Model Data */
(function () {
  const U = RS.ui, { esc, badge, kpi, table, empty, line, bar } = U, C = RS.calc, D = RS.data, P = RS.pages, parts = RS.parts;
  const role = () => RS.state.role, avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;

  /* ===== Portal Ranger / Komunitas ===== */
  P.portal = {
    title: 'Portal Ranger / Komunitas',
    render() {
      const pub = role() === 'public';
      const edu = `<div class="grid g3">${D.education.map(e => `<div class="card flat"><h3>${esc(e.t)}</h3><p class="small">${esc(e.d)}</p></div>`).join('')}</div>`;
      if (pub) return `<div class="pagehead"><div><div class="eyebrow">EDUKASI</div><h1>Portal Komunitas</h1><p>Konten edukasi restorasi gambut. Pengiriman laporan memerlukan peran Ranger/Komunitas.</p></div></div>${edu}`;
      const acts = RS.state.activities;
      const asg = table([['Site', r => esc(U.siteName(r.site))], ['Tugas', r => esc(r.task)], ['Tenggat', r => r.due], ['Status', r => badge(r.status)]], D.assignments);
      const quick = `<div class="grid g3"><div class="card flat"><h3>🔥 Lapor kebakaran</h3><p class="small">Asap/api di lahan gambut.</p><button class="btn sm" data-q="fire">Buat laporan</button></div><div class="card flat"><h3>🌵 Lapor kekeringan</h3><p class="small">Muka air turun / tanah retak.</p><button class="btn sm" data-q="drought">Buat laporan</button></div><div class="card flat"><h3>📝 Laporan lapangan</h3><p class="small">Temuan umum + foto.</p><button class="btn sm" data-q="field">Buat laporan</button></div></div>`;
      const seedl = `<div class="form"><label class="f">Site${U.siteSelect('ss', 'S04')}</label><label class="f">Plot<input id="plot" placeholder="mis. Plot 3"></label><label class="f">Bibit hidup<input type="number" id="alive" min="0" value="0"></label><label class="f">Bibit mati<input type="number" id="dead" min="0" value="0"></label><label class="f">Tinggi rata-rata (cm)<input type="number" id="hgt" min="0" step="0.1" value="0"></label><label class="f">Foto plot<input type="file" id="sphoto" accept="image/*"></label><div class="full"><button class="btn" id="saveSeed">Simpan catatan bibit</button></div></div>`;
      const rew = `<div class="form"><label class="f">Site${U.siteSelect('rw', 'S02')}</label><label class="f">Jenis kegiatan<select id="rwt"><option>Penyekatan kanal</option><option>Perbaikan sekat</option><option>Pengukuran muka air</option><option>Pembasahan manual</option></select></label><label class="f">Jumlah sekat / sumur<input type="number" id="rwn" min="0" value="1"></label><label class="f">Muka air setelah (cm)<input type="number" id="rww" min="0" value="40"></label><label class="f full">Catatan<input id="rwc"></label><div class="full"><button class="btn" id="saveRew">Catat kegiatan rewetting</button></div></div>`;
      return `<div class="pagehead"><div><div class="eyebrow">REPORT · Komunitas</div><h1>RE-SOIL Ranger / Community Portal</h1><p>Laporkan kondisi lapangan, catat bibit dan rewetting, serta lihat tugas pemantauan Anda.</p></div></div>` + U.tabs('pt', [
        { k: 'asg', label: 'Tugas pemantauan', html: asg }, { k: 'rep', label: 'Lapor cepat', html: quick + '<div class="card mt" id="repform" hidden></div>' }, { k: 'seed', label: 'Kondisi bibit', html: seedl }, { k: 'rew', label: 'Aktivitas rewetting', html: rew },
        { k: 'act', label: 'Aktivitas saya', html: '<div id="actlist"></div>' }, { k: 'edu', label: 'Edukasi', html: edu }]);
    },
    mount(a, root) {
      if (role() === 'public') return;
      const $ = s => root.querySelector(s);
      const acts = () => { $('#actlist').innerHTML = table([['Waktu', r => esc(r.ts)], ['Jenis', r => esc(r.kind)], ['Site', r => esc(U.siteName(r.site))], ['Ringkasan', r => esc(r.note)]], RS.state.activities.slice().reverse(), { empty: 'Belum ada aktivitas', emptyHint: 'Catatan bibit, rewetting, dan laporan akan muncul di sini.' }); };
      const log = (kind, site, note) => { RS.state.activities.push({ id: 'ACT-' + (RS.state.activities.length + 1), ts: new Date().toISOString().slice(0, 16).replace('T', ' '), kind, site, note }); RS.save(); acts(); };
      const PRE = { fire: ['Incident Report', 'Kritis', 'Kebakaran: '], drought: ['Incident Report', 'Tinggi', 'Kekeringan: '], field: ['Routine Monitoring Report', 'Rendah', ''] };
      root.addEventListener('click', e => {
        const q = e.target.closest('[data-q]');
        if (q) { const p = PRE[q.dataset.q], f = $('#repform'); f.hidden = false; f.innerHTML = `<h3>Form laporan</h3>${parts.reportForm()}`; f.querySelector('#rt').value = p[0]; f.querySelector('#rsev').value = p[1]; f.querySelector('#rdesc').value = p[2]; f.querySelector('#rsub').onclick = () => { const r = parts.reportSubmit(f); if (r) { log('Laporan ' + r.type, r.site, r.id); f.hidden = true; } }; }
        if (e.target.id === 'saveSeed') { const a = +$('#alive').value, d = +$('#dead').value; log('Kondisi bibit', $('#ss').value, `${$('#plot').value || 'Plot'}: hidup ${a}, mati ${d}${a + d ? ' (survival ' + Math.round(a / (a + d) * 100) + '%)' : ''}, tinggi ${$('#hgt').value} cm`); U.toast('Catatan bibit tersimpan'); }
        if (e.target.id === 'saveRew') { log('Rewetting', $('#rw').value, `${$('#rwt').value} ×${$('#rwn').value}, muka air ${$('#rww').value} cm. ${$('#rwc').value}`); U.toast('Kegiatan rewetting dicatat'); }
      });
      acts();
    }
  };

  /* ===== Research & Validation Hub ===== */
  P.research = {
    title: 'Research & Validation Hub',
    render() {
      const R = D.research, names = { alginate: 'Alginat', biochar: 'Biochar', microbes: 'Mikroba', pah: 'Eksperimen PAH', hydrogel: 'Degradasi hidrogel', germ: 'Perkecambahan', meso: 'Mesokosmos', field: 'Uji lapangan', safety: 'Keamanan material' };
      return `<div class="pagehead"><div><div class="eyebrow">EVALUATE</div><h1>Research & Validation Hub</h1><p>Dataset validasi material dan Phytobead. Seluruh angka adalah data demonstrasi.</p></div></div>` + U.tabs('rh', Object.keys(R).map(k => {
        const d = R[k]; let ch = '';
        if (d.chart && d.chart.type === 'bar') ch = `<div class="card mt"><h3>${esc(d.chart.label)}</h3>${bar({ labels: d.rows.map(r => r[d.chart.lab[0]]), data: d.rows.map(r => r[d.chart.lab[1]]), color: '#4a8a5c', title: d.title })}</div>`;
        if (d.chart && d.chart.type === 'line') ch = `<div class="card mt"><h3>Massa tersisa terhadap waktu</h3>${line({ labels: d.rows.map(r => 'H' + r[0]), series: d.cols.slice(1).map((c, i) => ({ name: c, data: d.rows.map(r => r[i + 1]), color: ['#b3362b', '#c8801f', '#2c5a3e'][i] })), unit: '%', min: 0, max: 100 })}</div>`;
        const lab = k === 'pah' ? `<div class="row mb">${U.labTag}</div>` : '';
        return { k, label: names[k], html: `${lab}<div class="card"><h3>${esc(d.title)}</h3>${table(d.cols.map((c, i) => [c, r => /^(Lulus|Berjalan|Menunggu|Selesai)$/.test(r[i]) ? badge(r[i]) : esc(r[i])]), d.rows)}</div>${ch}` };
      }));
    }
  };

  /* ===== Dashboard Stakeholder ===== */
  P.stakeholder = {
    title: 'Dashboard Stakeholder',
    render() {
      const S = D.sites, area = S.reduce((a, s) => a + s.area, 0), byProv = {}; S.forEach(s => byProv[s.prov] = (byProv[s.prov] || 0) + s.area);
      const gov = `<div class="grid g4">${kpi('Total area', U.fmt(area) + ' ha')}${kpi('Site Critical', S.filter(s => s.status === 'Critical').length, '', 'bad')}${kpi('Peringatan aktif', RS.state.alerts.filter(a => a.status !== 'Selesai').length, '', 'warn')}${kpi('Laporan terbuka', RS.state.reports.filter(r => r.status !== 'Resolved').length)}</div><div class="grid g2 mt"><div class="card"><h3>Area per provinsi (ha)</h3>${bar({ labels: Object.keys(byProv), data: Object.values(byProv), color: '#6e4b2e', unit: ' ha' })}</div><div class="card"><h3>Risiko & prioritas</h3>${table([['Site', r => esc(r.name)], ['Status', r => badge(r.status)], ['Skor', r => C.sitePriority(r).total]], S.slice().sort((a, b) => C.sitePriority(b).total - C.sitePriority(a).total))}</div></div><div class="card mt"><h3>Progres restorasi per fase</h3>${bar({ labels: D.PHASES, data: D.PHASES.map(p => S.filter(s => s.phase === p).reduce((a, s) => a + s.area, 0)), colors: D.PHASES.map(p => U.PHASE_COLOR[p]), unit: ' ha' })}</div>`;
      const res = `<div class="card">${U.labTag}${table([['Site', r => esc(r.name)], ['Status detox', r => r.pah ? badge(C.detoxStatus(r)) : '—'], ['Reduksi fenantren', r => r.pah ? C.reduction(r) + '%' : '—'], ['Regen. score', r => r.germ ? C.regenScore(r.germ, r.veg) : '—']], S)}</div><p class="mt"><a class="btn sec sm" href="#/research">Buka Research Hub</a> <a class="btn sec sm" href="#/detox">Detox Progress</a></p>`;
      const com = `<div class="grid g3">${kpi('Tugas aktif', D.assignments.length)}${kpi('Laporan komunitas', RS.state.reports.length)}${kpi('Aktivitas tercatat', RS.state.activities.length)}</div><div class="card mt"><h3>Tugas pemantauan</h3>${table([['Site', r => esc(U.siteName(r.site))], ['Tugas', r => esc(r.task)], ['Tenggat', r => r.due], ['Status', r => badge(r.status)]], D.assignments)}</div>`;
      const ind = `<div class="grid g4">${kpi('Total batch', RS.state.batches.length)}${kpi('Batch Ready', RS.state.batches.filter(b => b.status === 'Ready').length, '', '')}${kpi('Rerata viabilitas biji', Math.round(avg(RS.state.batches.map(b => b.viab))) + '%')}${kpi('Total bead terpasang', U.fmt(D.deployments.reduce((a, d) => a + d.beads, 0)))}</div><div class="card mt">${table([['Batch', r => `<b>${r.id}</b>`], ['Produksi', r => r.prod], ['Biochar', r => esc(r.biochar)], ['Viabilitas', r => r.viab + '%'], ['Status', r => badge(r.status)]], RS.state.batches)}</div>`;
      const pub = `<div class="grid g4">${kpi('Site restorasi', S.length)}${kpi('Area terpantau', U.fmt(area) + ' ha')}${kpi('Site pulih/stabil', S.filter(s => s.status === 'Recovering' || s.phase === 'Regenerate' || s.phase === 'Monitoring').length)}${kpi('Provinsi', Object.keys(byProv).length)}</div><div class="card mt"><h3>Progres restorasi (non-sensitif)</h3>${bar({ labels: D.PHASES, data: D.PHASES.map(p => S.filter(s => s.phase === p).length), colors: D.PHASES.map(p => U.PHASE_COLOR[p]), unit: ' site' })}<p class="small muted">Tampilan publik tidak memuat koordinat, konsentrasi PAH, atau data laporan internal.</p></div>`;
      const all = [{ k: 'gov', label: 'Pemerintah', html: gov }, { k: 'res', label: 'Peneliti', html: res }, { k: 'com', label: 'Komunitas', html: com }, { k: 'ind', label: 'Industri', html: ind }, { k: 'pub', label: 'Publik', html: pub }];
      const items = role() === 'public' ? [all[4]] : role() === 'gov' ? all.filter(x => ['gov', 'pub'].includes(x.k)) : all;
      return `<div class="pagehead"><div><div class="eyebrow">EVALUATE</div><h1>Dashboard Stakeholder</h1><p>Tampilan sesuai kebutuhan: pemerintah, peneliti, komunitas, industri, dan publik.</p></div></div>` + U.tabs('sh', items);
    }
  };

  /* ===== Model Data ===== */
  const SCHEMA = { Users: 'id, name, role, org', Sites: 'id, name, prov, kab, area, status, phase, lat, lon', SiteMonitoring: 'site → Sites, date, moisture, gw, ph, veg', FireHistory: 'site → Sites, year, severity, areaBurned', PAHResults: 'site → Sites, week, phenanthrene, pyrene, bioavailable, residual, desorption, leaching, label=Laboratory Verified', PeatScanResults: 'id, site, ts, label (Low/Moderate/High PAH Risk)', Deployments: 'id, site → Sites, batch → RESoilBatches, date, beads, points, staff, status', RESoilBatches: 'id, prod, alginate, biochar, transitionLayer, consortium → MicrobialConsortium, seedBatch → SeedBatches, window, status', MicrobialConsortium: 'id, isolates, source, target', SeedBatches: 'id, species, viability, collected, origin', GerminationMonitoring: 'site → Sites, seeded, germinated, mgt, survival, height, mortality', VegetationMonitoring: 'site → Sites, month, cover', EnvironmentalMonitoring: 'site → Sites, month, moisture, gw, rain, temp, ph, fireRisk', Reports: 'id, type, site → Sites, date, reporter, description, evidence, severity, status, followUp', RiskAlerts: 'id, site → Sites, type, severity, reason, recommendation, ts, status', Recommendations: 'site → Sites, rule, title, why', LaboratoryReports: 'id, site → Sites, method, status, label', Stakeholders: 'id, name, type', Activities: 'id, ts, kind, site, note' };
  P.datamodel = {
    title: 'Model Data',
    render() {
      const db = RS.exportDB();
      return `<div class="pagehead"><div><div class="eyebrow">ARSITEKTUR</div><h1>Model Data</h1><p>19 entitas inti. Prototipe ini memakai data demo di memori + localStorage; skema siap dipetakan ke basis data relasional.</p></div><button class="btn" id="dl">⬇ Unduh JSON demo</button></div>${table([['Entitas', r => `<b>${r[0]}</b>`], ['Atribut utama', r => `<span class="small">${esc(r[1])}</span>`], ['Rekaman demo', r => (db[r[0]] || []).length]], Object.entries(SCHEMA))}`;
    },
    mount(a, root) { root.querySelector('#dl').onclick = () => { const b = new Blob([JSON.stringify(RS.exportDB(), null, 2)], { type: 'application/json' }), l = document.createElement('a'); l.href = URL.createObjectURL(b); l.download = 'resoil-demo-data.json'; l.click(); }; }
  };
})();
