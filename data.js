/* RE-SOIL Digital Restoration Loop — DATA DEMO & LOGIKA RULE-BASED
   Semua angka adalah DATA DEMONSTRASI untuk prototipe, bukan data lapangan/laboratorium nyata. */
window.RS = window.RS || {};
(function () {
  const rng = (seed) => { let a = seed; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const r1 = (v) => Math.round(v * 10) / 10;
  const MONTHS = ['Nov', 'Des', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'];
  const RAIN = [320, 300, 280, 260, 200, 150, 100, 60, 50, 70, 110, 160];
  const PHASES = ['Precondition', 'Detox', 'Transition', 'Regenerate', 'Monitoring'];

  const sites = [
    { id: 'S01', name: 'Sebangau Blok A', prov: 'Kalimantan Tengah', kab: 'Palangka Raya', area: 120, status: 'Intervention', phase: 'Detox', fireYear: 2023, fireSev: 78, moisture: 68, gw: 28, ph: 3.9, veg: 24, vegSlope: .5, pahRisk: 'High', prev: true, access: 70, lat: -2.32, lon: 113.9, x: 430, y: 232, batch: 'RS-B2026-002', lab: { start: 42, k: .11, weeks: 6 }, germ: null },
    { id: 'S02', name: 'Pulang Pisau — Garung', prov: 'Kalimantan Tengah', kab: 'Pulang Pisau', area: 85, status: 'Critical', phase: 'Precondition', fireYear: 2023, fireSev: 90, moisture: 38, gw: 72, ph: 3.6, veg: 8, vegSlope: .1, pahRisk: 'High', prev: false, access: 55, lat: -2.75, lon: 114.25, x: 472, y: 240, batch: null, lab: null, germ: null },
    { id: 'S03', name: 'Kampar — Semenanjung', prov: 'Riau', kab: 'Kampar', area: 150, status: 'Intervention', phase: 'Transition', fireYear: 2024, fireSev: 70, moisture: 72, gw: 24, ph: 4.0, veg: 31, vegSlope: .6, pahRisk: 'Moderate', prev: true, access: 80, lat: .35, lon: 101.75, x: 130, y: 105, batch: 'RS-B2026-001', lab: { start: 36, k: .16, weeks: 10 }, germ: null },
    { id: 'S04', name: 'OKI — Sepucuk', prov: 'Sumatera Selatan', kab: 'Ogan Komering Ilir', area: 210, status: 'Watch', phase: 'Regenerate', fireYear: 2022, fireSev: 60, moisture: 75, gw: 20, ph: 4.2, veg: 52, vegSlope: 1.8, pahRisk: 'Moderate', prev: true, access: 60, lat: -3.4, lon: 105.3, x: 235, y: 222, batch: 'RS-B2026-004', lab: { start: 30, k: .15, weeks: 12 }, germ: { seeded: 1200, germinated: 780, mgt: 18, survival: 72, height: 22, mort: 28 } },
    { id: 'S05', name: 'Meranti — Pulau Tebing', prov: 'Riau', kab: 'Kepulauan Meranti', area: 95, status: 'Recovering', phase: 'Monitoring', fireYear: 2021, fireSev: 45, moisture: 82, gw: 12, ph: 4.3, veg: 74, vegSlope: 1.2, pahRisk: 'Low', prev: true, access: 75, lat: .9, lon: 102.7, x: 165, y: 92, batch: 'RS-B2026-005', lab: { start: 24, k: .2, weeks: 12 }, germ: { seeded: 800, germinated: 640, mgt: 14, survival: 88, height: 41, mort: 12 } },
    { id: 'S06', name: 'Katingan — Mendawai', prov: 'Kalimantan Tengah', kab: 'Katingan', area: 60, status: 'Critical', phase: 'Precondition', fireYear: 2023, fireSev: 85, moisture: 44, gw: 55, ph: 3.7, veg: 12, vegSlope: .2, pahRisk: 'High', prev: false, access: 35, lat: -2.6, lon: 113.1, x: 385, y: 212, batch: null, lab: null, germ: null },
    { id: 'S07', name: 'Muaro Jambi — Londerang', prov: 'Jambi', kab: 'Muaro Jambi', area: 75, status: 'Intervention', phase: 'Detox', fireYear: 2024, fireSev: 72, moisture: 66, gw: 30, ph: 3.9, veg: 20, vegSlope: .4, pahRisk: 'High', prev: true, access: 65, lat: -1.55, lon: 103.9, x: 182, y: 160, batch: 'RS-B2026-003', lab: { start: 38, k: .035, weeks: 10, remob: true }, germ: null },
    { id: 'S08', name: 'Kubu Raya — Rasau Jaya', prov: 'Kalimantan Barat', kab: 'Kubu Raya', area: 110, status: 'Watch', phase: 'Regenerate', fireYear: 2022, fireSev: 55, moisture: 64, gw: 38, ph: 4.1, veg: 30, vegSlope: .3, pahRisk: 'Moderate', prev: true, access: 50, lat: -.35, lon: 109.4, x: 358, y: 168, batch: 'RS-B2026-006', lab: { start: 28, k: .13, weeks: 12 }, germ: { seeded: 900, germinated: 315, mgt: 27, survival: 54, height: 10, mort: 46 } }
  ];

  sites.forEach((s, idx) => {
    const r = rng(idx * 17 + 5);
    const env = { labels: MONTHS, moisture: [], gw: [], rain: RAIN, temp: [], ph: [], veg: [], fire: [] };
    for (let i = 0; i < 12; i++) {
      const d = RAIN[i] - RAIN[11];
      const m = clamp(s.moisture + d / 18 + (r() - .5) * 3, 20, 95);
      const g = clamp(s.gw - d / 12 + (r() - .5) * 3, 2, 120);
      env.moisture.push(r1(m)); env.gw.push(r1(g));
      env.temp.push(r1(26.5 + 2.2 * Math.sin((i - 5) / 12 * 2 * Math.PI) + (r() - .5)));
      env.ph.push(r1((s.ph + (r() - .5) * .15) * 10) / 10);
      env.veg.push(r1(clamp(s.veg - (11 - i) * s.vegSlope + (r() - .5) * 1.5, 2, 95)));
      env.fire.push(Math.round(clamp(.9 * (100 - m) + g * .3 - 12, 3, 98)));
    }
    s.env = env;
    s.fireHistory = [{ year: s.fireYear, severity: s.fireSev, areaBurned: Math.round(s.area * (.6 + s.fireSev / 250)) }];
    if (s.fireSev > 80) s.fireHistory.unshift({ year: 2019, severity: 55, areaBurned: Math.round(s.area * .4) });
    if (s.lab) {
      const w = []; for (let t = 0; t <= s.lab.weeks; t += 2) w.push(t);
      const phen = w.map(t => r1(s.lab.start * Math.exp(-s.lab.k * t) * (1 + (r() - .5) * .04)));
      phen[0] = s.lab.start;
      const pyr = w.map(t => r1(s.lab.start * .6 * Math.exp(-s.lab.k * .8 * t)));
      const bio = w.map((t, i) => r1(phen[i] * (.4 * Math.exp(-.12 * t) + .06)));
      const des = w.map(t => r1(22 * Math.exp(-.08 * t) + 6));
      const lea = w.map(t => Math.round((.9 * Math.exp(-.2 * t) + .05) * 100) / 100);
      if (s.lab.remob) { const n = w.length - 1; lea[n] = Math.round(lea[n - 1] * 2.4 * 100) / 100; bio[n] = r1(bio[n - 1] * 1.25); }
      s.pah = { weeks: w, phen, pyr, bio, res: phen.map(v => r1(v / s.lab.start * 100)), des, lea, method: 'GC-MS (demo)', labId: 'LAB-2026-' + (100 + idx) };
    } else s.pah = null;
  });

  const batches = [
    { id: 'RS-B2026-001', prod: '2026-03-12', alg: 'Na-alginat 2,0% w/v + CaCl₂ 0,1 M', biochar: 'Biochar PKS 10% (b/b)', layer: 'Alginat–kitosan 2 lapis', cons: 'KMP-A', seed: 'DP-S-2026-04', viab: 82, window: 'Minggu 8–12 (target desain)', loc: 'S03', status: 'Monitoring' },
    { id: 'RS-B2026-002', prod: '2026-05-20', alg: 'Na-alginat 2,0% w/v + CaCl₂ 0,1 M', biochar: 'Biochar PKS 10% (b/b)', layer: 'Alginat–kitosan 2 lapis', cons: 'KMP-A', seed: 'DP-S-2026-06', viab: 85, window: 'Minggu 8–12 (target desain)', loc: 'S01', status: 'Deployed' },
    { id: 'RS-B2026-003', prod: '2026-04-02', alg: 'Na-alginat 2,5% w/v + CaCl₂ 0,15 M', biochar: 'Biochar PKS 15% (b/b)', layer: 'Alginat–kitosan 3 lapis', cons: 'KMP-B', seed: 'DP-S-2026-05', viab: 79, window: 'Minggu 10–14 (target desain)', loc: 'S07', status: 'Monitoring' },
    { id: 'RS-B2026-004', prod: '2025-12-15', alg: 'Na-alginat 2,0% w/v + CaCl₂ 0,1 M', biochar: 'Biochar PKS 10% (b/b)', layer: 'Alginat–kitosan 2 lapis', cons: 'KMP-A', seed: 'DP-S-2025-11', viab: 80, window: 'Minggu 8–12 (target desain)', loc: 'S04', status: 'Monitoring' },
    { id: 'RS-B2026-005', prod: '2025-11-03', alg: 'Na-alginat 1,5% w/v + CaCl₂ 0,1 M', biochar: 'Biochar PKS 5% (b/b)', layer: 'Alginat 1 lapis', cons: 'KMP-C', seed: 'DP-S-2025-09', viab: 88, window: 'Minggu 6–10 (target desain)', loc: 'S05', status: 'Completed' },
    { id: 'RS-B2026-006', prod: '2026-01-18', alg: 'Na-alginat 2,0% w/v + CaCl₂ 0,1 M', biochar: 'Biochar PKS 10% (b/b)', layer: 'Alginat–kitosan 2 lapis', cons: 'KMP-B', seed: 'DP-S-2026-01', viab: 61, window: 'Minggu 8–12 (target desain)', loc: 'S08', status: 'Monitoring' },
    { id: 'RS-B2026-007', prod: '2026-09-10', alg: 'Na-alginat 2,0% w/v + CaCl₂ 0,1 M', biochar: 'Biochar PKS 10% (b/b)', layer: 'Alginat–kitosan 2 lapis', cons: 'KMP-A', seed: 'DP-S-2026-08', viab: 86, window: 'Minggu 8–12 (target desain)', loc: null, status: 'Ready' },
    { id: 'RS-B2026-008', prod: '2026-09-24', alg: 'Na-alginat 2,5% w/v + CaCl₂ 0,15 M', biochar: 'Biochar PKS 12% (b/b)', layer: 'Alginat–kitosan 3 lapis', cons: 'KMP-B', seed: 'DP-S-2026-09', viab: 83, window: 'Minggu 10–14 (target desain)', loc: null, status: 'Ready' },
    { id: 'RS-B2026-009', prod: '2026-10-02', alg: 'Na-alginat 2,2% w/v + CaCl₂ 0,12 M', biochar: 'Biochar PKS 8% (b/b)', layer: 'Alginat–kitosan 2 lapis', cons: 'KMP-C', seed: 'DP-S-2026-10', viab: 71, window: 'Menunggu validasi laboratorium', loc: null, status: 'Lab Validation' }
  ];
  const consortia = [
    { id: 'KMP-A', isolates: 'Isolat indigenus gambut 1, 2, 3', source: 'Gambut terbakar Kalimantan Tengah', target: 'Fenantren (3 cincin)', degr28: 78 },
    { id: 'KMP-B', isolates: 'Isolat indigenus gambut 4, 5, 7', source: 'Gambut terbakar Riau', target: 'Fenantren, pirena (3–4 cincin)', degr28: 71 },
    { id: 'KMP-C', isolates: 'Isolat indigenus gambut 2, 6', source: 'Gambut Sumatera Selatan', target: 'Fenantren', degr28: 64 }
  ];
  const seedBatches = [
    { id: 'DP-S-2025-09', species: 'Dyera polyphylla', viab: 88, collected: '2025-09-14', origin: 'Riau' },
    { id: 'DP-S-2025-11', species: 'Dyera polyphylla', viab: 80, collected: '2025-11-02', origin: 'Sumatera Selatan' },
    { id: 'DP-S-2026-01', species: 'Dyera polyphylla', viab: 61, collected: '2026-01-09', origin: 'Kalimantan Barat' },
    { id: 'DP-S-2026-04', species: 'Dyera polyphylla', viab: 82, collected: '2026-02-25', origin: 'Riau' },
    { id: 'DP-S-2026-06', species: 'Dyera polyphylla', viab: 85, collected: '2026-04-30', origin: 'Kalimantan Tengah' },
    { id: 'DP-S-2026-08', species: 'Dyera polyphylla', viab: 86, collected: '2026-08-12', origin: 'Kalimantan Tengah' }
  ];
  const deployments = [
    { id: 'D-001', site: 'S03', batch: 'RS-B2026-001', date: '2026-06-02', beads: 375000, points: 24, staff: ['Rina Wulandari', 'Agus Santoso'], status: 'Monitoring' },
    { id: 'D-002', site: 'S01', batch: 'RS-B2026-002', date: '2026-08-18', beads: 300000, points: 30, staff: ['Budi Hartono', 'Yohanes Ling'], status: 'Deployed' },
    { id: 'D-003', site: 'S07', batch: 'RS-B2026-003', date: '2026-07-01', beads: 187500, points: 18, staff: ['Siti Aminah', 'Joko Prasetyo'], status: 'Monitoring' },
    { id: 'D-004', site: 'S04', batch: 'RS-B2026-004', date: '2026-03-05', beads: 525000, points: 40, staff: ['Hendra Gunawan', 'Lina Marlina'], status: 'Monitoring' },
    { id: 'D-005', site: 'S05', batch: 'RS-B2026-005', date: '2026-01-20', beads: 237500, points: 22, staff: ['Rina Wulandari', 'Dedi Kurnia'], status: 'Completed' },
    { id: 'D-006', site: 'S08', batch: 'RS-B2026-006', date: '2026-03-26', beads: 275000, points: 26, staff: ['Abdul Rahman', 'Maria Ulfa'], status: 'Monitoring' }
  ];
  const alerts = [
    { id: 'A-001', site: 'S02', type: 'Low Water Table', severity: 'Kritis', reason: 'Muka air tanah 72 cm di bawah permukaan (ambang ≤ 40 cm).', reco: 'Prioritaskan penyekatan kanal dan rewetting sebelum deployment RE-SOIL.', ts: '2026-10-07 14:20', status: 'Aktif' },
    { id: 'A-002', site: 'S06', type: 'Drought Risk', severity: 'Tinggi', reason: 'Kelembapan tanah 44% dan curah hujan bulanan turun di bawah 160 mm.', reco: 'Aktifkan patroli, siapkan sumber air, percepat penyekatan kanal.', ts: '2026-10-07 09:05', status: 'Aktif' },
    { id: 'A-003', site: 'S06', type: 'Fire / Hotspot', severity: 'Kritis', reason: 'Titik panas terdeteksi dalam radius 2 km dari batas site (data demo).', reco: 'Verifikasi lapangan segera; koordinasi dengan tim pemadam & masyarakat peduli api.', ts: '2026-10-08 06:40', status: 'Aktif' },
    { id: 'A-004', site: 'S08', type: 'High Seedling Mortality', severity: 'Tinggi', reason: 'Mortalitas bibit 46% (ambang peringatan 35%).', reco: 'Periksa genangan/kekeringan plot, evaluasi kualitas biji dan lapisan transisi.', ts: '2026-10-05 11:30', status: 'Ditinjau' },
    { id: 'A-005', site: 'S07', type: 'PAH Remains High', severity: 'Tinggi', reason: 'Reduksi fenantren baru ±30% pada minggu ke-10; residu masih tinggi (Laboratory Verified).', reco: 'Lakukan remediasi lanjutan dan tunda fase transisi hingga verifikasi laboratorium ulang.', ts: '2026-10-04 16:10', status: 'Aktif' },
    { id: 'A-006', site: 'S07', type: 'Suspected PAH Remobilization', severity: 'Tinggi', reason: 'Lindi PAH & fraksi bioavailable naik pada sampling terakhir setelah curah hujan tinggi.', reco: 'Ambil sampel ulang dan uji lindi; tinjau muka air tanah serta kestabilan hidrogel.', ts: '2026-10-04 16:15', status: 'Aktif' },
    { id: 'A-007', site: 'S08', type: 'Failed Germination', severity: 'Sedang', reason: 'Persentase perkecambahan 35% (ambang minimum 40%).', reco: 'Evaluasi viabilitas batch biji (61%) dan integritas lapisan transisi.', ts: '2026-09-29 10:00', status: 'Ditinjau' },
    { id: 'A-008', site: 'S01', type: 'Drought Risk', severity: 'Sedang', reason: 'Tren kelembapan menurun 3 bulan terakhir pada musim kering.', reco: 'Pantau mingguan; jaga tinggi muka air pada sekat kanal.', ts: '2026-10-03 08:45', status: 'Aktif' }
  ];
  const reports = [
    { id: 'RPT-2026-001', type: 'Routine Monitoring Report', site: 'S05', date: '2026-10-02', reporter: 'Dewi Lestari', desc: 'Pemantauan bulanan: tutupan vegetasi stabil, tidak ditemukan tanda kebakaran.', evidence: '', severity: 'Rendah', status: 'Resolved', follow: 'Lanjutkan pemantauan rutin.' },
    { id: 'RPT-2026-002', type: 'Incident Report', site: 'S06', date: '2026-10-08', reporter: 'Yohanes Ling', desc: 'Asap tipis terlihat di sisi utara site; dugaan api bawah permukaan.', evidence: 'foto_asap_0810.jpg', severity: 'Kritis', status: 'Action Required', follow: 'Tim pemadam & MPA diarahkan ke lokasi.' },
    { id: 'RPT-2026-003', type: 'Laboratory Report', site: 'S07', date: '2026-10-04', reporter: 'Dr. Mulyadi (Lab Gambut)', desc: 'Hasil GC-MS minggu ke-10: reduksi fenantren ±30%, lindi PAH meningkat.', evidence: 'LAB-2026-106.pdf', severity: 'Tinggi', status: 'Reviewed', follow: 'Ulang sampling dalam 2 minggu.' },
    { id: 'RPT-2026-004', type: 'Routine Monitoring Report', site: 'S08', date: '2026-10-05', reporter: 'Abdul Rahman', desc: 'Banyak bibit layu pada plot 3 dan 5; tanah tampak sangat basah.', evidence: 'plot3_layu.jpg', severity: 'Tinggi', status: 'Reviewed', follow: 'Periksa drainase plot.' },
    { id: 'RPT-2026-005', type: 'Routine Monitoring Report', site: 'S01', date: '2026-10-06', reporter: 'Budi Hartono', desc: 'Pemasangan 30 titik bead selesai; sekat kanal 2 diperbaiki.', evidence: '', severity: 'Rendah', status: 'Submitted', follow: '' },
    { id: 'RPT-2026-006', type: 'Incident Report', site: 'S02', date: '2026-10-07', reporter: 'Hendra Gunawan', desc: 'Sekat kanal jebol, muka air turun cepat.', evidence: 'sekat_jebol.jpg', severity: 'Tinggi', status: 'Action Required', follow: 'Perbaikan sekat dijadwalkan minggu ini.' },
    { id: 'RPT-2026-007', type: 'Laboratory Report', site: 'S03', date: '2026-09-30', reporter: 'Dr. Mulyadi (Lab Gambut)', desc: 'Reduksi fenantren >75% pada minggu ke-10; kandidat transisi.', evidence: 'LAB-2026-102.pdf', severity: 'Rendah', status: 'Resolved', follow: 'Lanjutkan pemantauan transisi.' },
    { id: 'RPT-2026-008', type: 'Routine Monitoring Report', site: 'S04', date: '2026-09-28', reporter: 'Lina Marlina', desc: 'Tinggi rata-rata bibit 22 cm; sebagian ditumbuhi gulma paku.', evidence: 'plot_S04.jpg', severity: 'Sedang', status: 'Reviewed', follow: 'Penyiangan terbatas.' }
  ];
  const assignments = [
    { id: 'T-01', site: 'S06', task: 'Verifikasi titik panas sisi utara', due: '2026-10-09', status: 'Mendesak' },
    { id: 'T-02', site: 'S02', task: 'Perbaiki sekat kanal dan catat tinggi muka air', due: '2026-10-12', status: 'Dijadwalkan' },
    { id: 'T-03', site: 'S08', task: 'Hitung bibit hidup/mati pada plot 1–6', due: '2026-10-10', status: 'Dijadwalkan' },
    { id: 'T-04', site: 'S01', task: 'Ukur muka air tanah di 5 sumur pantau', due: '2026-10-11', status: 'Dijadwalkan' },
    { id: 'T-05', site: 'S05', task: 'Foto vegetasi bulanan (titik tetap)', due: '2026-10-20', status: 'Rutin' }
  ];
  const education = [
    { t: 'Mengapa rewetting dulu?', d: 'Gambut yang kering mudah terbakar dan tidak mendukung pertumbuhan bibit. RE-SOIL tidak menggantikan rewetting — ia melengkapinya setelah kondisi hidrologi memadai.' },
    { t: 'Mengenali titik panas & asap', d: 'Asap tipis dari permukaan tanah bisa menandakan api bawah tanah. Foto dari jarak aman, catat koordinat, laporkan segera.' },
    { t: 'Apa itu Phytobead?', d: 'Bead hidrogel alginat berisi biochar, mikroba pendegradasi PAH, dan inti biji Dyera polyphylla. Ia dirancang untuk detoks lebih dulu, lalu melepas biji pada jendela transisi target.' },
    { t: 'Mencatat kondisi bibit', d: 'Hitung bibit hidup dan mati per plot, ukur tinggi 10 bibit acak, dan foto plot dari titik tetap setiap bulan.' },
    { t: 'Keselamatan di lapangan', d: 'Gunakan sarung tangan dan masker saat menangani tanah terbakar. Jangan sentuh bead dengan tangan basah luka, dan cuci tangan setelahnya.' },
    { t: 'Membaca hasil PeatScan', d: 'PeatScan hanya skrining awal berbasis foto. Hasil “High PAH Risk” berarti perlu verifikasi laboratorium — bukan konsentrasi PAH.' }
  ];
  const staff = ['Rina Wulandari', 'Agus Santoso', 'Budi Hartono', 'Yohanes Ling', 'Siti Aminah', 'Joko Prasetyo', 'Hendra Gunawan', 'Lina Marlina', 'Abdul Rahman', 'Maria Ulfa'];
  const users = [
    { id: 'U01', name: 'Dr. Ayu Pramesti', role: 'Admin', org: 'Tim RE-SOIL' },
    { id: 'U02', name: 'Dr. Mulyadi', role: 'Researcher', org: 'Lab Gambut' },
    { id: 'U03', name: 'Yohanes Ling', role: 'Field Ranger / Community', org: 'MPA Kalteng' },
    { id: 'U04', name: 'Ir. Hasan Basri', role: 'Government / Stakeholder', org: 'Badan Restorasi (demo)' },
    { id: 'U05', name: 'Pengunjung', role: 'Public', org: '—' }
  ];
  const stakeholders = [
    { id: 'SH1', name: 'Badan Restorasi (demo)', type: 'Government' }, { id: 'SH2', name: 'Lab Gambut Universitas (demo)', type: 'Researcher' },
    { id: 'SH3', name: 'Masyarakat Peduli Api (demo)', type: 'Community' }, { id: 'SH4', name: 'Mitra Industri Biomaterial (demo)', type: 'Industry' }, { id: 'SH5', name: 'Publik', type: 'Public' }
  ];

  /* ===== Logika ===== */
  const calc = {};
  calc.germPct = g => g ? g.germinated / g.seeded * 100 : 0;
  calc.regenScore = (g, cover) => {
    if (!g) return null;
    const gp = calc.germPct(g);
    const sc = .25 * gp + .30 * g.survival + .15 * Math.min(100, g.height / 50 * 100) + .20 * cover + .10 * (100 - g.mort);
    return Math.round(sc);
  };
  calc.regenCat = sc => sc == null ? null : sc < 40 ? 'Poor' : sc < 60 ? 'Developing' : sc < 80 ? 'Stable' : 'Strong Recovery';
  calc.hydro = (gw, moisture) => (gw > 40 || moisture < 55) ? 'REWET' : (gw <= 30 && moisture >= 60) ? 'READY' : 'MARGINAL';
  calc.detoxStatus = s => {
    if (!s.pah) return null;
    const last = s.pah.phen[s.pah.phen.length - 1], red = 1 - last / s.lab.start, wk = s.lab.weeks;
    if (wk >= 8 && red >= .6) return 'Transition Candidate';
    if (wk >= 8 && red < .35) return 'Further Remediation Required';
    return 'Detox in Progress';
  };
  calc.reduction = s => s.pah ? Math.round((1 - s.pah.phen[s.pah.phen.length - 1] / s.lab.start) * 100) : null;
  calc.PRIORITY_WEIGHTS = [['Tingkat keparahan kebakaran', 20], ['Kelembapan tanah (rendah → prioritas)', 15], ['Muka air tanah (dalam → prioritas)', 15], ['Kehilangan vegetasi', 15], ['Risiko PAH', 20], ['Intervensi sebelumnya', 5], ['Aksesibilitas (kemudahan akses)', 10]];
  calc.priority = f => {
    const p = { Low: .2, Moderate: .6, High: 1 };
    const parts = [20 * f.fireSev / 100, 15 * (100 - f.moisture) / 100, 15 * clamp(f.gw / 80, 0, 1), 15 * f.vegLoss / 100, 20 * p[f.pahRisk], f.prev ? 0 : 5, 10 * f.access / 100];
    const total = Math.round(parts.reduce((a, b) => a + b, 0));
    const cat = total >= 70 ? 'Priority 1 — Immediate Intervention' : total >= 55 ? 'Priority 2 — Restoration Recommended' : total >= 35 ? 'Priority 3 — Monitoring Required' : 'Priority 4 — Recovering';
    return { parts, total, cat, key: cat.slice(0, 10) };
  };
  calc.sitePriority = s => calc.priority({ fireSev: s.fireSev, moisture: s.moisture, gw: s.gw, vegLoss: 100 - s.veg, pahRisk: s.pahRisk, prev: s.prev, access: s.access });
  calc.recommend = s => {
    const st = RS.state ? RS.state.alerts : alerts;
    const hy = calc.hydro(s.gw, s.moisture), ds = calc.detoxStatus(s), gp = s.germ ? calc.germPct(s.germ) : null, sc = s.germ ? calc.regenScore(s.germ, s.veg) : null;
    const hot = st.filter(a => a.site === s.id && a.status !== 'Selesai' && (a.severity === 'Kritis' || a.severity === 'Tinggi'));
    const R = [
      { id: 'R1', title: 'Rewet First', cond: 'Muka air tanah > 40 cm ATAU kelembapan < 55%', fired: hy === 'REWET', why: `Muka air tanah ${s.gw} cm (ambang ≤ 40) dan kelembapan ${s.moisture}% (ambang ≥ 55). Hidrologi belum memadai — deployment RE-SOIL belum direkomendasikan.` },
      { id: 'R2', title: 'RE-SOIL Detox Deployment', cond: 'Hidrologi sesuai + risiko PAH sedang/tinggi + belum ada deployment', fired: hy !== 'REWET' && s.pahRisk !== 'Low' && !s.batch, why: `Hidrologi ${hy === 'READY' ? 'sesuai' : 'marginal'}, risiko PAH ${s.pahRisk}, belum ada deployment. Detox berbasis bead dapat dipertimbangkan setelah verifikasi laboratorium.` },
      { id: 'R3', title: 'Continue Transition Monitoring', cond: 'PAH menurun (≥ 60%) + jendela transisi tercapai (≥ minggu 8)', fired: s.phase === 'Transition' && ds === 'Transition Candidate', why: s.pah ? `Fenantren turun ${calc.reduction(s)}% pada minggu ke-${s.lab.weeks} (Laboratory Verified). Jendela transisi target (minggu 8–12) tercapai; lanjutkan pemantauan transisi.` : '' },
      { id: 'R4', title: 'Evaluate Transition Layer or Seed Viability', cond: 'Perkecambahan < 40%', fired: gp != null && gp < 40, why: gp != null ? `Perkecambahan ${Math.round(gp)}% (ambang 40%), waktu kecambah rata-rata ${s.germ.mgt} hari. Evaluasi viabilitas batch biji dan integritas lapisan transisi.` : '' },
      { id: 'R5', title: 'Long-Term Monitoring', cond: 'Regeneration Score ≥ 60 dan survival ≥ 70%', fired: sc != null && sc >= 60 && s.germ.survival >= 70, why: sc != null ? `Regeneration Score ${sc} (${calc.regenCat(sc)}), survival ${s.germ.survival}%. Pemulihan vegetasi stabil — lanjutkan pemantauan jangka panjang.` : '' },
      { id: 'R6', title: 'Reassess and Re-intervene', cond: 'Kondisi memburuk: peringatan Kritis/Tinggi aktif pada site yang sudah berjalan', fired: s.phase !== 'Precondition' && hot.length > 0, why: hot.length ? `${hot.length} peringatan aktif: ${hot.map(a => a.type).join(', ')}. Lakukan penilaian ulang dan intervensi ulang bila perlu.` : '' }
    ];
    return R;
  };

  /* ===== Riset (demo) ===== */
  const research = {
    alginate: { title: 'Formulasi alginat', cols: ['Kode', 'Alginat (% w/v)', 'CaCl₂ (M)', 'Diameter (mm)', 'Efisiensi enkapsulasi (%)', 'Swelling (%)'], rows: [['F1', 1.5, .1, 3.2, 81, 340], ['F2', 2.0, .1, 3.5, 90, 290], ['F3', 2.5, .15, 3.8, 93, 240], ['F4', 3.0, .2, 4.1, 94, 190]], chart: { type: 'bar', label: 'Efisiensi enkapsulasi (%)', lab: [0, 4] } },
    biochar: { title: 'Karakterisasi biochar (cangkang sawit)', cols: ['Kode', 'Suhu pirolisis (°C)', 'Luas permukaan (m²/g)', 'pH', 'Abu (%)', 'C-organik (%)'], rows: [['BC-350', 350, 120, 7.8, 6.1, 68], ['BC-450', 450, 260, 8.6, 7.4, 76], ['BC-550', 550, 340, 9.2, 8.8, 82], ['BC-650', 650, 410, 9.8, 10.2, 85]], chart: { type: 'bar', label: 'Luas permukaan (m²/g)', lab: [0, 2] } },
    microbes: { title: 'Isolat mikroba indigenus', cols: ['Isolat', 'Sumber', 'Degradasi fenantren 14 hari (%)', 'OD600 puncak', 'Toleransi pH'], rows: [['Isolat 1', 'Gambut terbakar Kalteng', 52, 1.1, '3,5–6,0'], ['Isolat 2', 'Gambut terbakar Riau', 47, .9, '3,5–6,5'], ['Isolat 3', 'Gambut terbakar Kalteng', 41, 1.0, '4,0–7,0'], ['Isolat 4', 'Gambut Sumsel', 36, .8, '4,0–6,5']], chart: { type: 'bar', label: 'Degradasi fenantren (%)', lab: [0, 2] } },
    pah: { title: 'Eksperimen PAH (fenantren, 28 hari)', cols: ['Perlakuan', 'Reduksi fenantren (%)', 'Penurunan fraksi bioavailable (%)', 'Ulangan'], rows: [['Kontrol (tanpa perlakuan)', 6, 4, 3], ['Biochar saja', 24, 41, 3], ['Mikroba saja', 38, 22, 3], ['Bead RE-SOIL (biochar + mikroba)', 71, 63, 3]], chart: { type: 'bar', label: 'Reduksi fenantren (%)', lab: [0, 1] } },
    hydrogel: { title: 'Degradasi hidrogel (massa tersisa, %)', cols: ['Hari', 'F2 (2,0%)', 'F3 (2,5%)', 'F3 + kitosan'], rows: [[0, 100, 100, 100], [14, 92, 95, 97], [28, 78, 85, 91], [42, 61, 72, 83], [56, 44, 58, 70], [84, 22, 38, 52]], chart: { type: 'line' } },
    germ: { title: 'Perkecambahan Dyera polyphylla', cols: ['Batch biji', 'Viabilitas (%)', 'Perkecambahan terkontrol (%)', 'Waktu kecambah rata-rata (hari)'], rows: [['DP-S-2025-09', 88, 80, 14], ['DP-S-2025-11', 80, 65, 18], ['DP-S-2026-01', 61, 35, 27], ['DP-S-2026-04', 82, 70, 16]], chart: { type: 'bar', label: 'Perkecambahan (%)', lab: [0, 2] } },
    meso: { title: 'Uji mesokosmos', cols: ['ID', 'Durasi (minggu)', 'Perlakuan', 'Reduksi PAH (%)', 'Survival bibit (%)', 'Status'], rows: [['MS-01', 12, 'Rewetted + Bead', 74, 83, 'Selesai'], ['MS-02', 12, 'Rewetted + Biochar', 31, 76, 'Selesai'], ['MS-03', 12, 'Kering + Bead', 42, 38, 'Selesai'], ['MS-04', 16, 'Rewetted + Bead (F3)', 69, 80, 'Berjalan']], chart: null },
    field: { title: 'Uji lapangan', cols: ['Site', 'Plot', 'Luas uji (ha)', 'Mulai', 'Survival bibit (%)', 'Status'], rows: [['Meranti — Pulau Tebing', 22, 2.2, '2026-01', 88, 'Selesai'], ['OKI — Sepucuk', 40, 4.0, '2026-03', 72, 'Pemantauan'], ['Kampar — Semenanjung', 24, 2.4, '2026-06', '—', 'Transisi'], ['Sebangau Blok A', 30, 3.0, '2026-08', '—', 'Detox']], chart: null },
    safety: { title: 'Keamanan material', cols: ['Uji', 'Metode', 'Hasil (demo)', 'Status'], rows: [['Fitotoksisitas (indeks perkecambahan)', 'Bioassay biji', 'IG > 80%', 'Lulus'], ['Pelindian logam berat dari biochar', 'ICP-OES', 'Di bawah batas uji', 'Lulus'], ['Biodegradabilitas hidrogel', 'Massa tersisa', 'Terdegradasi bertahap', 'Lulus'], ['Keamanan konsorsium mikroba', 'Skrining non-patogen', 'Dalam proses', 'Berjalan'], ['Uji ekotoksisitas akuatik', 'Daphnia sp.', 'Dijadwalkan', 'Menunggu']], chart: null }
  };

  RS.data = { sites, batches, consortia, seedBatches, deployments, alerts, reports, assignments, education, staff, users, stakeholders, research, PHASES, MONTHS, RAIN };
  RS.calc = calc;

  /* ===== State (localStorage) ===== */
  const KEY = 'resoil.v1';
  const clone = o => JSON.parse(JSON.stringify(o));
  const seed = () => ({ reports: clone(reports), alerts: clone(alerts), batches: clone(batches), plans: [], scans: [], activities: [], role: 'admin' });
  RS.loadState = () => { let st = null; try { st = JSON.parse(localStorage.getItem(KEY)); } catch (e) { } RS.state = Object.assign(seed(), st || {}); };
  RS.save = () => { try { localStorage.setItem(KEY, JSON.stringify(RS.state)); } catch (e) { } };
  RS.resetState = () => { try { localStorage.removeItem(KEY); } catch (e) { } RS.loadState(); };
  RS.loadState();

  RS.exportDB = () => ({
    Users: users, Sites: sites.map(({ env, pah, germ, fireHistory, lab, ...s }) => s),
    SiteMonitoring: sites.map(s => ({ site: s.id, moisture: s.moisture, gw: s.gw, ph: s.ph, veg: s.veg })),
    FireHistory: sites.flatMap(s => s.fireHistory.map(f => ({ site: s.id, ...f }))), PAHResults: sites.filter(s => s.pah).map(s => ({ site: s.id, label: 'Laboratory Verified', ...s.pah })),
    PeatScanResults: RS.state.scans, Deployments: deployments, RESoilBatches: RS.state.batches, MicrobialConsortium: consortia, SeedBatches: seedBatches,
    GerminationMonitoring: sites.filter(s => s.germ).map(s => ({ site: s.id, ...s.germ })), VegetationMonitoring: sites.map(s => ({ site: s.id, labels: MONTHS, cover: s.env.veg })),
    EnvironmentalMonitoring: sites.map(s => ({ site: s.id, ...s.env })), Reports: RS.state.reports, RiskAlerts: RS.state.alerts,
    Recommendations: sites.map(s => ({ site: s.id, rules: calc.recommend(s).filter(r => r.fired).map(r => ({ rule: r.id, title: r.title, why: r.why })) })),
    LaboratoryReports: sites.filter(s => s.pah).map(s => ({ id: s.pah.labId, site: s.id, method: s.pah.method, status: calc.detoxStatus(s), label: 'Laboratory Verified' })),
    Stakeholders: stakeholders, Activities: RS.state.activities
  });
})();
