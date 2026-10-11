// Utilidades comunes de las herramientas de prueba de Estandarte.
// Abren index.html en Chromium (Playwright) sin interfaz y dejan el juego listo para manejarlo desde page.evaluate().
const path = require('path');
const fs = require('fs');

function cargarPlaywright() {
  try { return require('playwright'); } catch (e) {}
  for (const p of ['/opt/node-tools/node_modules/playwright']) { try { return require(p); } catch (e) {} }
  console.error('No encuentro Playwright. Instálalo con:  npm i -D playwright  (y luego  npx playwright install chromium)');
  process.exit(1);
}

async function abrirJuego(opts = {}) {
  const { chromium } = cargarPlaywright();
  const launch = {};
  const local = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  if (process.env.PW_CHROMIUM) launch.executablePath = process.env.PW_CHROMIUM;
  else if (fs.existsSync(local)) launch.executablePath = local;
  const browser = await chromium.launch(launch);
  const errores = [];
  async function nuevaPagina(viewport) {
    const page = await browser.newPage(viewport ? { viewport } : {});
    page.on('pageerror', e => errores.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errores.push('console: ' + m.text()); });
    // Las fuentes de Google no hacen falta para simular.
    await page.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
    const html = opts.html || path.resolve(__dirname, '..', 'index.html');
    await page.goto('file://' + html + (opts.query || ''));
    return page;
  }
  return { browser, nuevaPagina, errores };
}

// Argumentos sencillos tipo  --mundos 10 --años 50
function args(def) {
  const a = { ...def }, v = process.argv.slice(2);
  for (let i = 0; i < v.length; i++) if (v[i].startsWith('--')) { const k = v[i].slice(2); const n = v[i + 1]; a[k] = n !== undefined && !n.startsWith('--') ? (isNaN(+n) ? n : +n) : true; if (a[k] !== true) i++; }
  return a;
}

function guardar(nombre, texto) {
  const dir = path.resolve(__dirname, 'out');
  fs.mkdirSync(dir, { recursive: true });
  const f = path.join(dir, nombre);
  fs.writeFileSync(f, texto);
  return f;
}

module.exports = { abrirJuego, args, guardar };
