// Mide el coste de dibujar y simular tras jugar unos años (para comparar antes y después de optimizar).
// Uso:  node tools/rendimiento.js [--años 10] [--semilla 1] [--movil]
// Con --movil usa una pantalla de 390×844 a doble resolución, como un teléfono.
const { abrirJuego, args } = require('./lib');

(async () => {
  const a = args({ 'años': 10, semilla: 1, movil: false });
  const { browser, nuevaPagina, errores } = await abrirJuego();
  const vp = a.movil ? { width: 390, height: 844 } : { width: 1280, height: 800 };
  const page = await nuevaPagina(vp);
  if (a.movil) await page.evaluate(() => { Object.defineProperty(window, 'devicePixelRatio', { get: () => 2 }); resize(); });
  const r = await page.evaluate(({ seed, years }) => {
    genWorld(seed); buildTerrainCanvas(); rebuildTerritory(); startModal(); act('start'); paused = true;
    const DA = typeof DIAS_AÑO !== 'undefined' ? DIAS_AÑO : 60;
    for (let d = 0; d < years * DA; d++) { PP().immune = 1e9; if (G.enc) encAct('flee'); if (G.sack) act('occupy'); step(DAY); }
    cam.zoom = 2; cam.x = PP().x; cam.y = PP().y;
    const med = (f, n) => { f(); const t = performance.now(); for (let i = 0; i < n; i++) f(); return (performance.now() - t) / n; };
    return {
      partidas: G.parties.length, poblados: G.settlements.length,
      render: med(render, 200), renderMini: med(renderMini, 50), update: med(() => update(.05), 400),
      dia: med(() => step(DAY), 30), hud: med(uiTick, 50),
    };
  }, { seed: a.semilla, years: a['años'] });
  console.log(`${a.movil ? 'Móvil 390×844 @2x' : 'Escritorio 1280×800'} tras ${a['años']} años (${r.partidas} partidas, ${r.poblados} poblados):`);
  console.log(`  render (fotograma del mapa): ${r.render.toFixed(2)} ms`);
  console.log(`  renderMini (minimapa):       ${r.renderMini.toFixed(2)} ms`);
  console.log(`  update (paso de 0,05 s):     ${r.update.toFixed(3)} ms`);
  console.log(`  un día completo (step):      ${r.dia.toFixed(2)} ms`);
  console.log(`  interfaz (uiTick):           ${r.hud.toFixed(2)} ms`);
  if (errores.length) console.log('Errores en consola:\n  ' + errores.slice(0, 10).join('\n  '));
  await browser.close();
})();
