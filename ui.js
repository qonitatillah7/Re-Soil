/* UI helpers: escape, badge, chart SVG, QR-style identity, modal, toast, tabs, table */
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const KIND = {
    bad: ['Critical', 'Kritis', 'High', 'Tinggi', 'Poor', 'Further Remediation Required', 'Action Required', 'High PAH Risk', 'Mendesak', 'REWET', 'Tinggi '],
    warn: ['Intervention', 'Sedang', 'Moderate', 'Developing', 'Detox in Progress', 'Moderate PAH Risk', 'Watch', 'Lab Validation', 'Aktif', 'Submitted', 'MARGINAL', 'Menunggu', 'Berjalan'],
    info: ['Reviewed', 'Ditinjau', 'Deployed', 'Monitoring', 'Transition Candidate', 'Dijadwalkan', 'Transition', 'Regenerate', 'Pemantauan', 'Transisi', 'Detox'],
    ok: ['Recovering', 'Low', 'Rendah', 'Stable', 'Strong Recovery', 'Resolved', 'Selesai', 'Completed', 'Low PAH Risk', 'Ready', 'READY', 'Lulus', 'Rutin']
  };
  const kindOf = t => { for (const k in KIND) if (KIND[k].includes(t)) return k; return 'neutral'; };
  const badge = (t, kind) => `<span class="badge ${kind || kindOf(t)}">${esc(t)}</span>`;
  const STATUS_COLOR = { Critical: '#b3362b', Intervention: '#d9822b', Watch: '#c9a227', Recovering: '#3f8f55' };
  const PHASE_COLOR = { Precondition: '#9a7248', Detox: '#c8801f', Transition: '#2f6fa3', Regenerate: '#4a8a5c', Monitoring: '#1c3a2a' };

  function line(o) {
    const W = 600, H = o.h || 230, L = 46, R = 14, T = 14, B = 28;
    const all = o.series.flatMap(s => s.data.filter(v => v != null));
    let mn = o.min != null ? o.min : Math.min(...all), mx = o.max != null ? o.max : Math.max(...all);
    if (o.min == null) { const d = (mx - mn) || 1; mn -= d * .12; mx += d * .12; }
    if (mx === mn) mx = mn + 1;
    const n = o.labels.length;
    const x = i => L + (n < 2 ? 0 : i * (W - L - R) / (n - 1)), y = v => T + (H - T - B) * (1 - (v - mn) / (mx - mn));
    let g = '';
    for (let i = 0; i <= 4; i++) { const v = mn + (mx - mn) * i / 4; g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${Math.round(v * 10) / 10}</text>`; }
    const step = Math.ceil(n / 8);
    o.labels.forEach((l, i) => { if (i % step === 0) g += `<text class="ax" x="${x(i)}" y="${H - 8}" text-anchor="middle">${esc(l)}</text>`; });
    if (o.ref) g += `<line x1="${L}" x2="${W - R}" y1="${y(o.ref.value)}" y2="${y(o.ref.value)}" stroke="#b3362b" stroke-dasharray="4 4"/><text class="ax" x="${W - R}" y="${y(o.ref.value) - 4}" text-anchor="end" fill="#b3362b">${esc(o.ref.label)}</text>`;
    o.series.forEach(s => {
      const pts = s.data.map((v, i) => v == null ? null : [x(i), y(v)]).filter(Boolean);
      g += `<path d="${pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('')}" fill="none" stroke="${s.color}" stroke-width="2.4" stroke-linejoin="round" ${s.dash ? 'stroke-dasharray="5 4"' : ''}/>`;
      s.data.forEach((v, i) => { if (v != null) g += `<circle cx="${x(i)}" cy="${y(v)}" r="3.2" fill="#fff" stroke="${s.color}" stroke-width="2"><title>${esc(s.name)} · ${esc(o.labels[i])}: ${v}${esc(o.unit || '')}</title></circle>`; });
    });
    return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title || 'grafik')}">${g}</svg><div class="legend">${o.series.map(s => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}${o.unit ? `<span class="muted">Satuan: ${esc(o.unit)}</span>` : ''}</div></div>`;
  }
  function bar(o) {
    const W = 600, H = o.h || 230, L = 46, R = 14, T = 14, B = 46, n = o.labels.length;
    const mx = o.max || Math.max(...o.data) * 1.15 || 1, bw = (W - L - R) / n;
    const y = v => T + (H - T - B) * (1 - v / mx);
    let g = '';
    for (let i = 0; i <= 4; i++) { const v = mx * i / 4; g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${Math.round(v * 10) / 10}</text>`; }
    o.data.forEach((v, i) => {
      const bx = L + i * bw + bw * .18, w = bw * .64, c = (o.colors && o.colors[i]) || o.color || '#4a8a5c', lab = String(o.labels[i]);
      g += `<rect x="${bx}" y="${y(v)}" width="${w}" height="${Math.max(0, y(0) - y(v))}" rx="6" fill="${c}"><title>${esc(lab)}: ${v}${esc(o.unit || '')}</title></rect><text class="ax" x="${bx + w / 2}" y="${y(v) - 5}" text-anchor="middle">${v}</text><text class="ax" x="${bx + w / 2}" y="${H - 24}" text-anchor="middle">${esc(lab.length > 14 ? lab.slice(0, 13) + '…' : lab)}</text>`;
    });
    return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title || 'grafik batang')}">${g}</svg>${o.unit ? `<div class="legend"><span class="muted">Satuan: ${esc(o.unit)}</span></div>` : ''}</div>`;
  }
  function gauge(score, label, color) {
    const r = 54, c = 2 * Math.PI * r, p = Math.max(0, Math.min(100, score)) / 100;
    return `<div class="gauge"><svg viewBox="0 0 140 140"><circle cx="70" cy="70" r="${r}" fill="none" stroke="#ece8dc" stroke-width="14"/><circle cx="70" cy="70" r="${r}" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${c * p} ${c}" transform="rotate(-90 70 70)"/><text x="70" y="72" text-anchor="middle" class="gnum">${score}</text><text x="70" y="92" text-anchor="middle" class="glab">${esc(label || '/100')}</text></svg></div>`;
  }
  function qr(text, size) {
    size = size || 128; let h = 7; for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const rnd = () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; };
    const N = 25, cell = size / N; let s = '';
    const finder = (ox, oy) => { s += `<rect x="${ox * cell}" y="${oy * cell}" width="${7 * cell}" height="${7 * cell}" fill="#1c3a2a"/><rect x="${(ox + 1) * cell}" y="${(oy + 1) * cell}" width="${5 * cell}" height="${5 * cell}" fill="#fff"/><rect x="${(ox + 2) * cell}" y="${(oy + 2) * cell}" width="${3 * cell}" height="${3 * cell}" fill="#1c3a2a"/>`; };
    const inF = (i, j) => (i < 8 && j < 8) || (i > N - 9 && j < 8) || (i < 8 && j > N - 9);
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (!inF(i, j) && rnd() > .52) s += `<rect x="${i * cell}" y="${j * cell}" width="${cell}" height="${cell}" fill="#1c3a2a"/>`;
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
    return `<svg class="qr" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Identitas batch ${esc(text)} (gaya QR demonstrasi)"><rect width="${size}" height="${size}" fill="#fff"/>${s}</svg>`;
  }
  const toast = msg => { const t = document.getElementById('toast'); if (!t) return; const d = document.createElement('div'); d.className = 'toast'; d.textContent = msg; t.appendChild(d); setTimeout(() => d.remove(), 3200); };
  function modal(html) {
    closeModal();
    const o = document.createElement('div'); o.className = 'overlay'; o.id = 'modal';
    o.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><button class="x" aria-label="Tutup" data-close>×</button>${html}</div>`;
    o.addEventListener('click', e => { if (e.target === o || e.target.closest('[data-close]')) closeModal(); });
    document.body.appendChild(o); return o;
  }
  const closeModal = () => { const m = document.getElementById('modal'); if (m) m.remove(); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  function tabs(id, items) {
    return `<div class="tabwrap"><div class="tabs" role="tablist">${items.map((t, i) => `<button class="tab ${i ? '' : 'on'}" role="tab" data-pane="${id}-${t.k}">${esc(t.label)}</button>`).join('')}</div>${items.map((t, i) => `<div class="pane ${i ? '' : 'on'}" id="${id}-${t.k}">${t.html}</div>`).join('')}</div>`;
  }
  document.addEventListener('click', e => {
    const t = e.target.closest('.tab[data-pane]'); if (!t) return;
    const w = t.closest('.tabwrap'); const kids = [...w.children];
    kids.filter(k => k.classList.contains('tabs')).forEach(tb => [...tb.children].forEach(b => b.classList.toggle('on', b === t)));
    kids.filter(k => k.classList.contains('pane')).forEach(p => p.classList.toggle('on', p.id === t.dataset.pane));
  });
  const table = (cols, rows, o) => {
    o = o || {};
    if (!rows.length) return empty(o.empty || 'Tidak ada data yang cocok', o.emptyHint || 'Ubah filter atau kata kunci pencarian.');
    return `<div class="tablewrap"><table class="tbl"><thead><tr>${cols.map(c => `<th>${esc(c[0])}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr ${o.rowAttr ? o.rowAttr(r) : ''}>${cols.map(c => `<td>${c[1](r)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  };
  const empty = (t, d, cta) => `<div class="empty"><div class="eico">◌</div><b>${esc(t)}</b><p>${esc(d || '')}</p>${cta || ''}</div>`;
  const skeleton = () => `<div class="skel"><div class="sk h1"></div><div class="grid g4"><div class="sk"></div><div class="sk"></div><div class="sk"></div><div class="sk"></div></div><div class="grid g2"><div class="sk big"></div><div class="sk big"></div></div></div>`;
  const kpi = (label, value, sub, tone) => `<div class="kpi ${tone || ''}"><span>${esc(label)}</span><b>${value}</b>${sub ? `<small>${sub}</small>` : ''}</div>`;
  const labTag = `<span class="labtag" title="Data hasil analisis laboratorium">LABORATORY DATA · Laboratory Verified</span>`;
  const fmt = n => Number(n).toLocaleString('id-ID');
  const siteName = id => { const s = RS.data.sites.find(x => x.id === id); return s ? s.name : id; };
  const siteSelect = (id, sel, list) => `<select id="${id}" aria-label="Pilih site">${(list || RS.data.sites).map(s => `<option value="${s.id}" ${s.id === sel ? 'selected' : ''}>${esc(s.name)} (${s.id})</option>`).join('')}</select>`;
  RS.ui = { esc, badge, kindOf, line, bar, gauge, qr, toast, modal, closeModal, tabs, table, empty, skeleton, kpi, labTag, fmt, siteName, siteSelect, STATUS_COLOR, PHASE_COLOR };
})();
