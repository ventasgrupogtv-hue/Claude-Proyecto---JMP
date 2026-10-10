# CLAUDE.md — Estandarte

Contexto para cualquier sesión de Claude que trabaje en este repositorio. Léelo completo antes de tocar código.

## Quién y cómo trabajamos

- Dueño del proyecto: Gustavo (cuenta GitHub `ventasgrupogtv-hue`). Habla en español; responde y comenta en español.
- No es programador: explica los cambios en términos de juego (qué se siente distinto), no de código.
- Ciclo de trabajo: Claude hace una versión → Gustavo la prueba en su navegador y en el móvil → dice qué se siente mal → se ajusta.
- Se construye **por bloques**: terminar y probar un sistema antes de empezar el siguiente.
- Con acceso al repo, Claude hace los cambios en una rama, commit claro en español y pull request. No hagas push directo a `main` sin que Gustavo lo pida.

## Visión

Juego medieval en 2D pixel art visto desde arriba (estilo WorldBox / TheoTown), pequeño en gráficos pero profundo en mecánicas. **Nada en primera persona**; todo se maneja desde el mapa.

- **Bannerlord** como modo de juego principal: mundo abierto, tu personaje y su grupo, entrar en poblados, comerciar, reclutar, combatir, asediar.
- **Crusader Kings**: reinos con gobernantes, casas, diplomacia, herencias.
- **Kingdom Come**: realismo personal (comida, heridas, moral, reputación).

Idea central: *un mundo que vive aunque tú no hagas nada, y tú eres un señor más dentro de él.*

## Estado actual

