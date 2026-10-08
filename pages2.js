/* Halaman 2: PeatScan, Priority Index, Deployment Planner, Batch Tracker */
(function () {
  const U = RS.ui, { esc, badge, kpi, table, empty } = U, C = RS.calc, D = RS.data, P = RS.pages, parts = RS.parts;
  const role = () => RS.state.role, uid = p => p + '-' + Date.now().toString(36).slice(-5).toUpperCase();
  const DISCLAIMER = 'PeatScan is a preliminary screening tool and does not replace laboratory PAH analysis.';

  /* ===== PeatScan ===== */
  P.peatscan = {
    title: 'PeatScan',
    render() {
      const sc = RS.state.scans;
      return `<div class="pagehead"><div><div class="eyebrow">ASSESS · Skrining awal</div><h1>PeatScan</h1><p>Skrining risiko PAH awal berbasis foto tanah. Hasil hanya berupa kategori risiko — bukan konsentrasi PAH.</p></div></div>
      <div class="note red mb"><b>${DISCLAIMER}</b></div>
      <div class="grid g2"><div class="card"><h3>1 · Input</h3><div class="form">
        <div class="full drop" id="drop"><p id="dropMsg">Unggah foto tanah (permukaan gambut, cahaya merata) atau gunakan simulasi kamera.</p><div id="prev"></div><div class="row" style="justify-content:center"><label class="btn sec sm" for="file">📁 Unggah / ambil foto</label><input id="file" type="file" accept="image/*" capture="environment" hidden><button class="btn sec sm" id="sim" type="button">📷 Simulasi kamera</button></div></div>
        <label class="f full"><span>Kartu warna referensi</span><span class="row"><input type="checkbox" id="card"> <span style="font-weight:400">Kartu warna referensi terlihat di dalam foto (wajib)</span></span></label>
        <label class="f">Lokasi<select id="loc"><option value="">Lokasi lain / belum terdaftar</option>${D.sites.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></label>
        <label class="f">Riwayat kebakaran<select id="fh"><option value="0">Tidak pernah terbakar</option><option value="1">Terbakar &gt; 3 tahun lalu</option><option value="2" selected>Terbakar 1–3 tahun lalu</option><option value="3">Terbakar &lt; 1 tahun lalu</option><option value="4">Terbakar berulang (≥ 2 kali)</option></select></label>
        <div class="full"><button class="btn" id="go" disabled>Jalankan skrining</button> <span class="muted small" id="hint">Lengkapi foto dan kartu referensi.</span></div></div></div>
      <div class="card"><h3>2 · Hasil skrining</h3><div id="out">${empty('Belum ada hasil', 'Jalankan skrining untuk melihat kategori risiko.')}</div></div></div>
      <div class="card mt"><h3>Riwayat skrining (kategori saja)</h3><div id="hist"></div></div>`;
    },
    mount(a, root) {
      let img = null, seedName = '';
      const $ = s => root.querySelector(s), go = $('#go');
      const check = () => { const ok = img && $('#card').checked; go.disabled = !ok; $('#hint').textContent = ok ? '' : 'Lengkapi foto dan kartu referensi.'; };
      const setImg = (src, name) => { seedName = name; img = new Image(); img.onload = check; img.src = src; $('#prev').innerHTML = `<img alt="Pratinjau foto tanah" src="${src}">`; check(); };
      const hist = () => { $('#hist').innerHTML = table([['ID', r => r.id], ['Waktu', r => esc(r.ts)], ['Lokasi', r => esc(r.site)], ['Hasil', r => badge(r.label)]], RS.state.scans.slice().reverse(), { empty: 'Belum ada riwayat', emptyHint: 'Hasil skrining Anda akan tercatat di sini.' }); };
      $('#file').onchange = e => { const f = e.target.files[0]; if (f) setImg(URL.createObjectURL(f), f.name); };
      $('#card').onchange = check;
      $('#sim').onclick = () => {
        try {
          const c = document.createElement('canvas'); c.width = 320; c.height = 200; const x = c.getContext('2d');
          x.fillStyle = '#3d2c1e'; x.fillRect(0, 0, 320, 200);
          for (let i = 0; i < 700; i++) { x.fillStyle = `rgba(${20 + Math.random() * 60},${15 + Math.random() * 40},${10 + Math.random() * 30},.6)`; x.fillRect(Math.random() * 320, Math.random() * 200, 3 + Math.random() * 6, 3 + Math.random() * 6); }
          ['#fff', '#888', '#c33', '#3a3', '#33c'].forEach((col, i) => { x.fillStyle = col; x.fillRect(10 + i * 22, 10, 20, 20); });
          setImg(c.toDataURL('image/png'), 'simulasi-kamera');
        } catch (e) { img = {}; seedName = 'simulasi-kamera'; $('#prev').innerHTML = '<p class="muted">Gambar simulasi dibuat.</p>'; check(); }
        $('#card').checked = true; check(); U.toast('Foto simulasi dibuat (kartu referensi disertakan)');
      };
      const lum = () => {
        try { const c = document.createElement('canvas'); c.width = c.height = 24; const x = c.getContext('2d'); x.drawImage(img, 0, 0, 24, 24); const d = x.getImageData(0, 0, 24, 24).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += .299 * d[i] + .587 * d[i + 1] + .114 * d[i + 2]; return s / (d.length / 4); }
        catch (e) { let h = 0; for (const ch of seedName) h = (h * 31 + ch.charCodeAt(0)) % 100; return 40 + h; }
      };
      go.onclick = () => {
        $('#out').innerHTML = `<div class="skel"><div class="sk"></div></div>`; go.disabled = true;
        setTimeout(() => {
          const site = D.sites.find(s => s.id === $('#loc').value), fh = [0, 14, 24, 32, 38][+$('#fh').value], sr = site ? { Low: 0, Moderate: 8, High: 16 }[site.pahRisk] : 8;
          const score = (1 - lum() / 255) * 45 + fh + sr, label = score < 38 ? 'Low PAH Risk' : score < 62 ? 'Moderate PAH Risk' : 'High PAH Risk', k = label.startsWith('High') ? 'bad' : label.startsWith('Mod') ? 'warn' : 'ok';
          $('#out').innerHTML = `<div class="result ${k}"><b>${label}</b>${label.startsWith('High') ? '<p style="margin:.6em 0 0"><b>Laboratory Verification Recommended.</b></p>' : ''}</div><p class="note red mt">${DISCLAIMER}</p>`;
          RS.state.scans.push({ id: uid('PS'), ts: new Date().toISOString().slice(0, 16).replace('T', ' '), site: site ? site.id : 'Lokasi lain', label }); RS.save(); hist(); go.disabled = false;
        }, RS.fast ? 0 : 1100);
      };
      hist();
    }
  };

  /* ===== Priority Index ===== */
  const prKind = t => t >= 70 ? 'bad' : t >= 55 ? 'warn' : t >= 35 ? 'info' : 'ok';
  P.priority = {
    title: 'Restoration Priority Index',
    render() {
      const s0 = D.sites[0];
      const sl = (id, lab, v, mx) => `<label class="f"><span class="row between"><span>${lab}</span><b id="${id}v">${v}</b></span><input type="range" id="${id}" min="0" max="${mx}" value="${v}"></label>`;
      return `<div class="pagehead"><div><div class="eyebrow">PRIORITIZE</div><h1>Restoration Priority Index</h1><p>Skor demonstrasi (0–100) dari tujuh faktor. Geser parameter atau muat data site.</p></div></div>
      <div class="grid g2"><div class="card"><h3>Parameter</h3><div class="form"><label class="f full">Muat dari site<select id="pre"><option value="">— kustom —</option>${D.sites.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></label>
      ${sl('fire', 'Keparahan kebakaran (0–100)', s0.fireSev, 100)}${sl('moi', 'Kelembapan tanah (%)', s0.moisture, 100)}${sl('gw', 'Muka air tanah (cm di bawah permukaan)', s0.gw, 120)}${sl('vl', 'Kehilangan vegetasi (%)', 100 - s0.veg, 100)}${sl('acc', 'Aksesibilitas (0–100)', s0.access, 100)}
      <label class="f">Risiko PAH (skrining/laboratorium)<select id="pah"><option>Low</option><option>Moderate</option><option selected>High</option></select></label><label class="f">Intervensi sebelumnya<span class="row"><input type="checkbox" id="prev" checked> <span style="font-weight:400">Sudah pernah ada intervensi</span></span></label></div></div>
      <div class="card" id="res"></div></div>
      <div class="card mt"><h3>Peringkat seluruh site</h3>${table([['Site', r => `<b>${esc(r.s.name)}</b>`], ['Skor', r => `<b>${r.p.total}</b>`], ['Kategori', r => badge(r.p.cat, prKind(r.p.total))], ['', r => `<button class="btn sec sm" data-load="${r.s.id}">Muat</button>`]], D.sites.map(s => ({ s, p: C.sitePriority(s) })).sort((x, y) => y.p.total - x.p.total))}</div>`;
    },
    mount(a, root) {
      const $ = s => root.querySelector(s), ids = ['fire', 'moi', 'gw', 'vl', 'acc'];
      const calc = () => {
        ids.forEach(i => $('#' + i + 'v').textContent = $('#' + i).value);
        const r = C.priority({ fireSev: +$('#fire').value, moisture: +$('#moi').value, gw: +$('#gw').value, vegLoss: +$('#vl').value, pahRisk: $('#pah').value, prev: $('#prev').checked, access: +$('#acc').value });
        const maxes = C.PRIORITY_WEIGHTS;
        $('#res').innerHTML = `<h3>Hasil</h3><div class="row" style="justify-content:space-around">${U.gauge(r.total, '/ 100', r.total >= 70 ? '#b3362b' : r.total >= 55 ? '#c8801f' : r.total >= 35 ? '#2f6fa3' : '#3c8a52')}<div style="flex:1;min-width:200px">${badge(r.cat, prKind(r.total))}<p class="small muted mt">Prioritas 1 ≥ 70 · Prioritas 2 ≥ 55 · Prioritas 3 ≥ 35 · Prioritas 4 &lt; 35</p></div></div><h4 class="mt">Faktor penyumbang skor</h4><div class="bars">${maxes.map((m, i) => `<div class="br"><span>${m[0]}</span><div class="tr"><i style="width:${r.parts[i] / m[1] * 100}%"></i></div><b>${r.parts[i].toFixed(1)}/${m[1]}</b></div>`).join('')}</div><p class="note mt small">Skor ini pendukung keputusan (demonstrasi). Prioritas tinggi pada site kering tetap berarti <b>rewetting dulu</b>, bukan langsung deployment.</p>`;
      };
      const load = id => { const s = D.sites.find(x => x.id === id); if (!s) return; $('#fire').value = s.fireSev; $('#moi').value = s.moisture; $('#gw').value = s.gw; $('#vl').value = 100 - s.veg; $('#acc').value = s.access; $('#pah').value = s.pahRisk; $('#prev').checked = s.prev; $('#pre').value = id; calc(); };
      root.addEventListener('input', e => { if (e.target.id === 'pre') load(e.target.value); else calc(); }); root.addEventListener('change', calc);
      root.addEventListener('click', e => { const b = e.target.closest('[data-load]'); if (b) { load(b.dataset.load); window.scrollTo && window.scrollTo({ top: 0, behavior: 'smooth' }); } });
      calc();
    }
  };

  /* ===== Deployment Planner ===== */
  P.planner = {
    title: 'Deployment Planner',
    render() {
      const ready = RS.state.batches.filter(b => b.status === 'Ready');
      return `<div class="pagehead"><div><div class="eyebrow">DEPLOY</div><h1>Deployment Planner</h1><p>Periksa kelayakan hidrologi sebelum merencanakan titik, jumlah bead, tanggal, tim, dan batch.</p></div></div>
      <div class="grid g2"><div class="card"><h3>Kondisi site</h3><div class="form"><label class="f full">Site${U.siteSelect('ps', 'S02')}</label>
      <label class="f">Luas area (ha)<input type="number" id="area" min="0.1" step="0.1"></label><label class="f">Kelembapan tanah (%)<input type="number" id="moi" min="0" max="100"></label><label class="f">Muka air tanah (cm di bawah permukaan)<input type="number" id="gw" min="0" max="200"></label>
      <label class="f">Status PAH<select id="pahs"><option value="High">Tinggi (Laboratory Verified)</option><option value="Moderate">Sedang</option><option value="Low">Rendah</option><option value="Unknown">Belum diketahui (perlu sampling)</option></select></label><label class="f">Tutupan vegetasi (%)<input type="number" id="veg" min="0" max="100"></label>
      <label class="f full">Batch RE-SOIL (status Ready)<select id="batch">${ready.length ? ready.map(b => `<option value="${b.id}">${b.id} · viabilitas biji ${b.viab}%</option>`).join('') : '<option value="">— tidak ada batch Ready —</option>'}</select></label></div></div>
      <div id="decision"></div></div><div id="planform"></div>
      <div class="card mt"><h3>Rencana tersimpan</h3><div id="plans"></div></div>`;
    },
    mount(a, root) {
      const $ = s => root.querySelector(s); let first = true;
      const fill = () => { const s = D.sites.find(x => x.id === $('#ps').value); $('#area').value = s.area; $('#moi').value = s.moisture; $('#gw').value = s.gw; $('#pahs').value = s.pahRisk; $('#veg').value = s.veg; eva(); };
      const plans = () => {
        $('#plans').innerHTML = table([['ID', r => r.id], ['Site', r => esc(U.siteName(r.site))], ['Batch', r => r.batch], ['Titik', r => r.points], ['Bead', r => U.fmt(r.beads)], ['Tanggal', r => r.date], ['Tim', r => esc(r.staff.join(', ') || '—')], ['Koordinat', r => r.lat + ', ' + r.lon], ['', r => `<button class="btn sec sm" data-del="${r.id}">Hapus</button>`]], RS.state.plans, { empty: 'Belum ada rencana', emptyHint: 'Rencana yang Anda simpan akan muncul di sini.' });
      };
      const eva = () => {
        const gw = +$('#gw').value, mo = +$('#moi').value, area = +$('#area').value || 0, hy = C.hydro(gw, mo), pah = $('#pahs').value, veg = +$('#veg').value, bid = $('#batch').value, b = RS.state.batches.find(x => x.id === bid), s = D.sites.find(x => x.id === $('#ps').value);
        let dec;
        if (hy === 'REWET') dec = `<div class="decision bad"><div class="eyebrow" style="color:#f6d8d4">KEPUTUSAN</div><b>REWET FIRST</b><p>RE-SOIL deployment is not recommended yet. Muka air tanah ${gw} cm (ambang ≤ 40 cm) dan/atau kelembapan ${mo}% (ambang ≥ 55%).</p><p class="small">Langkah: penyekatan kanal, pembasahan ulang, pantau hingga hidrologi stabil, lalu nilai ulang.</p></div>`;
        else if (hy === 'MARGINAL') dec = `<div class="decision warn"><div class="eyebrow" style="color:#fbe6c4">KEPUTUSAN</div><b>HIDROLOGI MARGINAL</b><p>Lanjutkan rewetting dan pantau mingguan. Deployment dapat dipertimbangkan setelah muka air ≤ 30 cm dan kelembapan ≥ 60%.</p></div>`;
        else dec = `<div class="decision ok"><div class="eyebrow" style="color:#d4ecda">KEPUTUSAN</div><b>READY FOR RE-SOIL DEPLOYMENT</b><p>Hidrologi dasar sesuai (muka air ${gw} cm, kelembapan ${mo}%).</p></div>`;
        const notes = []; if (pah === 'Low') notes.push('Risiko PAH rendah: pertimbangkan fokus pada rewetting dan revegetasi; detoks berbasis bead mungkin tidak diperlukan.'); if (pah === 'Unknown') notes.push('Status PAH belum diketahui: lakukan sampling dan verifikasi laboratorium sebelum deployment.'); if (veg >= 70) notes.push('Tutupan vegetasi sudah tinggi; evaluasi apakah deployment masih diperlukan.'); if (b && b.viab < 75) notes.push('Viabilitas biji batch ini &lt; 75% — pertimbangkan batch lain.');
        $('#decision').innerHTML = dec + (notes.length ? `<div class="note mt small">${notes.map(n => '• ' + n).join('<br>')}</div>` : '');
        const can = hy === 'READY' && b;
        $('#planform').innerHTML = hy === 'READY' ? (can ? `<div class="card mt"><h3>Rencana deployment</h3><div class="form"><label class="f">Jumlah titik deployment<input type="number" id="pts" min="1" value="${Math.max(1, Math.round(area * .25))}"></label><label class="f">Jumlah bead<small>Saran demo: ±2.500 bead/ha</small><input type="number" id="bds" min="1" value="${Math.round(area * 2500)}"></label><label class="f">Tanggal<input type="date" id="dt" value="2026-10-20"></label><label class="f">Batch<input id="bt" value="${esc(bid)}" readonly></label><label class="f">Latitude<input type="number" step="any" id="lat" value="${s.lat}"></label><label class="f">Longitude<input type="number" step="any" id="lon" value="${s.lon}"></label><div class="full"><b class="small">Tim lapangan</b><div class="chips mt">${D.staff.map(n => `<label class="chip"><input type="checkbox" name="st" value="${esc(n)}"> ${esc(n)}</label>`).join('')}</div></div><div class="full"><button class="btn" id="save">Simpan rencana</button></div></div></div>` : `<div class="card mt">${empty('Tidak ada batch Ready', 'Selesaikan validasi laboratorium batch terlebih dulu pada Batch Tracker.', '<a class="btn sec sm" href="#/batches">Ke Batch Tracker</a>')}</div>`) : '';
      };
      root.addEventListener('change', e => { if (e.target.id === 'ps') fill(); else if (['area', 'moi', 'gw', 'pahs', 'veg', 'batch'].includes(e.target.id)) eva(); });
      root.addEventListener('input', e => { if (['area', 'moi', 'gw', 'veg'].includes(e.target.id)) eva(); });
      root.addEventListener('click', e => {
        if (e.target.id === 'save') { const staff = [...root.querySelectorAll('[name=st]:checked')].map(i => i.value); RS.state.plans.push({ id: uid('PLN'), site: $('#ps').value, area: +$('#area').value, batch: $('#bt').value, points: +$('#pts').value, beads: +$('#bds').value, date: $('#dt').value, staff, lat: $('#lat').value, lon: $('#lon').value }); RS.save(); plans(); U.toast('Rencana deployment disimpan'); }
        const d = e.target.closest('[data-del]'); if (d) { RS.state.plans = RS.state.plans.filter(p => p.id !== d.dataset.del); RS.save(); plans(); }
      });
      fill(); plans();
    }
  };

  /* ===== Batch Tracker ===== */
  const FLOW = ['Lab Validation', 'Ready', 'Deployed', 'Monitoring', 'Completed'];
  P.batches = {
    title: 'RE-SOIL Batch Tracker',
    render() {
      return `<div class="pagehead"><div><div class="eyebrow">DEPLOY · Ketertelusuran</div><h1>RE-SOIL Batch Tracker</h1><p>Identitas, komposisi, viabilitas biji, dan lokasi deployment setiap batch Phytobead. Jendela rilis adalah target desain.</p></div></div>
      <div class="toolbar"><input type="search" id="q" placeholder="Cari ID batch…" aria-label="Cari batch"><div class="chips" id="chips"><span class="chip on" data-st="">Semua</span>${FLOW.map(f => `<span class="chip" data-st="${f}">${f}</span>`).join('')}</div></div><div id="list" class="grid g3"></div>`;
    },
    mount(a, root) {
      let st = '';
      const draw = () => {
        const q = root.querySelector('#q').value.toLowerCase(), rows = RS.state.batches.filter(b => (!st || b.status === st) && (!q || b.id.toLowerCase().includes(q)));
        root.querySelector('#list').innerHTML = rows.length ? rows.map(b => `<div class="card bcard" data-b="${b.id}" tabindex="0">${U.qr(b.id, 92)}<div><b>${b.id}</b><div class="small muted">Produksi ${b.prod}</div><div class="mt row">${badge(b.status)}</div><div class="small muted mt">${b.loc ? esc(U.siteName(b.loc)) : 'Belum ditempatkan'} · biji ${b.viab}%</div></div></div>`).join('') : `<div style="grid-column:1/-1">${empty('Batch tidak ditemukan', 'Ubah filter status atau kata kunci.')}</div>`;
      };
      const open = id => {
        const b = RS.state.batches.find(x => x.id === id), c = D.consortia.find(x => x.id === b.cons), i = FLOW.indexOf(b.status), can = ['admin', 'researcher'].includes(role());
        U.modal(`<div class="row between"><div><div class="eyebrow">Identitas batch</div><h2>${b.id}</h2></div>${U.qr(b.id, 110)}</div>
        <div class="steps mb">${FLOW.map((f, k) => `<div class="stp ${k < i ? 'done' : k === i ? 'cur' : ''}">${f}</div>`).join('')}</div>
        <dl class="kv"><dt>Tanggal produksi</dt><dd>${b.prod}</dd><dt>Formulasi alginat</dt><dd>${esc(b.alg)}</dd><dt>Rasio biochar</dt><dd>${esc(b.biochar)}</dd><dt>Lapisan transisi</dt><dd>${esc(b.layer)}</dd><dt>Konsorsium mikroba</dt><dd>${b.cons} — ${esc(c.isolates)}<div class="small muted">Target: ${esc(c.target)} · degradasi lab 28 hari ±${c.degr28}% (demo)</div></dd><dt>Batch biji Dyera polyphylla</dt><dd>${b.seed}</dd><dt>Viabilitas biji</dt><dd>${b.viab}% ${b.viab < 75 ? badge('Rendah', 'warn') : ''}</dd><dt>Jendela rilis</dt><dd>${esc(b.window)}</dd><dt>Lokasi deployment</dt><dd>${b.loc ? esc(U.siteName(b.loc)) : '—'}</dd><dt>Status</dt><dd>${badge(b.status)}</dd></dl>
        <p class="note small mt">Jendela rilis merupakan <b>target desain</b>, bukan waktu pelepasan yang dijamin. QR di atas adalah komponen gaya-QR demonstrasi.</p>
        ${can && i < FLOW.length - 1 ? `<button class="btn mt" id="adv">Majukan status → ${FLOW[i + 1]}</button>` : ''}`);
        const adv = document.getElementById('adv'); if (adv) adv.onclick = () => { b.status = FLOW[i + 1]; RS.save(); U.closeModal(); draw(); open(id); U.toast('Status batch diperbarui'); };
      };
      root.addEventListener('input', draw);
      root.addEventListener('click', e => { const c = e.target.closest('[data-st]'); if (c) { st = c.dataset.st; root.querySelectorAll('#chips .chip').forEach(x => x.classList.toggle('on', x === c)); draw(); } const b = e.target.closest('[data-b]'); if (b) open(b.dataset.b); });
      root.addEventListener('keydown', e => { if (e.key === 'Enter') { const b = e.target.closest('[data-b]'); if (b) open(b.dataset.b); } });
      draw();
    }
  };
})();
