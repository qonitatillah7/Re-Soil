# 🌱 RE-SOIL Digital Restoration Loop

Platform **decision-support, monitoring, pelaporan, dan restorasi adaptif** untuk gambut tropis pascakebakaran — pendamping digital bagi **Smart Core–Shell Phytobead** (hidrogel alginat dari biomassa alga, biochar cangkang kelapa sawit/PKS, mikroba indigenus pendegradasi PAH, dan inti fito-regeneratif biji *Dyera polyphylla*).

```
Fisik   : CONDITION → DETOX → CONTROLLED TRANSITION → PHYTO-RELEASE → REGENERATE → MONITOR & ADAPT
Digital : ASSESS → PRIORITIZE → DEPLOY → MONITOR → REPORT → EVALUATE → ADAPT
```

> ⚠️ **Semua data pada repositori ini adalah DATA DEMONSTRASI** untuk prototipe, bukan hasil lapangan atau laboratorium nyata.

## Menjalankan

Tidak ada build step dan tidak ada dependensi runtime (HTML + CSS + JavaScript murni, grafik & peta berupa SVG buatan sendiri).

```bash
git clone https://github.com/<username>/resoil-digital-restoration-loop.git
cd resoil-digital-restoration-loop
python3 -m http.server 8080      # atau: npm start
# buka http://localhost:8080
```

Pengujian (smoke test seluruh rute × 5 peran + aturan ilmiah):

```bash
npm install && npm test
```

## Deploy ke GitHub Pages

1. Push ke branch `main`.
2. **Settings → Pages → Source: GitHub Actions**.
3. Workflow `.github/workflows/pages.yml` menjalankan tes lalu mendeploy otomatis.

## Modul (17)

| # | Modul | Rute |
|---|-------|------|
| 1 | Landing page | `#/landing` |
| 2 | Restoration Command Center | `#/command` |
| 3 | Peta Kondisi Gambut (9 lapisan) | `#/map` |
| 4 | Detail Site (9 bagian) | `#/sites` → `#/site/S01` |
| 5 | PeatScan | `#/peatscan` |
| 6 | Restoration Priority Index | `#/priority` |
| 7 | Deployment Planner | `#/planner` |
| 8 | RE-SOIL Batch Tracker (+ QR-style) | `#/batches` |
| 9 | Monitoring Lingkungan | `#/monitoring` |
| 10 | Detox Progress | `#/detox` |
| 11 | Regeneration Index | `#/regen` |
| 12 | Smart Reporting System | `#/reports` |
| 13 | Risk Alert & Early Warning | `#/alerts` |
| 14 | Adaptive Recommendation Engine | `#/recommend` |
| 15 | Ranger / Community Portal | `#/portal` |
| 16 | Research & Validation Hub | `#/research` |
| 17 | Dashboard Stakeholder | `#/stakeholder` |
| — | Model Data (19 entitas) + ekspor JSON | `#/datamodel` |

**Peran** (pilih di sidebar, demo): Admin, Researcher, Field Ranger/Community, Government/Stakeholder, Public — menu dan aksi menyesuaikan peran (mis. Publik tidak melihat koordinat teknis, PAH, atau peringatan).

## Aturan ilmiah yang ditegakkan di kode

- RE-SOIL **tidak menggantikan rewetting**: Planner memberi **REWET FIRST** bila muka air > 40 cm atau kelembapan < 55%; **READY FOR RE-SOIL DEPLOYMENT** hanya bila ≤ 30 cm dan ≥ 60% (di antaranya: *Hidrologi Marginal*).
- **PeatScan** hanya menampilkan `Low / Moderate / High PAH Risk` (tanpa angka konsentrasi), selalu disertai disclaimer, dan *High* menampilkan “Laboratory Verification Recommended.” Foto + kartu warna referensi wajib. (Tes otomatis memastikan tidak ada `mg/kg` di halaman PeatScan.)
- Konsentrasi PAH hanya muncul bersama label **LABORATORY DATA · Laboratory Verified**; fenantren = PAH model utama, pirena opsional.
- Jendela transisi/rilis = **target desain**, bukan waktu pelepasan terjamin. Bahasa: reduksi PAH, bioavailabilitas lebih rendah, biodegradasi, residual risk — tidak ada klaim penghilangan total.
- Rekomendasi bersifat **rule-based & explainable**: setiap aturan menampilkan kondisi dan *mengapa* terpicu (lihat `RS.calc.recommend` di `js/data.js`).

Detail: [`docs/SCIENTIFIC_RULES.md`](docs/SCIENTIFIC_RULES.md) · [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md)

## Struktur

```
index.html
css/style.css          # identitas visual gambut: hijau-cokelat, kartu membulat
js/data.js             # data demo + logika (priority, detox status, regen score, rekomendasi) + state localStorage
js/ui.js               # komponen: badge, grafik SVG, QR-style, modal, tab, tabel
js/pages1.js           # landing, command center, peta, daftar & detail site
js/pages2.js           # PeatScan, priority, planner, batch tracker
js/pages3.js           # monitoring, detox, regen, alert, rekomendasi, pelaporan
js/pages4.js           # portal ranger, research hub, stakeholder, model data
js/app.js              # shell, peran, router hash
tests/smoke.test.js    # jsdom smoke test
.github/workflows/     # CI + GitHub Pages
```

## Langkah pengembangan berikutnya

- Ganti `RS.data` dengan API/basis data (skema di `docs/DATA_MODEL.md`).
- Peta nyata (Leaflet/MapLibre + GeoJSON batas site) menggantikan peta skematik SVG.
- PeatScan: model terkalibrasi dengan kartu warna referensi dan validasi silang laboratorium.
- Autentikasi & otorisasi sungguhan (peran saat ini hanya simulasi UI).

## Lisensi

MIT — lihat [LICENSE](LICENSE).
