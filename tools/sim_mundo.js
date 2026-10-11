// Simula N mundos durante X años sin jugador activo (el jugador existe pero es inmune y no se mueve)
// y mide el equilibrio de poder entre reinos.
// Uso:  node tools/sim_mundo.js [--mundos 10] [--años 50] [--semilla 1] [--paralelo 4] [--csv sim_mundo.csv]
// Cada 5 años registra: % de feudos del reino más grande, reinos vivos, guerras activas y cambios de dueño.
// Al final resume por mundo: reino más grande, caídas de reinos, "cambios fuertes de poder"
// (un reino gana o pierde ≥20% de sus feudos entre dos muestras, con al menos 2 feudos de diferencia),
// periodos sin guerras y duración media de los reinados.
const { abrirJuego, args, guardar } = require('./lib');

async function simular(page, seed, years) {
  return page.evaluate(({ seed, years }) => {
    genWorld(seed); buildTerrainCanvas(); rebuildTerritory(); startModal(); act('start'); paused = true;
    const DA = typeof DIAS_AÑO !== 'undefined' ? DIAS_AÑO : 60;
    const kingdoms = () => G.kingdoms.filter(k => !k.isPlayer);
    let owners = new Map(G.settlements.map(s => [s.id, s.owner]));
    let cambios = 0, cambiosTot = 0, caidas = 0;
    const vivo = new Map(kingdoms().map(k => [k.id, k.alive]));
    const rey = new Map(kingdoms().map(k => [k.id, { r: k.ruler, desde: 0 }]));
    const reinados = [];
    const filas = [];
    let prevCount = null;
    let fuertes = 0;
    const days = Math.round(years * DA);
    const p = PP();
    for (let d = 1; d <= days; d++) {
      p.immune = 1e9; p.path = []; p.target = null;
      if (G.enc) encAct('flee');
      if (G.sack) act('occupy');
      step(DAY);
      for (const s of G.settlements) { const o = owners.get(s.id); if (o !== undefined && o !== s.owner) { cambios++; cambiosTot++; } owners.set(s.id, s.owner); }
      for (const k of kingdoms()) {
        if (vivo.get(k.id) && !k.alive) caidas++;
        vivo.set(k.id, k.alive);
        const r = rey.get(k.id);
        if (k.alive && r && r.r !== k.ruler) { reinados.push((G.day - r.desde) / DA); rey.set(k.id, { r: k.ruler, desde: G.day }); }
      }
      if (d % (5 * DA) === 0) {
        const tot = G.settlements.length;
        const cnt = {}; for (const k of kingdoms()) cnt[k.id] = G.settlements.filter(s => s.owner === k.id).length;
        const max = Math.max(...Object.values(cnt));
        const guerras = Object.keys(G.wars).filter(w => !w.split('|').includes('0')).length;
        if (prevCount) for (const id in cnt) { const a = prevCount[id] || 0, b = cnt[id]; if (a > 0 && Math.abs(b - a) >= Math.max(2, a * 0.2)) fuertes++; }
        prevCount = cnt;
        filas.push({ año: d / DA, total: tot, pctMax: Math.round(100 * max / tot), vivos: kingdoms().filter(k => k.alive).length, guerras, cambios, reparto: kingdoms().map(k => cnt[k.id]).join('/') });
        cambios = 0;
      }
    }
    // reinados que siguen en curso no cuentan (no han terminado)
    return { filas, caidas, fuertes, cambiosTot, reinados, sinGuerra: filas.filter(f => f.guerras === 0).length };
  }, { seed, years });
}

(async () => {
  const a = args({ mundos: 10, 'años': 50, semilla: 1, paralelo: 4, csv: 'sim_mundo.csv' });
  const { browser, nuevaPagina, errores } = await abrirJuego();
  const seeds = Array.from({ length: a.mundos }, (_, i) => a.semilla + i * 104729);
  const res = new Array(seeds.length);
  let next = 0;
  const t0 = Date.now();
  await Promise.all(Array.from({ length: Math.min(a.paralelo, seeds.length) }, async () => {
    const page = await nuevaPagina();
    while (next < seeds.length) { const i = next++; res[i] = await simular(page, seeds[i], a['años']); process.stdout.write('.'); }
  }));
  console.log(` ${seeds.length} mundos × ${a['años']} años en ${Math.round((Date.now() - t0) / 1000)} s`);
  let csv = 'mundo,semilla,año,feudos_total,pct_reino_mayor,reinos_vivos,guerras_activas,cambios_de_dueño_5años,reparto\n';
  res.forEach((r, i) => r.filas.forEach(f => { csv += [i + 1, seeds[i], f.año, f.total, f.pctMax, f.vivos, f.guerras, f.cambios, f.reparto].join(',') + '\n'; }));
  const file = guardar(a.csv, csv);
  console.log('\nMundo  semilla  %mayor(final)  máx%   vivos  guerras(final)  caídas  cambios_fuertes  cambios_dueño  periodos_sin_guerra  reinado_medio');
  const todos = [];
  res.forEach((r, i) => {
    const fin = r.filas[r.filas.length - 1], mx = Math.max(...r.filas.map(f => f.pctMax));
    const rm = r.reinados.length ? (r.reinados.reduce((x, y) => x + y, 0) / r.reinados.length) : NaN; todos.push(...r.reinados);
    console.log(`${String(i + 1).padStart(5)}  ${String(seeds[i]).padStart(7)}  ${String(fin.pctMax + '%').padStart(13)}  ${String(mx + '%').padStart(5)}  ${String(fin.vivos).padStart(5)}  ${String(fin.guerras).padStart(14)}  ${String(r.caidas).padStart(6)}  ${String(r.fuertes).padStart(15)}  ${String(r.cambiosTot).padStart(13)}  ${String(r.sinGuerra + '/' + r.filas.length).padStart(19)}  ${isNaN(rm) ? '—' : rm.toFixed(1) + ' años'}`);
  });
  const fins = res.map(r => r.filas[r.filas.length - 1]);
  const med = v => { const s = [...v].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  console.log('\nResumen:');
  console.log(`  Mundos donde ningún reino supera el 50% al final: ${fins.filter(f => f.pctMax <= 50).length}/${res.length}`);
  console.log(`  Mundos con al menos una caída o cambio fuerte de poder: ${res.filter(r => r.caidas + r.fuertes > 0).length}/${res.length}`);
  console.log(`  Mundos con algún periodo de 5 años sin guerras entre reinos (muestra): ${res.filter(r => r.sinGuerra > 0).length}/${res.length}`);
  console.log(`  % del reino mayor al final: mediana ${med(fins.map(f => f.pctMax))}% · reinos vivos al final: mediana ${med(fins.map(f => f.vivos))}`);
  console.log(`  Reinado medio: ${todos.length ? (todos.reduce((x, y) => x + y, 0) / todos.length).toFixed(1) : '—'} años (${todos.length} reinados terminados)`);
  console.log('CSV: ' + file);
  if (errores.length) console.log('Errores en consola:\n  ' + errores.slice(0, 10).join('\n  '));
  await browser.close();
})();
