# Quiet Stacks 0.17.7 (1) — ajuste completo de estanterías

## Resultado

La biblioteca conserva sus 16 estanterías y 117 colecciones, pero ahora cada
hueco usa la capacidad medida sobre el escenario HD aprobado. El catálogo pasa
de 960 a 1.119 libros. Los 159 tomos nuevos usan lomos propios con el número
integrado en la ilustración.

## Compatibilidad

Las partidas de 960 libros mantienen íntegros los libros, posiciones, estantes,
carrito, orden de dibujo y cámara. Los 159 libros añadidos aparecen en suelo
válido, sin ordenar la partida ni conceder el final. Antes de migrar se conserva
una copia de seguridad local del guardado anterior.

## Validación previa

- 110/110 pruebas de la candidata de entrega.
- Build web reproducible: 43 archivos sin dependencias remotas.
- Bundle nativo generado desde los mismos 43 archivos.
- 1.119 destinos, proporciones y números de volumen verificados.
- La validación en simuladores iPhone/iPad se ejecuta en CI antes de la subida.

## Distribución

Versión 0.17.7, build 1, bundle `com.krazel.quietstacks`. Destino exclusivo:
TestFlight interno en el grupo existente de Krazel. No incluye beta externa,
App Review ni publicación en App Store.
