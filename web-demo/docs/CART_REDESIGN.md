# Carrito con huecos elegibles

Cambios aprobados para TestFlight 0.18 (1), junto con el sonido L del suelo.

- Retirada la lista de iconos del resumen, junto con su DOM y estilos.
- Doce huecos persistentes, seis por balda. `cartSlot` conserva cada posición;
  retirar un libro deja un hueco libre, sin compactar los demás.
- Soltar un libro sobre otro del carrito intercambia sus posiciones. Un libro
  procedente del suelo busca un hueco libre y no sustituye al ocupante.
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
