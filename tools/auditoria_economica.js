// Auditoría de la economía inicial: ¿en cuántos días se queda sin oro un jugador nuevo?
// Uso:  node tools/auditoria_economica.js [--mundos 15] [--semilla 1]
// El bot NO hace tareas ni combate (es inmune). Recluta 0, 2 o 5 hombres el primer día (3, 5 u 8 en total),
// y compra la comida más barata de los 3 poblados amigos más cercanos, un día de raciones cada vez que se le acaba.
// "Quiebra" = primer día en que no puede pagar sueldos o pasa hambre por falta de oro.
const { abrirJuego, args, guardar } = require('./lib');

(async () => {
  const a = args({ mundos: 15, semilla: 1 });
  const { browser, nuevaPagina, errores } = await abrirJuego();
  const page = await nuevaPagina();
  const res = await page.evaluate(({ mundos, semilla }) => {
    const out = [];
    for (const extra of [0, 2, 5]) for (let w = 0; w < mundos; w++) {
      genWorld(semilla + w * 104729); buildTerrainCanvas(); rebuildTerritory(); startModal(); act('start'); paused = true;
      const pl = G.player, p = PP();
      const near = G.settlements.filter(s => !facWar(0, s.owner)).sort((x, y) => dist(x.x, x.y, p.x, p.y) - dist(y.x, y.y, p.x, p.y)).slice(0, 3);
      enterSettlement(near[0]); for (let i = 0; i < extra; i++) { near[0].recruits = Math.max(near[0].recruits, 5); act('recruit', '1'); } leaveSettlement();
      const racIni = rations(), bocas = eatNeed();
      let quiebra = null, motivo = '', gastoComida = 0, raciones = 0;
      for (let d = 0; d < 200 && quiebra == null; d++) {
        p.immune = 1e9; if (G.enc) encAct('flee');
        if (rations() < eatNeed()) {
          for (const s of near) {
            enterSettlement(s);
            for (let i = 0; i < 30 && rations() < eatNeed() * 2; i++) {
              const k = FOODK.filter(k => (s.stock[k] || 0) > 0 && pl.gold >= buyP(s, k)).sort((x, y) => buyP(s, x) / GOODS[x].r - buyP(s, y) / GOODS[y].r)[0];
              if (!k) break; const g0 = pl.gold; act('buy', k + '|1'); gastoComida += g0 - pl.gold; raciones += GOODS[k].r;
            }
            leaveSettlement();
          }
        }
        step(DAY);
        if (pl.unpaid) { quiebra = G.day; motivo = 'sin oro para sueldos'; }
        else if (pl.hungry) { quiebra = G.day; motivo = 'hambre por falta de oro'; }
      }
      out.push({ hombres: 3 + extra, mundo: w, quiebra, motivo, racIni, bocas, costeRacion: raciones ? gastoComida / raciones : null });
    }
    return out;
  }, { mundos: a.mundos, semilla: a.semilla });
  let csv = 'hombres,mundo,dia_quiebra,motivo,raciones_iniciales,bocas,coste_racion\n';
  for (const r of res) csv += [r.hombres, r.mundo, r.quiebra ?? '', r.motivo, r.racIni, r.bocas, r.costeRacion == null ? '' : r.costeRacion.toFixed(2)].join(',') + '\n';
  const f = guardar('auditoria_economica.csv', csv);
  console.log('Días hasta quedarse sin oro (sin tareas ni combate):');
  for (const h of [3, 5, 8]) {
    const g = res.filter(r => r.hombres === h), d = g.map(r => r.quiebra ?? 999).sort((x, y) => x - y);
    const med = d[Math.floor(d.length / 2)], cr = g.filter(r => r.costeRacion != null).map(r => r.costeRacion);
    console.log(`  ${h} hombres: mediana día ${med} (rango ${d[0]}–${d[d.length - 1]}) · comida inicial para ${Math.floor(g[0].racIni / g[0].bocas)} días · coste medio por ración ${cr.length ? (cr.reduce((x, y) => x + y, 0) / cr.length).toFixed(2) : '—'} oro`);
  }
  console.log('CSV: ' + f);
  if (errores.length) console.log('Errores en consola:\n  ' + errores.slice(0, 10).join('\n  '));
  await browser.close();
})();
