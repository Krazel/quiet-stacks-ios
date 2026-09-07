# Quiet Stacks 0.16.5 (1) — optimización

El usuario autorizó implementar las correcciones y subirlas a TestFlight el
2026-09-07. Candidata preparada; distribución pendiente de verificación de CI y Apple.

## Cambios

- Dibujo bajo demanda: no hay bucle de Canvas en reposo. Cámara, selección,
  arrastre, zoom, demo, reintentos y reanudación solicitan el fotograma necesario.
  Eliminado el límite artificial de aproximadamente 30 FPS.
- Recortes de sprites y orden de los libros reutilizados; invalidación por
  cambios de estado y carga. Libros fuera de la vista descartados con un margen
  de dos píxeles de pantalla. Interpolación alta establecida una vez por escena.
- Búsqueda del destino con ocupación calculada una vez y árbol espacial de
  27.697 puntos válidos del contorno. Muestreo máximo de 0,5 píxeles del mundo,
  seguido de refinamiento hacia el intento de soltar. El suelo y mesas válidos
  conservan exactamente las coordenadas elegidas por el jugador.
- Distribución inicial precalculada, idéntica a 0.16.4. El índice y las posiciones
  se regeneran con `scripts/generate-layout.cjs` al modificar geometría.
- Servidor y build comparten la lista de 21 recursos activos, incluidos los
  atlas empaquetados y el índice del mapa. Sin nuevas dependencias de runtime.

Resolución de imágenes, 525 libros, colecciones, números de volumen y formato
de partida conservados. No se han añadido redes, SDKs, anuncios ni idiomas.

## Verificación local

75 pruebas Node correctas. Incluyen: todos los puntos del índice sobre una
superficie válida, distribución inicial exacta, 187 destinos comparados con el
algoritmo anterior (distancia no peor que la anterior más medio píxel),
carrito lleno, mesas, partidas antiguas, identidad y volumen, arrastre, pinch,
reintento asíncrono, cero dibujo en reposo e invalidación al volver al mapa.
El servidor entrega los 21 recursos con bytes idénticos y rechaza rutas ajenas.

Comparación real de Canvas frente al renderer 0.16.4: **cero píxeles distintos**
en seis escenas, ordenadas y desordenadas, a zoom 1, 3,5 y 8. La diferencia de
borde observada en el prototipo de auditoría no aparece en esta candidata.
La captura se toma directamente del Canvas, con cámara fijada y dibujo asentado.

En tres pares de ensayos de Chrome con CPU ralentizada 4×, viewport 812×375,
DPR 2, la mediana de FPS de desplazamiento general pasa de 28,8 a 43,7; con zoom,
de 27,9 a aproximadamente 46. En reposo se pasa de unas 15.000 llamadas de dibujo
por segundo a cero. **Son datos de escritorio, no del iPhone.** No se acredita
60 FPS sostenidos en el dispositivo. La prueba de arranque del módulo baja de
aproximadamente 91 a 4 ms, excluyendo descarga, parseo y decodificación de imágenes.

Los cuatro destinos difíciles se repiten 15 veces: en la candidata ninguno
supera 3 ms en esta ejecución; el anterior alcanza unos 250 ms en la esquina.
El guardado y los libros restaurados se verifican en navegador real.

Evidencias: `artifacts/performance-0165/verification.json`, capturas de esa
carpeta y `scripts/verify-performance.cjs`. Los fixtures contienen el código
0.16.4 para repetir la comparación sin depender de historial Git remoto.

## Validación y distribución nativas

La QA de simulador ahora comprueba reposo sin dibujar y tres segundos de
movimiento con nuevos fotogramas, además de 45 segundos de sesión, ordenar,
desordenar, guardar, reabrir y copiar el diagnóstico de un fallo provocado.
El código de prueba está limitado a `TARGET_OS_SIMULATOR`.

Pendiente: resultado de la ejecución de CI, firma/subida, procesamiento de Apple
y activación en el grupo interno existente. La fluidez sostenida y memoria real
en iPhone X/iOS 16.7.16 deberán contrastarse con el dispositivo tras instalar.
