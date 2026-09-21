# Quiet Stacks 0.17.6 (1) — biblioteca completa y lomos coherentes

Candidata autorizada para TestFlight interno. Parte de 0.17.5 (1) y agrupa únicamente el estado aprobado y verificado del producto.

## Contenido

- Biblioteca V2 x3 sin banco y con las uniones de Clockwork y East Alcove reparadas.
- Cámara con vista general hasta un 20 % más amplia y desplazamiento conservado.
- Música A, efectos de interacción y sonido de acierto A con variación de ±1 semitono.
- Animaciones de libros y luces vigentes.
- 960 tomos en 117 colecciones. Los 442 lomos pendientes se rehacen desde el primer original de cada colección; los otros 518 originales se conservan. Todos llevan el número pintado dentro del asset y mantienen el tamaño del juego.
- Inicio y final del aprendizaje con Master Alden, guardado compatible con 0.17.5.
- Se excluyen las propuestas de ordenación por color, que no fueron elegidas.

## Validación previa

- 106 pruebas Node correctas.
- Chrome real: escritorio, móvil horizontal, tableta y Canvas alternativo; 960 posiciones exactas y cero errores.
- Catálogo completo: 960 imágenes cargadas, 442 corregidas, cero números superpuestos durante el render.
- Empaquetado de 1.456 sprites en nueve páginas, con igualdad de píxeles verificada.
- WebGL: 13 cargas, 2 draw calls y 192,72 MiB estimados. Es una medición de navegador/simulador; la prueba física en iPhone sigue correspondiendo a TestFlight.

## Distribución

Versión 0.17.6, build 1, Bundle ID `com.krazel.quietstacks`. Solo TestFlight interno. No beta externa, App Review ni publicación en App Store.

## Entrega verificada

- Commit entregado: `a3cc9feffa4a315e2db7f83ad51bc55fcb92e6e7`.
- GitHub Actions: ejecución `35628997844`, validación nativa y subida correctas.
- IPA: 131.637.672 bytes, SHA-256 `732E16EDF0B1BDBE6299BC8FEA1F20182728DABE62C06470B0088A32E413417C`.
- App Store Connect: build `412b32be-f1d0-46dd-b8ec-77f24c1e6217`, estado `VALID` e `IN_BETA_TESTING`.
- Grupo asignado: `Krazel — pruebas internas`.
- Biblioteca Krazel Studio: ficha `PR-014`, revisión 114.
