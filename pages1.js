/* Halaman 1: Landing, Command Center, Peta, Daftar Site, Detail Site + komponen bersama */
(function () {
  const U = RS.ui, { esc, badge, line, bar, gauge, kpi, table, empty } = U, C = RS.calc, D = RS.data;
  const P = RS.pages = {}, parts = RS.parts = {};
  const role = () => RS.state.role;
  const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  const activeAlerts = () => RS.state.alerts.filter(a => a.status !== 'Selesai');
  const PHASE_ID = { Precondition: 'Prasyarat hidrologi, penilaian & rewetting', Detox: 'CONDITION → DETOX: bead mengondisikan tanah dan mendukung biodegradasi PAH', Transition: 'CONTROLLED TRANSITION: pelapis hidrogel terurai bertahap (jendela = target desain)', Regenerate: 'PHYTO-RELEASE → REGENERATE: biji Dyera polyphylla dilepas dan berkecambah', Monitoring: 'MONITOR & ADAPT: pemantauan jangka panjang dan adaptasi' };

  /* ===== Status lingkungan & grafik ===== */
  parts.envStatus = s => {
    const m = s.moisture, g = s.gw, e = s.env, f = e.fire[11];
    return [
      ['Kelembapan tanah', m + '%', m < 55 ? ['Kering', 'bad'] : m < 65 ? ['Waspada', 'warn'] : ['Basah', 'ok']],
      ['Muka air tanah', g + ' cm', g > 40 ? ['Terlalu dalam', 'bad'] : g > 30 ? ['Marginal', 'warn'] : ['Sesuai', 'ok']],
      ['Curah hujan (Okt)', e.rain[11] + ' mm', e.rain[11] < 100 ? ['Musim kering', 'warn'] : ['Cukup', 'ok']],
      ['Suhu udara', e.temp[11] + ' °C', e.temp[11] > 33 ? ['Panas', 'warn'] : ['Normal', 'ok']],
      ['pH tanah', s.ph, s.ph < 3.5 ? ['Sangat masam', 'warn'] : s.ph <= 4.8 ? ['Khas gambut', 'ok'] : ['Tinggi', 'info']],
      ['Tutupan vegetasi', s.veg + '%', s.veg < 20 ? ['Rendah', 'bad'] : s.veg < 50 ? ['Berkembang', 'warn'] : ['Baik', 'ok']],
      ['Indeks risiko kebakaran', f + '/100', f > 70 ? ['Tinggi', 'bad'] : f > 45 ? ['Sedang', 'warn'] : ['Rendah', 'ok']]
    ];
  };
  parts.envBadges = s => `<div class="grid g4">${parts.envStatus(s).map(r => `<div class="kpi"><span>${r[0]}</span><b style="font-size:1.4rem">${r[1]}</b><small>${badge(r[2][0], r[2][1])}</small></div>`).join('')}</div>`;
  parts.envCharts = s => {
    const e = s.env, L = e.labels;
    return `<div class="grid g2">
      <div class="card"><h3>Kelembapan tanah</h3>${line({ labels: L, series: [{ name: 'Kelembapan', data: e.moisture, color: '#2f6fa3' }], unit: '%', ref: { value: 55, label: 'ambang 55%' } })}</div>
      <div class="card"><h3>Muka air tanah (cm di bawah permukaan)</h3>${line({ labels: L, series: [{ name: 'Muka air', data: e.gw, color: '#6e4b2e' }], unit: ' cm', ref: { value: 40, label: 'ambang 40 cm' } })}</div>
      <div class="card"><h3>Curah hujan bulanan</h3>${bar({ labels: L, data: e.rain, color: '#5b93c2', unit: ' mm' })}</div>
      <div class="card"><h3>Suhu udara</h3>${line({ labels: L, series: [{ name: 'Suhu', data: e.temp, color: '#c8801f' }], unit: ' °C' })}</div>
      <div class="card"><h3>pH tanah</h3>${line({ labels: L, series: [{ name: 'pH', data: e.ph, color: '#9a7248' }], unit: '', min: 3, max: 5 })}</div>
      <div class="card"><h3>Tutupan vegetasi</h3>${line({ labels: L, series: [{ name: 'Tutupan', data: e.veg, color: '#4a8a5c' }], unit: '%' })}</div>
      <div class="card"><h3>Indeks risiko kebakaran</h3>${line({ labels: L, series: [{ name: 'Risiko', data: e.fire, color: '#b3362b' }], unit: '', min: 0, max: 100, ref: { value: 70, label: 'tinggi' } })}</div></div>`;
  };

  /* ===== Detox / Regenerasi / Rekomendasi (dipakai ulang) ===== */
  parts.detoxPanel = (s, pyr) => {
    if (!s.pah) return empty('Belum ada data laboratorium', 'Site ini berada di fase Precondition — lakukan rewetting terlebih dahulu. Data PAH tersedia setelah deployment dan pengambilan sampel laboratorium.', `<a class="btn sec sm" href="#/planner">Buka Deployment Planner</a>`);
    const p = s.pah, st = C.detoxStatus(s), i = p.weeks.length - 1, wl = p.weeks.map(w => 'M' + w);
    const series = [{ name: 'Fenantren (model PAH utama)', data: p.phen, color: '#6e4b2e' }];
    if (pyr) series.push({ name: 'Pirena (opsional)', data: p.pyr, color: '#c8801f', dash: true });
    return `<div class="row between mb">${U.labTag}${badge(st)}</div>
    <div class="grid g4">${kpi('Fenantren terkini', p.phen[i] + ' mg/kg', 'awal ' + s.lab.start + ' mg/kg')}${kpi('Reduksi PAH', C.reduction(s) + '%', 'dari konsentrasi awal', 'brown')}${kpi('PAH bioavailable', p.bio[i] + ' mg/kg', 'fraksi mudah terserap')}${kpi('PAH residual', p.res[i] + '%', 'dari awal (residual risk)')}${kpi('Desorpsi', p.des[i] + '%', 'fraksi terdesorpsi')}${kpi('Lindi (leaching)', p.lea[i] + ' µg/L', p.lea[i] > p.lea[i - 1] ? '▲ naik dari sampling sebelumnya' : 'turun/stabil', p.lea[i] > (p.lea[i - 1] || 99) ? 'warn' : '')}</div>
    <div class="grid g2 mt">
      <div class="card"><h3>Konsentrasi PAH (mg/kg) ${U.labTag}</h3>${line({ labels: wl, series, unit: ' mg/kg', min: 0 })}</div>
      <div class="card"><h3>Bioavailable & residual ${U.labTag}</h3>${line({ labels: wl, series: [{ name: 'Bioavailable (mg/kg)', data: p.bio, color: '#b3362b' }, { name: 'Residual (% dari awal)', data: p.res, color: '#2c5a3e' }], min: 0 })}</div>
      <div class="card"><h3>Desorpsi (%) & lindi (µg/L) ${U.labTag}</h3>${line({ labels: wl, series: [{ name: 'Desorpsi (%)', data: p.des, color: '#2f6fa3' }, { name: 'Lindi (µg/L)', data: p.lea, color: '#9a7248', dash: true }], min: 0 })}</div>
      <div class="card"><h3>Data per minggu ${U.labTag}</h3>${table([['Minggu', r => 'M' + r.w], ['Fenantren', r => r.a], ['Pirena', r => r.b], ['Bioav.', r => r.c], ['Resid. %', r => r.d], ['Desorp. %', r => r.e], ['Lindi', r => r.f]], p.weeks.map((w, k) => ({ w, a: p.phen[k], b: p.pyr[k], c: p.bio[k], d: p.res[k], e: p.des[k], f: p.lea[k] })))}</div>
    </div>
    <p class="note mt">Jendela transisi (±minggu 8–12) adalah <b>target desain</b>, bukan waktu pelepasan yang dijamin. Hasil menunjukkan reduksi PAH, penurunan bioavailabilitas, dan biodegradasi — bukan penghilangan seluruh polutan; <b>residual risk</b> tetap dievaluasi lewat verifikasi laboratorium (${esc(p.labId)}, ${esc(p.method)}).</p>`;
  };
  parts.regenSeries = s => {
    const g = s.germ, gp = C.germPct(g), m = ['Bln 1', 'Bln 2', 'Bln 3', 'Bln 4', 'Bln 5', 'Bln 6'];
    return { m, germ: m.map((_, i) => Math.round(gp * (1 - Math.exp(-(i + 1) / 1.8)) / (1 - Math.exp(-6 / 1.8)))), surv: m.map((_, i) => Math.round(100 - (100 - g.survival) * Math.pow((i + 1) / 6, .8))), height: m.map((_, i) => Math.round(g.height * Math.pow((i + 1) / 6, 1.2) * 10) / 10) };
  };
  parts.regenPanel = s => {
    if (!s.germ) return empty('Belum ada data regenerasi', s.phase === 'Precondition' ? 'Site belum masuk fase Regenerate. Pastikan hidrologi sesuai lebih dulu.' : 'Fase phyto-release belum dimulai — biji dilepas setelah jendela transisi (target desain) tercapai.');
    const g = s.germ, gp = Math.round(C.germPct(g)), sc = C.regenScore(g, s.veg), cat = C.regenCat(sc), col = { Poor: '#b3362b', Developing: '#c8801f', Stable: '#4a8a5c', 'Strong Recovery': '#1c3a2a' }[cat], ts = parts.regenSeries(s);
    const comp = [['Perkecambahan (25%)', gp], ['Survival bibit (30%)', g.survival], ['Tinggi relatif 50 cm (15%)', Math.min(100, Math.round(g.height / 50 * 100))], ['Tutupan vegetasi (20%)', s.veg], ['Ketahanan / 100−mortalitas (10%)', 100 - g.mort]];
    return `<div class="grid g21"><div class="grid g4">${kpi('Biji berkecambah', U.fmt(g.germinated), 'dari ' + U.fmt(g.seeded) + ' biji')}${kpi('Perkecambahan', gp + '%')}${kpi('Waktu kecambah rata-rata', g.mgt + ' hari')}${kpi('Survival bibit', g.survival + '%')}${kpi('Tinggi rata-rata', g.height + ' cm')}${kpi('Tutupan vegetasi', s.veg + '%')}${kpi('Mortalitas', g.mort + '%', '', g.mort > 35 ? 'bad' : '')}</div>
    <div class="card" style="text-align:center"><h3>Regeneration Score</h3>${gauge(sc, '/ 100', col)}<div>${badge(cat)}</div><p class="small muted">Skor demonstrasi: 0–39 Poor · 40–59 Developing · 60–79 Stable · ≥80 Strong Recovery</p></div></div>
    <div class="grid g2 mt"><div class="card"><h3>Komponen skor</h3><div class="bars">${comp.map(c => `<div class="br"><span>${c[0]}</span><div class="tr"><i style="width:${c[1]}%"></i></div><b>${c[1]}</b></div>`).join('')}</div></div>
    <div class="card"><h3>Perkembangan (ilustrasi)</h3>${line({ labels: ts.m, series: [{ name: 'Perkecambahan kumulatif (%)', data: ts.germ, color: '#4a8a5c' }, { name: 'Survival (%)', data: ts.surv, color: '#2f6fa3' }], min: 0, max: 100 })}</div></div>`;
  };
  parts.recPanel = s => {
    const R = C.recommend(s), fired = R.filter(r => r.fired);
    return `<h3>Rekomendasi aktif</h3>${fired.length ? fired.map(r => `<div class="rule fired"><div class="row between"><b>${esc(r.title)}</b>${badge('Aktif', 'ok')}</div><p class="small"><b>MENGAPA:</b> ${esc(r.why)}</p><p class="small muted">Aturan ${r.id}: ${esc(r.cond)}</p></div>`).join('') : `<div class="rule"><b>Pemantauan rutin</b><p class="small">Tidak ada aturan yang terpicu; lanjutkan pemantauan terjadwal.</p></div>`}
    <details><summary class="small muted" style="cursor:pointer">Lihat seluruh aturan yang dievaluasi (transparansi)</summary>${R.filter(r => !r.fired).map(r => `<div class="rule off"><b>${esc(r.title)}</b> <span class="small muted">— tidak terpicu · ${esc(r.cond)}</span></div>`).join('')}</details>`;
  };

  /* ===== Peta ===== */
  const LAYERS = [['fire', 'Riwayat kebakaran'], ['moisture', 'Kelembapan tanah'], ['gw', 'Muka air tanah'], ['ph', 'pH'], ['veg', 'Tutupan vegetasi'], ['pah', 'Sampling PAH'], ['deploy', 'Deployment RE-SOIL'], ['regen', 'Status regenerasi'], ['alerts', 'Peringatan risiko']];
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => { t = Math.max(0, Math.min(1, t)); const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  const SCALE = { moisture: v => mix('#b5651d', '#2f6fb0', (v - 30) / 60), gw: v => mix('#2f6fb0', '#a33a2a', v / 80), ph: v => mix('#d9822b', '#4a8a5c', (v - 3.5) / 1), veg: v => mix('#d8c9a8', '#2f7a45', v / 80) };
  const RING = { moisture: 26, gw: 21, ph: 16, veg: 12 };
  const LEG = { fire: 'lingkar merah = keparahan kebakaran', moisture: 'cokelat (kering) → biru (basah)', gw: 'biru (dangkal) → merah-cokelat (dalam)', ph: 'oranye (masam) → hijau', veg: 'krem (terbuka) → hijau tua', pah: '◆ titik sampling laboratorium', deploy: '⬢ ada deployment RE-SOIL', regen: '● hijau = data regenerasi', alerts: '▲ peringatan aktif' };
  parts.mapHTML = (uid, o) => {
    o = o || {}; const pub = role() === 'public', layers = LAYERS.filter(l => !(pub && ['pah', 'alerts'].includes(l[0]))), def = o.def || ['moisture', 'alerts'];
    return `<div class="mapbox ${o.compact ? 'compact' : ''}" id="${uid}"><div class="maplayers">${layers.map(l => `<label class="chip"><input type="checkbox" value="${l[0]}" ${def.includes(l[0]) ? 'checked' : ''}> ${l[1]}</label>`).join('')}</div>
    <div class="mapgrid"><svg viewBox="0 0 640 360" class="mapsvg" role="img" aria-label="Peta skematik lokasi site restorasi"><defs><pattern id="dots${uid}" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#b9d0cd"/></pattern></defs><rect width="640" height="360" fill="url(#dots${uid})"/>
    <polygon points="40,30 90,20 150,70 210,130 270,200 290,250 250,262 190,217 120,152 70,100" fill="#efe8d6" stroke="#c9bfa3" stroke-width="2"/><polygon points="330,110 380,70 450,60 520,90 560,150 540,220 480,270 410,280 350,250 320,190" fill="#efe8d6" stroke="#c9bfa3" stroke-width="2"/><polygon points="230,308 300,298 420,310 470,316 440,330 330,327 250,327" fill="#efe8d6" stroke="#c9bfa3" stroke-width="2"/>
    <text x="75" y="48" class="ax" fill="#9a7248" font-size="12">SUMATERA</text><text x="470" y="85" fill="#9a7248" font-size="12">KALIMANTAN</text><text x="320" y="345" fill="#9a7248" font-size="11">Jawa</text><text x="610" y="350" text-anchor="end" fill="#8aa" font-size="9">peta skematik · bukan skala</text><g class="mk"></g></svg><div class="mapinfo"></div></div><div class="maplegend"></div></div>`;
  };
  parts.mapMount = root => {
    root.querySelectorAll('.mapbox').forEach(box => {
      let sel = null; const pub = role() === 'public', compact = box.classList.contains('compact');
      const draw = () => {
        const on = [...box.querySelectorAll('input:checked')].map(i => i.value); let g = '';
        D.sites.forEach(s => {
          const act = RS.state.alerts.filter(a => a.site === s.id && a.status !== 'Selesai').length;
          g += `<g class="mk-s" data-site="${s.id}" transform="translate(${s.x},${s.y})" tabindex="0" role="button" aria-label="${esc(s.name)}">`;
          if (on.includes('fire')) g += `<circle r="${14 + s.fireSev * .24}" fill="#b3362b" fill-opacity=".14" stroke="#b3362b" stroke-opacity=".5" stroke-dasharray="3 3"/>`;
          ['moisture', 'gw', 'ph', 'veg'].forEach(k => { if (on.includes(k)) { const v = k === 'moisture' ? s.moisture : k === 'gw' ? s.gw : k === 'ph' ? s.ph : s.veg, c = SCALE[k](v); g += `<circle r="${RING[k]}" fill="${c}" fill-opacity=".22" stroke="${c}" stroke-width="3"><title>${k}: ${v}</title></circle>`; } });
          if (on.includes('pah') && s.pah) g += `<path d="M15 -22 l6 6 -6 6 -6 -6z" fill="#1c3a2a"><title>Sampling PAH laboratorium</title></path>`;
          if (on.includes('deploy') && s.batch) g += `<path d="M-15 -23 l5 -3 5 3 0 6 -5 3 -5 -3z" fill="#9a7248" stroke="#fff"><title>Deployment ${s.batch}</title></path>`;
          if (on.includes('regen') && s.germ) g += `<circle cx="16" cy="16" r="5" fill="${{ Poor: '#b3362b', Developing: '#c8801f', Stable: '#4a8a5c', 'Strong Recovery': '#1c3a2a' }[C.regenCat(C.regenScore(s.germ, s.veg))]}" stroke="#fff"/>`;
          if (on.includes('alerts') && act) g += `<path d="M-16 24 l6 -11 6 11z" fill="#b3362b" stroke="#fff"/>`;
          g += `<circle class="dot" r="8" fill="${U.STATUS_COLOR[s.status]}" stroke="${sel === s.id ? '#000' : '#fff'}" stroke-width="${sel === s.id ? 3 : 2}"/>${compact ? '' : `<text y="-12" x="0" text-anchor="middle" font-size="9.5" fill="#33423a" stroke="#fff" stroke-width="3" paint-order="stroke">${esc(s.id)}</text>`}</g>`;
        });
        box.querySelector('.mk').innerHTML = g;
        box.querySelector('.maplegend').innerHTML = Object.keys(U.STATUS_COLOR).map(k => `<span><i style="background:${U.STATUS_COLOR[k]}"></i>${k}</span>`).join('') + on.map(k => `<span>${LEG[k]}</span>`).join('');
        const info = box.querySelector('.mapinfo'), s = D.sites.find(x => x.id === sel);
        info.innerHTML = !s ? `<b>Klik penanda site</b><p class="muted small">Ringkasan site muncul di sini. Aktifkan lapisan untuk melihat data spasial.</p>` :
          `<b>${esc(s.name)}</b><div class="row" style="margin:6px 0">${badge(s.status)}${badge(s.phase)}</div><dl class="kv" style="grid-template-columns:110px 1fr"><dt>Provinsi</dt><dd>${esc(s.prov)}</dd><dt>Luas</dt><dd>${s.area} ha</dd>${pub ? '' : `<dt>Kelembapan</dt><dd>${s.moisture}%</dd><dt>Muka air</dt><dd>${s.gw} cm</dd><dt>pH</dt><dd>${s.ph}</dd><dt>Vegetasi</dt><dd>${s.veg}%</dd><dt>Alert aktif</dt><dd>${RS.state.alerts.filter(a => a.site === s.id && a.status !== 'Selesai').length}</dd>`}</dl>${pub ? '<p class="small muted">Detail teknis tidak ditampilkan pada tampilan publik.</p>' : `<a class="btn sm" href="#/site/${s.id}">Buka detail site →</a>`}`;
      };
      box.addEventListener('change', draw);
      box.addEventListener('click', e => { const m = e.target.closest('[data-site]'); if (m) { sel = m.dataset.site; draw(); } });
      box.addEventListener('keydown', e => { if (e.key === 'Enter') { const m = e.target.closest('[data-site]'); if (m) { sel = m.dataset.site; draw(); } } });
      draw();
    });
  };

  /* ===== Landing ===== */
  const bead = () => `<svg viewBox="0 0 360 340" role="img" aria-label="Penampang Smart Core–Shell Phytobead"><defs><radialGradient id="sh" cx=".4" cy=".35"><stop offset="0" stop-color="#e3f0d9"/><stop offset="1" stop-color="#b7d6b4"/></radialGradient></defs>
    <circle cx="180" cy="170" r="150" fill="url(#sh)" stroke="#8fb58f" stroke-width="3"/>${Array.from({ length: 46 }, (_, i) => { const a = i * 2.4, r = 112 + (i * 37 % 34); return `<circle cx="${180 + r * Math.cos(a)}" cy="${170 + r * Math.sin(a)}" r="${2 + i % 3}" fill="#2b2b26" opacity=".75"/>`; }).join('')}
    ${Array.from({ length: 14 }, (_, i) => { const a = i * 1.1 + .3, r = 105 + (i * 13 % 36); return `<rect x="${180 + r * Math.cos(a) - 5}" y="${170 + r * Math.sin(a) - 2}" width="10" height="4" rx="2" fill="#2f8a4c" transform="rotate(${i * 40} ${180 + r * Math.cos(a)} ${170 + r * Math.sin(a)})"/>`; }).join('')}
    <circle cx="180" cy="170" r="98" fill="#f1e3c8" stroke="#c9a96e" stroke-width="3" stroke-dasharray="7 5"/><circle cx="180" cy="170" r="62" fill="#6e4b2e"/><ellipse cx="165" cy="165" rx="16" ry="9" fill="#d3bda1" transform="rotate(-25 165 165)"/><ellipse cx="195" cy="180" rx="14" ry="8" fill="#d3bda1" transform="rotate(30 195 180)"/><path d="M180 150c0-9 6-14 13-14-1 8-5 13-13 14z" fill="#a9cdb2"/></svg>`;
  P.landing = {
    render() {
      const sites = D.sites, area = sites.reduce((a, s) => a + s.area, 0), red = Math.round(avg(sites.filter(s => s.pah).map(C.reduction))), sv = Math.round(avg(sites.filter(s => s.germ).map(s => s.germ.survival)));
      const mech = [['CONDITION', 'Hidrogel alginat dan biochar mengondisikan mikrohabitat tanah terbakar.'], ['DETOX', 'Mikroba indigenus mendegradasi PAH 3–4 cincin; biochar menurunkan bioavailabilitas.'], ['CONTROLLED TRANSITION', 'Lapisan transisi terurai bertahap pada jendela target desain.'], ['PHYTO-RELEASE', 'Inti melepas biji Dyera polyphylla saat kondisi lebih aman.'], ['REGENERATE', 'Biji berkecambah, bibit tumbuh dan vegetasi pulih.'], ['MONITOR & ADAPT', 'Data lapangan & laboratorium memandu adaptasi tindakan.']];
      const dig = [['ASSESS', 'Kondisi hidrologi, PAH, vegetasi.'], ['PRIORITIZE', 'Restoration Priority Index.'], ['DEPLOY', 'Perencanaan titik & batch.'], ['MONITOR', 'Lingkungan, Detox, Regenerasi.'], ['REPORT', 'Laporan lapangan & lab.'], ['EVALUATE', 'Skor & verifikasi.'], ['ADAPT', 'Rekomendasi berbasis aturan.']];
      return `<div class="land"><header class="lhead"><div class="lbrand"><img src="assets/favicon.svg" alt="" width="34" height="34"> RE-SOIL</div><nav><a href="#sec-mech" data-anchor>Mekanisme</a><a href="#sec-loop" data-anchor>Digital Loop</a><a href="#sec-stat" data-anchor>Statistik</a></nav><a class="btn" href="#/command">Masuk Dashboard</a></header>
      <section class="hero"><div><div class="eyebrow">Digital Restoration Loop · Gambut Tropis Pascakebakaran</div><h1>Dari lahan terbakar menuju <em>hutan gambut</em> yang pulih — terukur, adaptif.</h1><p class="lead">RE-SOIL adalah platform decision-support, monitoring, pelaporan, dan restorasi adaptif. Ia menghubungkan <b>Smart Core–Shell Phytobead</b> (hidrogel alginat alga, biochar cangkang kelapa sawit, mikroba pendegradasi PAH, dan inti biji <i>Dyera polyphylla</i>) dengan data lapangan dan laboratorium.</p><div class="row mt"><a class="btn" href="#/command">Buka Command Center →</a><a class="btn sec" href="#/map">Lihat Peta Kondisi Gambut</a></div><p class="note mt">RE-SOIL <b>tidak menggantikan rewetting</b>. Deployment hanya direkomendasikan bila kondisi hidrologi dasar sesuai.</p></div><div>${bead()}<p class="small muted" style="text-align:center">Penampang Phytobead: cangkang alginat + biochar + mikroba · lapisan transisi · inti biji</p></div></section>
      <section class="sec" id="sec-mech"><div class="eyebrow">Mekanisme fisik</div><h2>CONDITION → DETOX → CONTROLLED TRANSITION → PHYTO-RELEASE → REGENERATE → MONITOR & ADAPT</h2><div class="flow mt">${mech.map(m => `<div class="st"><b>${m[0]}</b><span class="small muted">${m[1]}</span></div>`).join('')}</div></section>
      <section class="sec alt" id="sec-loop"><div><div class="eyebrow">Sistem digital</div><h2>ASSESS → PRIORITIZE → DEPLOY → MONITOR → REPORT → EVALUATE → ADAPT</h2><div class="flow digital mt">${dig.map(m => `<div class="st"><b>${m[0]}</b><span class="small muted">${m[1]}</span></div>`).join('')}</div></div></section>
      <section class="sec" id="sec-stat"><div class="eyebrow">Statistik demo</div><h2>Ringkasan portofolio site</h2><div class="stats mt"><div class="stat"><b>${sites.length}</b><span>site restorasi demo</span></div><div class="stat"><b>${U.fmt(area)} ha</b><span>area terpantau</span></div><div class="stat"><b>${red}%</b><span>rerata reduksi fenantren (Laboratory Verified, demo)</span></div><div class="stat"><b>${sv}%</b><span>rerata survival bibit</span></div></div>
      <div class="grid g3 mt"><div class="card flat"><h3>Prinsip ilmiah</h3><p class="small">PAH 3–4 cincin pascakebakaran adalah target remediasi utama, dengan fenantren sebagai PAH model. Istilah yang dipakai: reduksi PAH, bioavailabilitas lebih rendah, biodegradasi, residual risk.</p></div><div class="card flat"><h3>PeatScan = skrining awal</h3><p class="small">Hanya memberi Low/Moderate/High PAH Risk dan tidak pernah ditampilkan sebagai konsentrasi laboratorium.</p></div><div class="card flat"><h3>Transparansi</h3><p class="small">Jendela transisi adalah target desain. Tidak ada klaim penghilangan seluruh polutan. Semua data pada prototipe ini adalah data demonstrasi.</p></div></div>
      <div class="row mt" style="justify-content:center"><a class="btn" href="#/command">Mulai Menjelajah Prototipe</a></div></section>
      <footer class="lfoot">© 2026 RE-SOIL · Prototipe kompetisi inovasi ilmiah · Data pada aplikasi ini adalah data demonstrasi, bukan hasil lapangan/laboratorium nyata.</footer></div>`;
    }
  };

  /* ===== Command Center ===== */
  P.command = {
    title: 'Restoration Command Center',
    render() {
      const S = D.sites, area = S.reduce((a, s) => a + s.area, 0), act = activeAlerts(), dep = D.deployments.filter(d => ['Deployed', 'Monitoring'].includes(d.status)).length;
      const gs = S.filter(s => s.germ), surv = Math.round(gs.reduce((a, s) => a + s.germ.survival * s.area, 0) / gs.reduce((a, s) => a + s.area, 0));
      const ph = D.PHASES.map(p => [p, S.filter(s => s.phase === p).length]);
      const L = D.MONTHS, col = k => L.map((_, i) => Math.round(avg(S.map(s => s.env[k][i])) * 10) / 10);
      const wk = [0, 2, 4, 6, 8, 10, 12], pahT = wk.map(w => { const v = S.filter(s => s.pah && s.pah.weeks.includes(w)).map(s => s.pah.res[s.pah.weeks.indexOf(w)]); return v.length ? Math.round(avg(v)) : null; });
      return `<div class="pagehead"><div><div class="eyebrow">ASSESS → PRIORITIZE → DEPLOY → MONITOR → REPORT → EVALUATE → ADAPT</div><h1>Restoration Command Center</h1><p>Ringkasan seluruh site restorasi gambut pascakebakaran per 8 Oktober 2026 (data demo).</p></div><a class="btn" href="#/reports">+ Laporan baru</a></div>
      <div class="grid g4">${kpi('Total site restorasi', S.length, 'di ' + new Set(S.map(s => s.prov)).size + ' provinsi')}${kpi('Total area terpantau', U.fmt(area) + ' ha')}${kpi('Deployment aktif', dep, 'Deployed + Monitoring')}${kpi('Site fase Detox', ph[1][1], 'detoks PAH berjalan', 'brown')}${kpi('Site fase Regeneration', S.filter(s => s.phase === 'Regenerate').length, 'Regenerate')}${kpi('Survival bibit', surv + '%', 'rerata berbobot luas')}${kpi('Peringatan aktif', act.length, act.filter(a => a.severity === 'Kritis').length + ' kritis', act.length ? 'bad' : '')}${kpi('Vegetasi terkini', Math.round(avg(S.map(s => s.veg))) + '%', 'rerata tutupan')}</div>
      <div class="card mt"><h3>Distribusi fase restorasi</h3><div class="stack">${ph.map(p => `<i style="width:${p[1] / S.length * 100}%;background:${U.PHASE_COLOR[p[0]]}" title="${p[0]}: ${p[1]}"></i>`).join('')}</div><div class="legend">${ph.map(p => `<span><i style="background:${U.PHASE_COLOR[p[0]]}"></i>${p[0]} (${p[1]})</span>`).join('')}</div></div>
      <div class="grid g21 mt"><div class="card"><h3>Peta interaktif (pratinjau) <a href="#/map" class="small">Peta penuh →</a></h3>${parts.mapHTML('mapCmd', { compact: true, def: ['moisture', 'alerts'] })}</div>
      <div class="card"><h3>Peringatan teratas <a href="#/alerts" class="small">Semua →</a></h3>${act.length ? act.slice(0, 5).map(a => `<div class="alert card flat sev-${a.severity}" style="margin-bottom:8px;padding:10px 12px"><div class="row between"><b class="small">${esc(a.type)}</b>${badge(a.severity)}</div><div class="small muted">${esc(U.siteName(a.site))} · ${esc(a.ts)}</div></div>`).join('') : empty('Tidak ada peringatan aktif', 'Semua site dalam kondisi terpantau.')}</div></div>
      <div class="grid g2 mt"><div class="card"><h3>Tren kelembapan tanah (rerata)</h3>${line({ labels: L, series: [{ name: 'Kelembapan', data: col('moisture'), color: '#2f6fa3' }], unit: '%' })}</div><div class="card"><h3>Tren muka air tanah (cm, rerata)</h3>${line({ labels: L, series: [{ name: 'Muka air', data: col('gw'), color: '#6e4b2e' }], unit: ' cm' })}</div>
      <div class="card"><h3>Tren PAH — residual fenantren ${U.labTag}</h3>${line({ labels: wk.map(w => 'M' + w), series: [{ name: 'Residual (% dari awal)', data: pahT, color: '#b3362b' }], unit: '%', min: 0, max: 100 })}<p class="small muted">Rerata site dengan data laboratorium. Menunjukkan reduksi PAH, bukan penghilangan total.</p></div><div class="card"><h3>Pemulihan vegetasi</h3>${line({ labels: L, series: [{ name: 'Tutupan (%)', data: col('veg'), color: '#4a8a5c' }], unit: '%' })}</div></div>`;
    },
    mount(a, root) { parts.mapMount(root); }
  };

  /* ===== Peta Kondisi Gambut ===== */
  P.map = {
    title: 'Peta Kondisi Gambut',
    render() {
      return `<div class="pagehead"><div><div class="eyebrow">ASSESS</div><h1>Peta Kondisi Gambut</h1><p>Aktifkan beberapa lapisan sekaligus. Cincin konsentris menandai variabel kontinu; ikon kecil menandai sampling PAH, deployment, regenerasi, dan peringatan.</p></div></div><div class="card">${parts.mapHTML('mapMain', { def: ['moisture', 'fire', 'alerts', 'deploy'] })}</div>
      <div class="card mt"><h3>Status site</h3><div class="grid g4">${['Critical', 'Intervention', 'Watch', 'Recovering'].map(k => kpi(k, D.sites.filter(s => s.status === k).length, D.sites.filter(s => s.status === k).map(s => s.id).join(', ') || '—', k === 'Critical' ? 'bad' : k === 'Intervention' ? 'warn' : '')).join('')}</div></div>`;
    },
    mount(a, root) { parts.mapMount(root); }
  };

  /* ===== Daftar Site ===== */
  P.sites = {
    title: 'Daftar Site',
    render() {
      return `<div class="pagehead"><div><div class="eyebrow">ASSESS</div><h1>Daftar Site Restorasi</h1><p>Cari dan filter site. Klik baris untuk membuka halaman detail.</p></div></div>
      <div class="toolbar"><input type="search" id="q" placeholder="Cari nama site, provinsi…" aria-label="Cari"><select id="fs"><option value="">Semua status</option>${['Critical', 'Intervention', 'Watch', 'Recovering'].map(x => `<option>${x}</option>`).join('')}</select><select id="fp"><option value="">Semua fase</option>${D.PHASES.map(x => `<option>${x}</option>`).join('')}</select></div><div id="list"></div>`;
    },
    mount(a, root) {
      const draw = () => {
        const q = root.querySelector('#q').value.toLowerCase(), fs = root.querySelector('#fs').value, fp = root.querySelector('#fp').value;
        const rows = D.sites.filter(s => (!q || (s.name + s.prov + s.kab).toLowerCase().includes(q)) && (!fs || s.status === fs) && (!fp || s.phase === fp));
        root.querySelector('#list').innerHTML = table([['Site', r => `<b>${esc(r.name)}</b><div class="small muted">${esc(r.prov)}</div>`], ['Status', r => badge(r.status)], ['Fase', r => badge(r.phase)], ['Luas', r => r.area + ' ha'], ['Kelembapan', r => r.moisture + '%'], ['Muka air', r => r.gw + ' cm'], ['Vegetasi', r => r.veg + '%'], ['Prioritas', r => badge(C.sitePriority(r).cat.slice(0, 10), C.sitePriority(r).total >= 70 ? 'bad' : C.sitePriority(r).total >= 55 ? 'warn' : C.sitePriority(r).total >= 35 ? 'info' : 'ok')]], rows, { rowAttr: r => `data-go="#/site/${r.id}"`, empty: 'Tidak ada site yang cocok', emptyHint: 'Coba hapus sebagian filter.' });
      };
      root.addEventListener('input', draw); root.addEventListener('change', draw);
      root.addEventListener('click', e => { const t = e.target.closest('[data-go]'); if (t) location.hash = t.dataset.go; }); draw();
    }
  };

  /* ===== Detail Site ===== */
  P.site = {
    title: 'Detail Site',
    render(a) {
      const s = D.sites.find(x => x.id === a[0]);
      if (!s) return empty('Site tidak ditemukan', 'Periksa kembali tautan atau pilih dari daftar site.', `<a class="btn sec sm" href="#/sites">Ke daftar site</a>`);
      const pr = C.sitePriority(s), hy = C.hydro(s.gw, s.moisture), dps = D.deployments.filter(d => d.site === s.id), al = RS.state.alerts.filter(x => x.site === s.id), rp = RS.state.reports.filter(x => x.site === s.id);
      const info = `<div class="grid g2"><div class="card flat"><dl class="kv"><dt>ID Site</dt><dd>${s.id}</dd><dt>Nama</dt><dd>${esc(s.name)}</dd><dt>Lokasi</dt><dd>${esc(s.kab)}, ${esc(s.prov)}</dd><dt>Koordinat</dt><dd>${s.lat}, ${s.lon}</dd><dt>Luas</dt><dd>${s.area} ha</dd><dt>Status</dt><dd>${badge(s.status)}</dd><dt>Fase</dt><dd>${badge(s.phase)}</dd><dt>Aksesibilitas</dt><dd>${s.access}/100</dd></dl></div>
      <div class="card flat"><h3>Riwayat kebakaran</h3>${table([['Tahun', r => r.year], ['Keparahan', r => r.severity + '/100'], ['Area terbakar', r => r.areaBurned + ' ha']], s.fireHistory)}<div class="mt row"><span class="muted small">Priority Index:</span>${badge(pr.cat, pr.total >= 70 ? 'bad' : pr.total >= 55 ? 'warn' : 'info')} <b>${pr.total}</b></div></div></div>`;
      const phase = `<div class="steps">${D.PHASES.map((p, i) => `<div class="stp ${i < D.PHASES.indexOf(s.phase) ? 'done' : i === D.PHASES.indexOf(s.phase) ? 'cur' : ''}">${p}</div>`).join('')}</div><p class="note mt"><b>${s.phase}:</b> ${esc(PHASE_ID[s.phase])}.</p>${s.phase === 'Precondition' ? `<p class="note red">Hidrologi: ${hy === 'REWET' ? 'REWET FIRST — deployment RE-SOIL belum direkomendasikan.' : 'dinilai pada Deployment Planner.'}</p>` : ''}`;
      const dep = dps.length ? table([['ID', r => r.id], ['Batch', r => r.batch], ['Tanggal', r => r.date], ['Bead', r => U.fmt(r.beads)], ['Titik', r => r.points], ['Tim', r => esc(r.staff.join(', '))], ['Status', r => badge(r.status)]], dps) : empty('Belum ada deployment', 'Site ini belum menerima bead RE-SOIL.', `<a class="btn sec sm" href="#/planner">Rencanakan deployment</a>`);
      const rep = rp.length ? table([['ID', r => r.id], ['Jenis', r => esc(r.type)], ['Tanggal', r => r.date], ['Tingkat', r => badge(r.severity)], ['Status', r => badge(r.status)]], rp) : empty('Belum ada laporan', 'Tidak ada laporan untuk site ini.');
      const alt = al.length ? al.map(x => `<div class="alert card flat sev-${x.severity}" style="margin-bottom:10px"><div class="row between"><b>${esc(x.type)}</b><span>${badge(x.severity)} ${badge(x.status)}</span></div><p class="small">${esc(x.reason)}</p><p class="small"><b>Rekomendasi:</b> ${esc(x.reco)}</p><span class="small muted">${esc(x.ts)}</span></div>`).join('') : empty('Tidak ada peringatan', 'Site ini tidak memiliki peringatan.');
      return `<div class="pagehead"><div><a class="small" href="#/sites">← Daftar site</a><h1>${esc(s.name)}</h1><div class="row">${badge(s.status)}${badge(s.phase)}<span class="muted small">${esc(s.prov)} · ${s.area} ha</span></div></div></div>` + U.tabs('sd', [
        { k: 'info', label: 'Informasi Site', html: info }, { k: 'env', label: 'Kondisi Lingkungan', html: parts.envBadges(s) + '<div class="mt"></div>' + parts.envCharts(s) }, { k: 'phase', label: 'Fase Restorasi', html: phase }, { k: 'dep', label: 'Riwayat Deployment', html: dep },
        { k: 'pah', label: 'Monitoring PAH', html: parts.detoxPanel(s, true) }, { k: 'veg', label: 'Monitoring Vegetasi', html: parts.regenPanel(s) + `<div class="card mt"><h3>Tutupan vegetasi</h3>${line({ labels: s.env.labels, series: [{ name: 'Tutupan', data: s.env.veg, color: '#4a8a5c' }], unit: '%' })}</div>` },
        { k: 'rep', label: 'Laporan', html: rep }, { k: 'alr', label: 'Peringatan', html: alt }, { k: 'rec', label: 'Rekomendasi Adaptif', html: parts.recPanel(s) }]);
    }
  };
})();
