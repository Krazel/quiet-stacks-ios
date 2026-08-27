# Quiet Stacks — prueba táctil provisional de una sala

Estado: especificación de prototipo interno, no UI ni arte final  
Propósito: decidir si cámara, drag, staging, carro y snap sostienen la fantasía
antes de producir la biblioteca del MVP

## Puerta visual

Este prototipo puede construirse antes de la aprobación visual porque valida
motor, dominio e interacción. Debe mostrar permanentemente la marca
`PROVISIONAL TOUCH PROTOTYPE`, usar geometría de depuración de alto contraste y
evitar cualquier apariencia que pueda confundirse con UI o arte final.

No puede:

- convertirse por inercia en la pantalla final;
- usar las V2 como maestras;
- fijar paleta, materiales, tipografía, HUD, iconos, decoración o animación;
- generar screenshots de tienda;
- mover propuestas a `design/approved/`;
- sustituir las nuevas imágenes completas ni la aprobación explícita del
  propietario.

## Preguntas que debe responder

1. ¿Se entiende que la sala continúa fuera de pantalla y que la cámara es parte
   del trabajo, no una vista decorativa?
2. ¿Pan y zoom conservan orientación entre exploración, staging y estantería?
3. ¿El jugador puede arrastrar un libro sin mover accidentalmente la cámara y
   puede mover la cámara sin agarrar libros?
4. ¿Crear pilas y usar el carro permiten inventar un método propio?
5. ¿Snap, intercambio y colocación provisional son predecibles en cualquier
   zoom?
6. ¿Clasificar resulta satisfactorio sin tiempo, puntuación, monedas o premios
   externos?
7. ¿guardar, cerrar y reanudar conserva exactamente los 60 libros, pilas, carro
   y cámara?

## Contenido fijo de la prueba

### Mundo

- una sala continua de depuración, aproximadamente 3 anchuras × 3,5 alturas de
  viewport al zoom de trabajo;
- bounds de cámara mayores que la pantalla; incluso al zoom mínimo operativo no
  se ve el mapa completo;
- tres landmarks geométricos fijos para comprobar orientación;
- tres filas de estantería con 20 slots cada una;
- suelo navegable con seis anchors de staging;
- un carro físico de cinco slots y dos puntos opcionales de aparcamiento;
- una bandeja de recuperación visible pero vacía al inicio.

Las dimensiones exactas deben calcularse en puntos/escala del dispositivo de
referencia y registrarse junto al resultado; los multiplicadores anteriores
expresan la condición de recorte, no un layout final.

### Libros

Exactamente 60 `BookID` estables:

- tres secciones, una por fila;
- dos series por sección;
- diez volúmenes por serie;
- 60 slots totales y una solución comprobada automáticamente;
- anchura lógica uniforme en la primera prueba para aislar input; un segundo
  pase opcional introduce spans 1/2 solo después de superar el gesto básico.

Cada libro de depuración muestra redundancia deliberada:

- forma simple por sección;
- patrón/segmento por serie;
- número grande del 1 al 10;
- etiqueta accesible: `Section <x>, Series <y>, Volume <n>`.

Estos marcadores prueban legibilidad lógica, no son arte aprobado.

### Distribución inicial

- cinco libros en el carro;
- 30 libros en seis pilas iniciales de cinco;
- 15 libros sueltos en suelo permitido;
- diez libros colocados provisionalmente en slots, con mezcla de correctos e
  incorrectos;
- las tres filas incompletas;
- ningún libro fuera de bounds ni oculto por completo.

La distribución se genera desde una seed fija y se verifica por ID. Debe ser
idéntica en cada ejecución limpia.

## Implementación provisional mínima

Incluye:

- `WorldDefinition`, `BookDefinition`, `WorldState` y `StableBookLocation` de
  prueba;
