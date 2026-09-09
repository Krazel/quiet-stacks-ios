# Quiet Stacks · biblioteca completa (0.17.1)

Juego web local de ordenar 960 libros en 117 colecciones, con 16 estanterías completas y nombradas. HTML, JavaScript y Canvas/WebGL, empaquetado para iOS 16+ con WKWebView. La interfaz del juego está en inglés.

Las estanterías empiezan vacías. Los libros se mueven únicamente arrastrándolos. Pulsar un libro abre su cubierta y metadatos; la ficha compacta aparece desde el inicio del arrastre. Soltar en una superficie bloqueada busca la posición válida más cercana. Se puede dejar libros en suelo, mesas y carro, sin clasificación automática ni pistas de destino.

Cada colección tiene su propia encuadernación y un hueco con capacidad para todos sus volúmenes. Los lomos comparten tamaño de 9 × 27 unidades y llevan la numeración integrada. El menú Demo permite ordenar o dispersar todos los libros para probar. La cámara admite arrastre y pellizco; los paneles no permiten selección de texto ni zoom del navegador.

La pantalla se llena con la biblioteca y márgenes de madera. El área jugable respeta la cámara del iPhone y deja separación adicional sobre el gesto inferior. Un borde dorado discreto identifica el libro seleccionado y lo acompaña durante el arrastre. Luces suaves y motas cerca de las ventanas se animan en una capa independiente, a 12 FPS en reposo y sincronizadas durante el movimiento de cámara. Reducir movimiento desactiva esos efectos. El escenario y los libros no se redibujan en reposo.

La partida local conserva los 525 ejemplares anteriores, sus identidades y posiciones válidas; los nuevos volúmenes se añaden al suelo. La migración a mapa revisión 2 guarda una copia de la partida anterior. Los informes de rendimiento permiten compartir un archivo JSON desde iOS.

## Ejecutar y verificar

- `npm start`: demo en `http://127.0.0.1:4179/`.
- `npm test`: 86 pruebas, incluido el prototipo histórico conservado.
- `npm run build`: 24 recursos activos, sin dependencias de ejecución.
- [Biblioteca y assets 0.17.0](docs/EXPANDED_LIBRARY_0170.md).
- [Márgenes seguros y selección 0.17.1](docs/SAFE_PLAYFIELD_0171.md).

La distribución usa el repositorio autorizado Krazel/quiet-stacks-ios, pruebas en simulador y firma/subida automatizadas. El estado comprobado de la build y de TestFlight se registra en el documento de entrega; una prueba de navegador o simulador no equivale a aceptación en el iPhone físico del usuario.
