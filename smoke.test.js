/* Smoke test: muat setiap rute pada jsdom untuk setiap peran dan pastikan tidak ada error runtime. */
const { JSDOM } = require('jsdom'); const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const dom = new JSDOM('<!doctype html><body><div id="app"></div><div id="toast"></div></body>', { url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true });
const w = dom.window; w.__RS_TEST__ = true;
const errors = []; w.console.error = (...a) => errors.push(a.join(' '));
w.scrollTo = () => { }; w.HTMLCanvasElement.prototype.getContext = () => null;
['data', 'ui', 'pages1', 'pages2', 'pages3', 'pages4', 'app'].forEach(f => w.eval(fs.readFileSync(path.join(root, 'js', f + '.js'), 'utf8')));
const RS = w.RS; RS.fast = true;
const routes = ['landing', 'command', 'map', 'sites', 'site/S01', 'site/S02', 'site/S05', 'site/S08', 'site/XXX', 'peatscan', 'priority', 'planner', 'batches', 'monitoring', 'detox', 'regen', 'alerts', 'recommend', 'reports', 'portal', 'research', 'stakeholder', 'datamodel'];
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('✗ ' + m); } };
for (const role of ['admin', 'researcher', 'ranger', 'gov', 'public']) {
  RS.state.role = role;
  for (const r of routes) {
    w.location.hash = '#/' + r; RS.route();
    const html = w.document.getElementById('app').innerHTML;
    ok(html.length > 200, `${role}:${r} render kosong`);
    ok(!/Terjadi kesalahan/.test(html), `${role}:${r} gagal render`);
    ok(!/undefined|NaN|\[object/.test(html), `${role}:${r} memuat undefined/NaN/[object]`);
  }
}
// Aturan ilmiah
const S = id => RS.data.sites.find(s => s.id === id), C = RS.calc;
ok(C.hydro(72, 38) === 'REWET', 'S02 harus REWET FIRST'); ok(C.hydro(20, 75) === 'READY', 'hidrologi baik harus READY');
ok(C.detoxStatus(S('S03')) === 'Transition Candidate', 'S03 Transition Candidate'); ok(C.detoxStatus(S('S07')) === 'Further Remediation Required', 'S07 Further Remediation');
ok(C.regenCat(C.regenScore(S('S08').germ, S('S08').veg)) === 'Poor', 'S08 Poor'); ok(C.regenCat(C.regenScore(S('S05').germ, S('S05').veg)) === 'Strong Recovery', 'S05 Strong Recovery');
ok(C.sitePriority(S('S02')).cat.startsWith('Priority 1'), 'S02 Priority 1'); ok(C.sitePriority(S('S05')).cat.startsWith('Priority 4'), 'S05 Priority 4');
ok(C.recommend(S('S02')).find(r => r.id === 'R1').fired, 'R1 untuk S02');
// PeatScan: tidak boleh menampilkan konsentrasi PAH
RS.state.role = 'admin'; w.location.hash = '#/peatscan'; RS.route();
const ps = w.document.getElementById('app').innerHTML; ok(ps.includes('does not replace laboratory PAH analysis'), 'disclaimer PeatScan wajib ada'); ok(!/mg\/kg/.test(ps), 'PeatScan tidak boleh menampilkan mg/kg');
w.location.hash = '#/detox'; RS.route(); ok(w.document.getElementById('app').innerHTML.includes('LABORATORY DATA'), 'label LABORATORY DATA wajib di Detox');
if (errors.length) { console.error('Console errors:\n' + errors.join('\n')); fails += errors.length; }
if (fails) { console.error(`\n${fails} kegagalan`); process.exit(1); }
console.log(`✓ Smoke test lulus (${routes.length} rute × 5 peran + aturan ilmiah)`);