- escena SpriteKit + `SKCameraNode` como hipótesis a auditar;
- geometría plana y labels de depuración;
- pan, pinch zoom, foco/retorno y auto-pan de borde;
- seleccionar, arrastrar, soltar, apilar, desapilar, mover pila, cargar/descargar
  carro, mover carro, encajar e intercambiar;
- destinos preview: compatible, provisional, intercambiable o imposible;
- validación de sección/serie/volumen y estado de las tres filas;
- un-step undo;
- modo alternativo `Select & Place`;
- autosave local, cierre/reanudación y controles internos de corrupción;
- panel de métricas de desarrollo local, no analítica.

Excluye:

- arquitectura, fondos, materiales, iluminación o VFX finales;
- HUD final, onboarding definitivo, Settings visual o final de juego;
- audio/háptica finales (se permiten pulsos/tonos neutros de prueba);
- progresión de seis zonas o contenido de 180 libros;
- servicios, red, cuentas, analítica, tracking o distribución.

## Modelo de interacción

Todos los umbrales se miden en puntos de pantalla. Valores iniciales que deben
ajustarse con evidencia, no copiarse al producto sin revisión:

- slop de tap: 6 pt;
- activación de pan desde fondo: 8 pt;
- activación de drag de entidad: 6 pt;
- base de pila: press de 250 ms sobre su handle antes de mover el contenedor;
- snap inicial: 28 pt al centro/anchor compatible;
- banda de auto-pan: últimos 36 pt del borde;
- demora de auto-pan: 250 ms;
- velocidad de auto-pan: curva progresiva con límite, registrada en el pase;
- zoom provisional: rango que permita las tres escalas pero conserve al menos
  35% del mundo fuera del viewport al zoom mínimo.

Los hit targets interactivos deben ser al menos 44×44 pt de pantalla mediante
áreas invisibles si la geometría provisional es menor.

## Matriz de gestos y arbitraje

| Entrada | Inicio permitido | Resultado | Prioridad/cancelación |
|---|---|---|---|
| Tap en libro | cuerpo/label del libro | selecciona y anuncia identidad/ubicación | no mueve dominio |
| Tap en destino con libro seleccionado | slot, carro, pila o suelo | ejecuta `Select & Place` con el mismo preview/transaction de drag | controles de overlay ganan |
| Drag de libro | libro; supera 6 pt | muestra ghost/origen reservado, previews y drop atómico | segundo dedo cancela draft y restaura origen |
| Pan de un dedo | fondo no interactivo; supera 8 pt | desplaza cámara dentro de bounds | nunca empieza sobre libro/handle |
| Pinch + pan de dos dedos | cualquier parte de superficie jugable | zoom alrededor del centroid y pan simultáneo | prioridad sobre todo draft no confirmado |
| Doble tap en fila/landmark | hit region de entidad espacial | anima foco a escala adecuada | no cambia ubicaciones |
| Doble tap en fondo | fondo | vuelve a la escala/pose anterior | se ignora durante drag |
| Hold/drag en handle de pila | base separada de libros | mueve pila completa y activa auto-pan | los libros mantienen ordinals |
| Drag en libro superior de pila | cuerpo del libro | extrae solo ese libro | el handle no solapa el cuerpo |
| Tap en pila | pila colapsada | abre/fanea para seleccionar cualquier libro | no altera orden hasta un drop |
| Drag en asa del carro | asa/chasis separado | mueve carro y contenido como unidad | libros del carro no se seleccionan desde el asa |
| Drag en libro del carro | cuerpo del libro | mueve solo ese libro | prevalece sobre chasis si hits se solapan |
| Drag cerca de borde | drag activo dentro de banda | auto-pan gradual y mantiene el libro bajo el dedo | no cambia zoom; se detiene al salir de banda |
| Drop en slot libre | preview compatible/provisional | snap y transacción; puede quedar lógicamente provisional | si falla invariante vuelve al origen |
| Drop en slot ocupado | preview `swap` compatible | intercambio atómico | si el origen no acepta desplazado, no ofrece swap |
| Drop sin destino | suelo permitido | deja libro suelto o crea pila según preview explícito | fuera de superficie vuelve al origen |
| Tap en Undo | control de prototipo | aplica inversa de última transacción y guarda | overlay SwiftUI gana |

