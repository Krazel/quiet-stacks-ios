# Settings: herraje cuadrado aprobado

2026-09-23. El usuario eligió la tercera propuesta de
designs/settings-options-20260923/: «Vale, nos quedamos con la tercera. implémentala».

Implementada en los archivos web del juego y del checkout de distribución.
Engranaje SVG de 22 px sobre herraje de 32 px, con objetivo táctil de 44×44 px.
Posición superior derecha, margen de 8 px más las áreas seguras reales del
dispositivo. Conserva nombre accesible Settings, foco de teclado y panel vigente.
La actualización de volumen ya no sustituye el SVG por texto. Se mantiene la
ocultación del acceso durante inspección de libros y pruebas de rendimiento.
En modo demo, los controles de desarrollo se desplazan a su izquierda.

Validación: empaquetado web correcto; cuatro comprobaciones con archivos reales
en navegador aislado (iPhone en ambas orientaciones de cámara, iPad, PC).
Verificado objetivo completo, apertura tocando el margen invisible, teclado,
retorno de foco, persistencia del SVG tras cambiar volumen, ocultación contextual,
partida sin cambios y ausencia de excepciones JavaScript. Márgenes seguros
simulados; no se presenta esta comprobación como prueba nativa.
Capturas y recibo: artifacts/settings-square-20260923/.

La build 1.0(1) ya preparada en App Store Connect/TestFlight permanece anterior
a este cambio. Este encargo no sube otra build ni envía a revisión o publicación.

## Simplificación de Settings

Retirado el acceso Performance test. Su enlace de inicialización ahora es
opcional para que el arranque no dependa de un botón ausente. La carta ocupa
una fila y los dos enlaces requeridos quedan juntos debajo.

Se conservan Help & support y Privacy policy: Apple pide una forma de contacto
en la app (1.5) y un enlace accesible a privacidad dentro de la app (5.1.1(i)).
Fuente comprobada: https://developer.apple.com/app-store/review/guidelines/
No obliga a usar estas etiquetas ni a ubicarlos precisamente en Settings;
es la ubicación existente y evita añadir otro acceso.

El usuario solicitó explicar, sin modificar, la suavidad de libros a distancia.
El render actual usa filtrado LINEAR, cuatro muestras cuando scale<1, y limita
DPR a 2. Esto suaviza detalle fino reducido y contiene coste de dibujo; no se
han cambiado assets, resolución, shaders ni zoom. No es una limitación inherente
a que el juego sea web. El peso exacto de cada factor en su dispositivo requeriría
comparación visual específica, no realizada por petición del usuario.

Validación: seis pruebas existentes aprobadas, empaquetado web y cuatro pruebas
de interfaz con archivos reales, sin excepciones y con los dos enlaces presentes.
Evidencias: artifacts/settings-cleanup-20260923/.
