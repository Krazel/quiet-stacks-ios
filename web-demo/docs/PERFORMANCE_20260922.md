# Informe físico 0.17.7 y corrección local del 22/09

El usuario compartió `Quiet-Stacks-performance-0.17.7-1790071934220.json`.
Se conserva en `local-data/performance-0177-user-20260922.json`, fuera del código
público. Informe automático completo de 23,641 s, catálogo de 1.119 libros,
viewport 874×402, WebGL, DPR 2, dispositivo físico iPhone18,3. El contexto nativo
indica iOS 26.6, temperatura nominal, ahorro de energía desactivado y pantalla
capaz de 120 Hz. La cadencia observada del test ronda 60 Hz, no 120.

| Etapa | FPS enviados | Dibujo mediano / p95 | Intervalo máximo |
|---|---:|---:|---:|
| Cámara abierta | 59,73 | 7 / 11 ms | 27 ms |
| Zoom | 58,68 | 10 / 15 ms | 36 ms |
| Arrastre simulado | 59,67 | 9 / 13 ms | 29 ms |
| Estanterías ordenadas | 49,04 | 12 / 25 ms | 52 ms |

Reposo sin redibujos del catálogo; colocación 0–1 ms; cero avisos de memoria,
cero terminaciones. Los 199,8 MiB son una estimación de texturas GPU, no memoria
total del proceso. El informe no mide presentación GPU ni respuesta táctil real
en el arrastre automático. No permite atribuir todos los tirones a una causa única.

## Causa confirmada y cambio

`gallery-book-motion.js` ejecutaba `matchMedia()` dentro de `rect()` por cada libro,
incluidos los que no estaban animándose o acababan descartados por visibilidad.
Con 1.119 libros se creaban 1.120 consultas por fotograma contando `tick()`.
La comparación Chrome registró 201.600 llamadas durante 180 fotogramas.

Ahora se conserva una única MediaQueryList viva, se lee su preferencia una vez
por fotograma y los libros sin animación devuelven su rectángulo sin transformar.
La preferencia de accesibilidad sigue respondiendo a cambios. El atlas, calidad,
resolución, colocación, selección y animaciones no se reducen.

## Comparación local

Mismo Chrome/viewport 874×402/DPR 2, 180 fotogramas por muestra, recorrido fijo.
Estas mediciones no son del iPhone ni prometen su mejora exacta.

| Escena | Mediana antes → después | p95 antes → después |
|---|---:|---:|
| Ordenada | 3,1 → 0,7 ms | 4,4 → 1,2 ms |
| Desordenada | 2,9 → 0,7 ms | 4,2 → 1,2 ms |

Cero nuevas consultas matchMedia durante los fotogramas corregidos; misma memoria
de texturas, 13 subidas totales y 2 llamadas de dibujo. Capturas ordenadas idénticas
píxel a píxel. Reposo sin fotogramas de catálogo, cero errores JavaScript.
Evidencia: `artifacts/performance-20260922/motion-ab.json` y capturas adyacentes.

## Informe más preciso

Se conservan los contadores históricos `framesOver33ms/50ms`, que cuentan
submisiones de dibujo lentas. Se añaden `renderIntervalsOver33ms/50ms` para contar
pausas entre submisiones aunque el trabajo JavaScript sea corto. `graphicsAtEnd`
registra el estado gráfico al terminar cada etapa; antes solo se capturaba al inicio
de todo el test. El esquema 1 y el formato JSON compartible permanecen compatibles
con el contenedor iOS. Las notas distinguen el arrastre automático del táctil real.

113 pruebas Node pasan. QA Chrome del test automático y manual, exportación JSON,
copia/compartir, cancelación y restauración exacta de partida pasa sin errores.
Evidencia: `artifacts/performance-20260922/profiler/verification.json`.
Candidata local, sin cambio de versión ni subida iOS.
Siguiente verificación: nuevo informe físico con esta corrección instalada.