No se permite reconocer simultáneamente pan de fondo y drag de libro. El pinch
puede comenzar en cualquier sitio porque su cancelación es reversible: el
dominio aún no había cambiado.

## Snap y feedback de prueba

El prototipo usa formas, textos y pulsos neutros:

- **compatible físicamente**: contorno sólido + símbolo de ancla;
- **provisional lógicamente**: contorno discontinuo + símbolo `?`;
- **swap**: dos flechas + preview de ambos destinos;
- **imposible**: línea cruzada + el libro conserva origen;
- **fila validada**: check geométrico, texto accesible y pulso neutro;
- **fila con conflicto**: código textual de depuración, nunca solo color.

Un drop se resuelve según geometría y ranking documentado, no por el resultado
lógico deseado. El juego permite errores provisionales y solo confirma la fila
cuando pasa la regla.

## Guion de prueba funcional

### Pase A — orientación y cámara

1. Abrir desde seed limpia en escala de trabajo.
2. Sin instrucciones de gesto, identificar estantes, carro y al menos una pila.
3. Pan hasta los tres landmarks, usar pinch y enfocar una fila.
4. Volver a la zona inicial sin usar menú/lista.
5. Repetir con Reduce Motion.

### Pase B — drag y arbitraje

1. Mover diez libros entre suelo, pila, carro y shelf a tres escalas de zoom.
2. Iniciar drag y añadir segundo dedo; confirmar cancelación sin movimiento de
   dominio.
3. Pan desde fondo junto a libros pequeños; confirmar cero selecciones falsas.
4. Arrastrar a través de un borde con auto-pan y soltar en destino visible tras
   desplazamiento.
5. Repetir toda la secuencia con `Select & Place`.

### Pase C — método propio

1. Crear una pila nueva por serie.
2. Dividir y unir pilas; extraer un libro que no estaba arriba mediante fan.
3. Cargar cinco libros, mover el carro y descargar en dos estantes.
4. Mover una pila completa usando su handle.
5. Observar si staging reduce recorridos y si sus acciones son reversibles.

### Pase D — snap, swap y validación

1. Hacer un drop correcto, uno provisional y uno imposible.
2. Intercambiar dos slots compatibles.
3. Intentar swap incompatible y verificar que ambos libros regresan sin cambio.
4. Completar una serie fuera de orden; después corregirla.
5. Completar las tres filas y confirmar auditoría global de 60/60.

### Pase E — persistencia y recuperación

1. Dejar libros en cada tipo de ubicación, mover cámara y cerrar tras save.
2. Reabrir y comparar snapshot completo por ID/ubicación/cámara.
3. Forzar cierre antes, durante y después de fronteras de escritura simuladas.
4. Corromper copia principal de test y recuperar backup+journal.
5. Simular una migración con stack retirado y verificar recovery tray.
6. Ejecutar secuencias aleatorias y confirmar ningún ID perdido/duplicado.

## Instrumentación local

El prototipo puede registrar a un archivo de test local y descartable:

- tipo de intención detectada y hit inicial;
- tiempo hasta feedback visual;
- zoom y distancia screen/world;
- target previsto y target confirmado;
- cancelaciones, drops rechazados y selecciones falsas;
- inicio/duración/velocidad de auto-pan;
- uso de pile/cart/Select & Place;
- frame time, nodos visibles y memoria;
- checksum e invariantes de cada save de test.

No es analítica de producto: no sale del dispositivo, no contiene identidad de
persona y se elimina al acabar la prueba.

## Métricas y umbrales de paso