- Versión de trabajo: **0.4.2** (el README dice 0.4 y el `<title>` del `index.html` dice "prototipo 0.1": hay que unificarlos).
- Publicado en GitHub Pages: https://ventasgrupogtv-hue.github.io/Claude-Proyecto---JMP/
- También existió una copia como artifact de Claude (https://claude.ai/artifact/P5gx2Vg6a3DyAQ5Ku91CUH). **A partir de ahora la fuente de verdad es este repositorio.**

## Arquitectura técnica (reglas)

- **Un solo archivo `index.html`** (~118 KB) con JavaScript y canvas, **sin librerías**. Solo carga las fuentes Pixelify Sans e IM Fell English de Google Fonts. Mantenerlo así salvo que Gustavo decida otra cosa.
- Mapa 150×100 casillas, 8 px por casilla, generado con ruido: agua, arena, pradera, bosque, colinas y montañas.
- Sprites hechos por código con contorno automático. Castillos y aldeas se generan de forma única por asentamiento.
- Tiempo real: 1 día = 1 s a 1×. Temporadas de 15 días, años de 60. Pausa y 1×, 2× y 4×.
- Guardado en `localStorage` con la clave `estandarte_v03`. Las partidas de versiones anteriores no son compatibles. Si cambias el formato del guardado, sube la clave o migra, y avísale a Gustavo.
- Debe funcionar en el navegador de escritorio y en el **móvil** (toque, arrastre de cámara).

### Cómo probar antes de entregar

1. Simular partidas largas en Node.js con un bot que juega (referencia: 48 años sin errores).
2. Generar capturas reales del juego (Chromium/Playwright) y revisarlas.
3. Comprobar que no hay errores en consola y que guardar y cargar funciona.

## Sistemas terminados

**Mundo y política**
- 5 reinos con rey o reina (nombre, número regio, edad, rasgos: Belicoso, Pacífico, Ambicioso…), casa nobiliaria y capital.
- Fundan aldeas, declaran guerras, forman ejércitos y patrullas, asedian y firman la paz. Los gobernantes envejecen, mueren y heredan. Un reino sin tierras cae y sus soldados se vuelven bandidos.
- Caminos de tierra entre poblados (viajar por ellos es un 30% más rápido). Crónica del mundo.

**Jugador**
- Caballero con nombre propio, 2 rasgos (Carismático, Guerrero, Astuto, Ambicioso), nivel y medicina.
- Rangos por renombre (límite de hombres = tabla + nivel):

| Renombre | Rango | Hombres |
|---|---|---|
| 0 | Caballero errante | 12 |
| 20 | Señor menor | 20 |
| 50 | Capitán | 32 |
| 100 | Barón | 48 |
| 200 | Conde | 70 |
| 400 | Duque | 100 |

- Vasallaje: jurar lealtad (desde 8 de renombre), paga diaria, heredar las guerras del señor. Romper el juramento, declarar la guerra y proponer la paz.

**Poblados**
- Al entrar, el personaje desaparece del mapa, el tiempo se detiene y se ve una escena con menú.
- Aldeas: mercado, reclutar voluntarios, tareas del alcalde, trabajar 2 días, descansar.
- Castillos: además herrería, taberna (mercenarios, rumores), tratante de esclavos y salón del señor.

**Economía**
- 8 mercancías: grano, pescado, ganado, madera, hierro, lana, vino y sal.
- Cada aldea produce según su terreno y envía el excedente al castillo más cercano. Los precios se fijan por oferta y demanda.
- Comida: grano y pescado dan 2 raciones, ganado 6. Se come primero el tipo más abundante.
- Carga: 30 + 12 por persona. Pasarse frena al grupo.

**Combate**
- Batallas en tiempo real sobre el mapa con órdenes: Cargar, Mantener la línea y Retirada.
- Pantalla de encuentro (aptos, equipo medio, moral y probabilidad de victoria) → luchar dirigiendo, resolver al instante o huir.
- Más hombres y mejor equipo dan más probabilidad, con un factor de suerte. Tu señor dirige desde la retaguardia; si cae, se pierde la batalla.

**Bloque 1 (el último terminado)**
- Moral 0–100 en el HUD con su desglose. Afecta la velocidad y produce deserción por debajo de 25. En batalla cada bando tiene su barra y se desbanda por debajo de 15.
- Heridos según rango y medicina: no pelean, frenan al grupo y se curan con el tiempo. Los enemigos heridos y parte de los que huyen pasan a ser prisioneros.
- Árbol de tropas: Recluta → Soldado → Guardia o Hachero → veterano → élite. Se asciende pagando cuando hay experiencia suficiente, y cada ascenso mejora el equipo.

**Otros**: equipo en 4 niveles (Harapos, Gambesón, Cota de malla, Placas), visible en los sprites. Tareas (cazar bandidos marcados con ! rojo, entregar mercancías). Prisioneros. Saqueo y asalto de aldeas y castillos. Ocupar o saquear un castillo tomado. Guarniciones propias.

## Decisiones tomadas (no cambiar sin consultar)

- Nada en primera persona.
- Sprites pequeños: más detalle, no más tamaño.
- Cada castillo y cada aldea deben verse distintos.
- Saquear aldea: 15 hombres. Tomar aldea: 10. Asaltar castillo: 30 hombres y 8 de madera (escalas).
- La moral se mueve un 8% al día hacia su objetivo, con un máximo de 2,5 puntos diarios (se ajustó porque antes iba demasiado rápida).
- Recibir el castillo de prueba no genera guerra.
- Seguir la estructura de Bannerlord: renombre, moral, notables, influencia, feudos y sucesión.

## Bugs y limitaciones conocidas

- [ ] Botón trampa temporal para recibir un castillo de prueba: quitarlo antes de una versión final.
- [ ] Bola de nieve: en simulaciones largas un reino termina dominando casi todo el mapa. Hay que equilibrar la expansión y la guerra.
- [ ] Economía temprana ajustada: el bot suele quedarse sin dinero. Validar con partidas reales.
- [ ] Con un encuentro abierto se pausan todos los combates del mundo (no afecta al jugar).
- [ ] Puedes aparecer pegado a una aldea al empezar, y las batallas a veces ocurren encima de los poblados.
- [ ] El señor del jugador combate aunque esté gravemente herido.
- [ ] Los feudos solo dan oro (7/día por castillo, 3/día por aldea); no tienen gestión.
- [ ] Las partidas no pasan entre enlaces (artifact vs GitHub Pages) ni entre versiones.
- [ ] Versión desalineada entre README (0.4), `<title>` (0.1) y la versión real (0.4.2).
- [ ] Sin probar todavía en el navegador ni en el móvil de Gustavo: puede haber detalles de interfaz.

## Hoja de ruta

1. **Gestión de feudos** (siguiente sugerido): prosperidad, lealtad, seguridad, comida del castillo, milicia y proyectos de construcción.
2. Notables con nombre y relación en cada aldea (mejores reclutas y tareas).
3. Habilidades por uso (combate, liderazgo, comercio, medicina, exploración, mayordomía) con puntos de enfoque.
4. Influencia y ejércitos aliados como vasallo, con cohesión.
5. Asedios por fases: cerco, hambre de la guarnición, máquinas de asedio y asalto.
6. Talleres y caravanas como ingreso pasivo.
7. Familia, herederos y sucesión del jugador.
8. Balance general: expansión de reinos, economía inicial y quitar el castillo de prueba.

## Al terminar cada versión

- Subir el número de versión en el `<title>`, en el README y donde se muestre en el juego.
- Actualizar el README (sistemas actuales) y este archivo (estado, bugs, hoja de ruta).
- Explicarle a Gustavo en pocas líneas qué cambió y qué debe probar.
