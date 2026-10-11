# Herramientas de prueba de Estandarte

Scripts que abren `index.html` en Chromium sin ventana (con Playwright) y juegan o simulan partidas a toda velocidad. Sirven para medir el equilibrio y cazar errores antes de entregar una versión.

## Instalación (una vez)

Hace falta Node.js 18 o superior.

```
npm i -D playwright
npx playwright install chromium
```

Si ya tienes un Chromium instalado, indica su ruta con la variable `PW_CHROMIUM`.

## Scripts

Todos se ejecutan desde la raíz del repositorio. Los resultados en CSV se guardan en `tools/out/`, que Git ignora.

| Script | Qué hace | Ejemplo |
|---|---|---|
| `bot48.js` | Un bot juega partidas largas: comercia, recluta, gestiona un feudo, ataca aldeas, guarda y carga. Falla si hay errores de JavaScript o valores NaN. | `node tools/bot48.js --mundos 2 --años 48` |
| `auditoria_economica.js` | Un jugador nuevo que no hace tareas ni combate, con 3, 5 u 8 hombres: ¿en qué día se queda sin oro? También mide el coste medio de la ración. | `node tools/auditoria_economica.js --mundos 15` |
| `sim_mundo.js` | N mundos durante X años sin jugador activo. Cada 5 años anota el % de feudos del reino mayor, los reinos vivos, las guerras activas y los cambios de dueño. Resume caídas, cambios fuertes de poder, periodos sin guerra y la duración media de los reinados. | `node tools/sim_mundo.js --mundos 10 --años 50` |
| `rendimiento.js` | Mide cuánto tarda dibujar el mapa, el minimapa y simular, después de unos años de partida. | `node tools/rendimiento.js --movil` |

Opciones comunes: `--semilla N` cambia los mundos. `sim_mundo` acepta además `--paralelo N` (mundos simultáneos) y `--csv nombre.csv`.

## Reproducibilidad

Todo el azar de la simulación usa la función `rng()` del juego, con semilla. La misma semilla da siempre el mismo mundo y la misma historia, así que un cambio en las reglas se puede comparar con la línea base de `baseline.md` usando los mismos mundos.
