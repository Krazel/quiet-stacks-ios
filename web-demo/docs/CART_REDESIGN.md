# Carrito con huecos elegibles

Cambios aprobados para TestFlight 0.18 (1), junto con el sonido L del suelo.

- Retirada la lista de iconos del resumen, junto con su DOM y estilos.
- Doce huecos persistentes, seis por balda. `cartSlot` conserva cada posición;
  retirar un libro deja un hueco libre, sin compactar los demás.
- Soltar un libro sobre otro del carrito intercambia sus posiciones. Desde la
  corrección local del 23-09 también se intercambia con un libro del suelo,
  mesa o estantería: el ocupante pasa al lugar de origen del libro arrastrado.
- Posiciones medidas sobre el carrito de la ilustración completa 3x: los apoyos
  siguen la pendiente de ambas baldas, con margen para postes y ruedas. Altura
  de los libros de 18 unidades, compatible con la abertura inferior.
- Los guardados anteriores adquieren los huecos según su orden anterior. Conservan
  libros, identidades, posiciones fuera del carrito, cámara y orden de dibujo.
  `slot` mantiene su significado de estantería; `cartSlot` se elimina al salir.

Validación: 118 pruebas Node pasan, incluidas posiciones libres, carrito lleno,
intercambio, guardado/reapertura, migración y rechazo transaccional de huecos
inválidos. Build de 44 recursos correcta. Revisión en navegador del carrito lleno,
intercambio entre baldas, reapertura y movimiento a hueco vacío con viewport
874×402. Sin iconos en el resumen. No equivale a validación en iPhone físico.

Evidencias: `artifacts/cart-redesign/` (capturas y log). Servidor de revisión aislado
`local-data/cart-review-server.mjs`, puerto 4294; su partida de ejemplo no toca el
guardado del juego en 4186. El usuario eligió la tapa suavizada L para el suelo,
con variación aleatoria de ±1,5 semitonos; estanterías y carrito conservan su audio.

Corrección 23-09 posterior a TestFlight 0.18 (1), todavía local: intercambio desde
fuera del carrito, incluso lleno o con huecos libres alrededor. Conserva identidad,
posición de origen, huecos restantes y guardado. Cancelar no intercambia nada.
La inserción automática sin hueco explícito sigue buscando solo huecos libres.
121 pruebas pasan, incluidos arrastre/cancelación/recarga a tamaños escritorio y
móvil desde suelo y estantería; mesa y carrito lleno probados en el modelo.
Build de 44 recursos correcta. Log: `local-data/cart-external-tests.log`.
