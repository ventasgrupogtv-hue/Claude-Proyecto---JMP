// Bot que juega partidas largas (por defecto 48 años) y busca errores.
// Uso:  node tools/bot48.js [--mundos 2] [--años 48] [--semilla 1]
// Recorre mercados, recluta, gestiona su feudo (impuestos, obras, granero), ataca aldeas cuando es fuerte,
// guarda y carga al final. Comprueba que no haya errores de JavaScript ni valores NaN.
const { abrirJuego, args } = require('./lib');

(async () => {
  const a = args({ mundos: 2, 'años': 48, semilla: 1 });
  const { browser, nuevaPagina, errores } = await abrirJuego({ query: '?debug=1' });
  const page = await nuevaPagina();
  let fallos = 0;
  for (let m = 0; m < a.mundos; m++) {
    const seed = a.semilla + m * 104729;
    const t0 = Date.now();
    const r = await page.evaluate(({ seed, years }) => {
      genWorld(seed); buildTerrainCanvas(); rebuildTerritory(); startModal(); act('start'); paused = true;
      window.setTimeout = f => f(); // que el aviso de "ocupar o saquear" salga en el acto
      const out = { errs: [], obras: 0, revueltas: 0, feudosMax: 0 };
      const days = Math.round(years * (typeof DIAS_AÑO !== 'undefined' ? DIAS_AÑO : 60));
      for (let d = 0; d < days; d++) {
        try {
          const pl = G.player, pp = PP();
          if (G.enc) encAct('auto');
          if (G.sack) act('occupy');
          if (pp.inside) leaveSettlement();
          if (d % 5 === 0 && !pp.inBattle) {
            const mf = myFiefs();
            const fr = (mf.length && d % 15 === 0) ? mf : G.settlements.filter(s => !facWar(0, s.owner));
            const s = fr.sort((x, y) => dist(x.x, x.y, pp.x, pp.y) - dist(y.x, y.y, pp.x, pp.y))[Math.floor(R() * Math.min(3, fr.length))];
            if (s && dist(pp.x, pp.y, s.x, s.y) < 3) {
              enterSettlement(s);
              for (const k of ['grano', 'ganado', 'pescado']) for (let i = 0; i < 6 && rations() < eatNeed() * 12; i++) act('buy', k + '|1');
              if (pl.gold > 120) act('recruit', '2');
              if (s.owner === 0) {
                const f = s.fief;
                if (f.loy < 35 && f.tax !== 'low') act('tax', s.id + '|low');
                else if (f.loy > 65 && f.tax !== 'high') act('tax', s.id + '|high');
                else if (f.loy >= 35 && f.loy <= 65 && f.tax === 'high') act('tax', s.id + '|normal');
                if (!f.proj) for (const k of bAvail(s)) if (!s.bld[k]) { pl.inv.madera = (pl.inv.madera || 0) + 12; pl.inv.hierro = (pl.inv.hierro || 0) + 4; pl.gold += bCost(s, k); act('build', s.id + '|' + k); out.obras++; break; }
                if (s.type === 'castle') { pl.inv.grano = (pl.inv.grano || 0) + 10; act('food', s.id + '|grano|999'); }
                if (menOf() > 3 && garSoldiers(s).length < 4) act('gleave');
              }
              for (const v of ['main', 'market', 'recruit', 'quests', 'garrison', 'fief']) act('tv', v); // pinta todas las vistas
              leaveSettlement();
            } else if (s) { pp.target = { type: 'enter', id: s.id }; setPathTo(pp, s.x, s.y + 1); }
          }
          if (d % 37 === 0 && menOf() >= 12 && !pp.inBattle) {
            const t = G.settlements.filter(s => s.type === 'village' && s.owner > 0 && s.owner !== pl.liege).sort((x, y) => dist(x.x, x.y, pp.x, pp.y) - dist(y.x, y.y, pp.x, pp.y))[0];
            if (t && dist(t.x, t.y, pp.x, pp.y) < 30) act('siege', t.id + '|assault');
          }
          if (d === 30) act('grantcastle');
          if (d % 50 === 0) { fiefsModal(); for (const s of myFiefs()) fiefModal(s.id); companyModal(); kingdomsModal(); closeModal(); }
          if (pl.gold < 60) pl.gold += 40; // el bot no se arruina: busca errores, no mide la economía
          step(DAY); hud(); ctxPanel();
          out.feudosMax = Math.max(out.feudosMax, myFiefs().length);
          for (const s of myFiefs()) { const f = s.fief; if (!f) continue; for (const k of ['prosp', 'loy', 'sec', 'food']) if (!isFinite(f[k])) throw new Error('NaN en ' + k + ' de ' + s.name); }
          if (!isFinite(G.player.gold)) throw new Error('oro NaN');
        } catch (e) { out.errs.push('día ' + d + ': ' + e.stack); if (out.errs.length > 3) break; }
      }
      for (const B of [...battles]) autoResolve(B);
      saveGame(true); out.cargar = loadGame(); out.dia = G.day;
      out.reinos = G.kingdoms.filter(k => k.alive && !k.isPlayer).map(k => k.name + ':' + G.settlements.filter(s => s.owner === k.id).length).join(' ');
      return out;
    }, { seed, years: a['años'] });
    const ok = !r.errs.length && r.cargar;
    if (!ok) fallos++;
    console.log(`Mundo ${m + 1} (semilla ${seed}): ${ok ? 'OK' : 'FALLO'} · ${a['años']} años en ${Math.round((Date.now() - t0) / 1000)} s · obras ${r.obras} · feudos máx. ${r.feudosMax} · guardar/cargar ${r.cargar ? 'OK' : 'FALLO'} · reinos: ${r.reinos}`);
    for (const e of r.errs) console.log('   ' + e);
  }
  console.log(errores.length ? 'Errores en consola:\n  ' + errores.slice(0, 10).join('\n  ') : 'Sin errores en consola.');
  await browser.close();
  process.exit(fallos || errores.length ? 1 : 0);
})();
