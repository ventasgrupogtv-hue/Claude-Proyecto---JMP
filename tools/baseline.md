# Línea base (v0.5, antes de la estabilización 0.6)

Medida el 11-10-2026 con las herramientas de `tools/`, semillas 1, 104730, 209459… (paso 104729). Las reglas son las de la 0.5; lo único que cambió es que el azar ahora tiene semilla.

## Economía inicial

`node tools/auditoria_economica.js --mundos 15`. El jugador no hace tareas ni combate y compra la comida más barata de los 3 poblados amigos más cercanos.

| Hombres | Día en que se queda sin oro (mediana) | Rango | Comida inicial | Coste medio de la ración |
|---|---|---|---|---|
| 3 | 14 | 10–19 | 7 días* | 4,87 oro |
| 5 | 8 | 6–9 | 5 días* | 5,04 oro |
| 8 | 4 | 4–5 | 3 días* | 5,14 oro |

\* 36 raciones repartidas entre las bocas reales. Un soldado con el rasgo Glotón come el doble, por eso con 3 hombres son 7 días y no 9.

## Reinos (10 mundos × 50 años)

`node tools/sim_mundo.js --mundos 10 --años 50`

| Mundo | % reino mayor al final | Máximo % | Reinos vivos | Guerras al final | Caídas | Cambios fuertes | Cambios de dueño | Periodos de 5 años sin guerra | Reinado medio |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 54% | 54% | 4 | 0 | 1 | 11 | 167 | 6/10 | 13,5 |
| 2 | 58% | 58% | 4 | 0 | 1 | 15 | 268 | 2/10 | 13,8 |
| 3 | 68% | 68% | 3 | 0 | 2 | 14 | 174 | 6/10 | 16,4 |
| 4 | 55% | 55% | 4 | 1 | 1 | 20 | 355 | 4/10 | 14,8 |
| 5 | 35% | 51% | 4 | 1 | 1 | 15 | 277 | 7/10 | 17,5 |
| 6 | 42% | 45% | 4 | 0 | 1 | 13 | 122 | 8/10 | 13,7 |
| 7 | 39% | 39% | 4 | 0 | 1 | 19 | 309 | 4/10 | 15,3 |
| 8 | 35% | 45% | 4 | 1 | 1 | 25 | 490 | 4/10 | 15,5 |
| 9 | 53% | 53% | 4 | 2 | 1 | 20 | 291 | 6/10 | 15,2 |
| 10 | 76% | 76% | 3 | 0 | 2 | 19 | 387 | 5/10 | 12,2 |

Resumen:
- Ningún reino supera el 50% al final: **4/10** mundos. Mediana del reino mayor: **54%**.
- Al menos una caída o un cambio fuerte de poder: 10/10.
- Al menos un periodo de 5 años sin guerras entre reinos: 10/10. En 6 de 10 mundos no hay ninguna guerra al año 50: **el mundo tiende a congelarse**.
- Reinado medio: **14,7 años** de juego (102 reinados terminados). Con años de 60 días son unos 15 minutos reales a 1×.

"Cambio fuerte" significa que un reino gana o pierde al menos el 20% de sus feudos (y al menos 2) entre dos muestras de 5 años.

## Rendimiento

`node tools/rendimiento.js` tras 10 años de partida (80 partidas, 59 poblados). Medido en Chromium sin pantalla en un servidor: los valores absolutos de un móvil real serán mayores, pero sirven para comparar.

| Medida | Escritorio 1280×800 | Móvil 390×844 @2x |
|---|---|---|
| render (fotograma del mapa) | 4,10 ms | 4,15 ms |
| renderMini (minimapa) | 4,35 ms | 4,74 ms |
| update (paso de 0,05 s) | 0,077 ms | 0,082 ms |
| un día de simulación | 1,28 ms | 1,37 ms |

## Bot de 48 años

`node tools/bot48.js --mundos 2`: los 2 mundos OK, sin errores en consola, y guardar/cargar funciona.