Registrar dispositivo, versión de iOS, orientación, build, seed y modo de input.
Los umbrales iniciales son:

| Dimensión | Métrica | Pasa si |
|---|---|---|
| Comprensión | tiempo hasta describir objetivo | mediana ≤10 s sin explicar la regla completa |
| Continuidad | reconoce que hay mundo fuera de pantalla | 100% de sesiones observadas tras primer pan/zoom |
| Orientación | volver a un landmark conocido tras zoom+pan | mediana ≤3 s y sin abrir lista/menú |
| Precisión | drops que terminan en el target previsualizado | ≥95% en 50 drops controlados |
| Conflicto | drag interpretado como pan o pan como pickup | ≤2% de intenciones controladas |
| Pinch seguro | drafts cancelados sin mutación al entrar segundo dedo | 100% |
| Auto-pan | drop remoto completado sin salto observable de libro | ≥9/10 intentos por borde |
| Staging | uso espontáneo de carro o pila para reducir recorridos | en ≥4/5 sesiones completas |
| Método | se observan al menos dos estrategias de orden distintas | sí, sin forzar secuencia |
| Snap | acierto de target en zoom mínimo, medio y máximo | ≥90% por escala; nunca commit a target no previsualizado |
| Feedback | distingue provisional, correcto e imposible sin depender de color | ≥4/5 sesiones |
| Latencia | touch-to-preview p95 | ≤50 ms |
| Fluidez | frame time durante drag/pinch | objetivo 60 fps; p99 <33 ms, sin bloqueos visibles |
| Persistencia | igualdad de 60 IDs y ubicaciones tras reload | 100% en todos los casos automatizados |
| Recuperación | corrupción/migración no pierde ni duplica libros | 100% |
| Solubilidad | completar las tres filas desde seed fija | 60/60, auditoría determinista PASS |
| Deseo de seguir | tras primera fila, el jugador elige continuar sin recompensa | ≥4/5 sesiones, se registra cualitativamente |

Para métricas humanas se recomiendan cinco sesiones observadas con al menos
tres personas cuando exista disponibilidad y sin asumir coste ni outreach. Si
solo hay auto-prueba interna, los resultados deben etiquetarse como insuficientes
para validar comprensión, método y deseo de seguir.

## Criterios de fallo y decisión

La prueba **no pasa** si ocurre cualquiera:

- el mapa parece una decoración y el jugador opera principalmente desde listas;
- hay que alejar tanto la cámara que el mundo completo se convierte en miniatura;
- pan/zoom/drag siguen ambiguos tras un ciclo razonable de ajuste;
- libro y destino saltan por errores de conversión al hacer auto-pan;
- carro o pilas no aportan una estrategia y se sienten como pasos obligatorios;
- los números/emblemas solo son legibles en un zoom impráctico;
- ordenar la segunda fila necesita timer, monedas o recompensas para resultar
  tolerable;
- un save/reload cambia, pierde o duplica cualquier libro;
- SpriteKit impide una ruta accesible equivalente o incumple presupuesto en el
  dispositivo de referencia.

Si falla por tuning, se documenta la hipótesis y se repite una sola variante
controlada. Si falla por arquitectura, se conserva el dominio y se prueba otro
host/render según `ARCHITECTURE.md`. Si falla la fantasía central, no se produce
el contenido de 180 libros.

## Evidencia de salida

El carril de prototipo debe entregar al cerebro del proyecto:

- commit/build exactos y dispositivo usado;
- tabla de métricas con raw counts, no solo `PASS`;
- grabación o capturas de depuración claramente marcadas como provisionales;
- log de invariantes de 60/60 y pruebas de recuperación;
- conflictos encontrados y cambio de umbrales aplicado;
- recomendación concreta: confirmar SpriteKit+SwiftUI, repetir con un ajuste o
  reabrir arquitectura;
- ninguna afirmación de aprobación visual.

