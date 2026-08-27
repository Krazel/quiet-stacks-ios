# Quiet Stacks — arquitectura composable

Estado: propuesta sujeta a auditoría y a la prueba táctil  
Objetivo: separar reglas, persistencia y entrada del render para construir un
mundo grande con pocos assets reutilizables

## Recomendación provisional

Punto de partida recomendado:

- **SpriteKit** para escena 2D, `SKCameraNode`, picking, capas, LOD, animación,
  audio posicional ligero y render de entidades;
- **SwiftUI** para ciclo de vida, contenedores no jugables, Settings, pausa y
  superficies accesibles;
- **Swift/Foundation puro** para definiciones, estado, comandos, validación,
  guardado y migraciones.

No es una decisión irreversible. Solo se fija si la prueba de una sala demuestra
rendimiento, arbitraje táctil, cámara continua, testabilidad y una ruta de
accesibilidad suficiente. No se introducirá motor externo ni dependencia de
producción sin una decisión material posterior.

## Puerta de auditoría antes de fijar el stack

La prueba descrita en `TOUCH_PROTOTYPE.md` debe responder con evidencia:

1. ¿`SKCameraNode` mantiene pan/zoom/foco estable con un mundo mayor que el
   viewport y coordenadas de drop precisas en todas las escalas?
2. ¿60 entidades independientes, pilas, sombras provisionales y previews de
   destino mantienen el presupuesto de frame en el dispositivo de referencia?
3. ¿el mismo coordinador de entrada puede dar prioridad inequívoca a pinch,
   pan, drag de libro, carro, pila y controles de overlay?
4. ¿podemos exponer cada libro/slot como elemento o acción accesible y ofrecer
   `Select & Place` sin duplicar las reglas del juego?
5. ¿dominio, movimientos, validación y guardado se pueden probar sin cargar una
   escena SpriteKit?
6. ¿la composición visual permite LOD sin crear una textura horneada por libro
   o por estado?
7. ¿el consumo de memoria y energía sigue siendo estable al extrapolar de 60 a
   aproximadamente 180 libros?

Si falla cámara/input o accesibilidad, se reevalúa una superficie UIKit/SwiftUI
personalizada con Core Animation/Core Graphics. Metal solo se consideraría ante
evidencia de un cuello de botella real. La estructura de dominio y guardado no
debe cambiar al sustituir el render.

## Capas y dependencias

```text
AppShell (SwiftUI)
    ├─ Settings / Pause / Recovery / accessibility surfaces
    └─ GameHost (SKView provisional)
           ├─ InputCoordinator
           ├─ CameraController
           └─ WorldRenderer (SpriteKit)
                    └─ reusable nodes + visual descriptors

GameSession
    ├─ CommandDispatcher -> MoveTransaction
    ├─ WorldState
    ├─ RuleValidator
    ├─ LocatorIndex
    └─ SaveCoordinator

Content (immutable, versioned)
    ├─ WorldDefinition
    ├─ BookDefinition
    ├─ Shelf/Row/SlotDefinition
    └─ reusable visual tokens and module definitions
```

Regla de dependencia: AppShell y render observan `GameSession`; el dominio no
importa SpriteKit ni SwiftUI. El render nunca decide si una fila es válida y la
UI nunca modifica directamente una ubicación.

## Mundo y cámara

### Un único espacio persistente

`WorldDefinition` describe una escena conectada en coordenadas de mundo:

- límites y polígono navegable de cámara;
- zonas y landmarks estables;
- arquitectura compuesta por módulos;
- estanterías, filas y slots;
- superficies de staging y puntos de recuperación;
- estado inicial de libros, carro y pilas;
- umbrales de transformación visual derivados del progreso.

No existen escenas separadas para overview, trabajo y shelf. Son rangos de
cámara sobre la misma geometría y los mismos IDs:

| Escala | Uso | Presentación |
|---|---|---|
| Exploración | elegir ala/zona y entender progreso global | arquitectura y landmarks; lomos con LOD simplificado |
| Trabajo | pilas, carro y recorrido cercano | libros individuales, superficies de staging y rutas |
| Estantería | colocar/intercambiar y leer serie/volumen | detalle completo de slots, emblemas y feedback |

El zoom mínimo se calcula para mantener el mundo recortado: nunca ofrece una
miniatura operable de todo el mapa. La cámara conserva orientación mediante:

- bounds y overscroll elástico moderado;
- landmarks persistentes que no cambian de lugar;
- animaciones de foco que recorren el trayecto, no cortes instantáneos;
- retorno a la escala/posición anterior;
- continuidad visual fuera del viewport y pistas en bordes;
- estado de cámara guardado como conveniencia, nunca como fuente de verdad.

`CameraController` trabaja en puntos de pantalla para umbrales y en coordenadas
de mundo para posición. Todas las conversiones pasan por una sola API para que
snap, hit testing y auto-pan sean independientes del zoom.

### LOD sin cambiar el estado

El nivel de detalle solo modifica representación:

- lejos: silueta, color principal y emblema de serie;
- medio: lomo, textura y número;
- cerca: detalles secundarios, contorno y estados de destino.

Un `BookID` y su `BookLocation` no cambian al cruzar un umbral de zoom. Los
nodos pueden reciclarse o simplificarse, pero no se convierten en sprites de una
captura de grupo.

## Modelo de dominio

Tipos estables propuestos:

```swift
typealias BookID = UUID
typealias SectionID = String
typealias SeriesID = String
typealias ZoneID = String
typealias ContainerID = String

struct BookDefinition: Codable, Sendable {
    let id: BookID
    let sectionID: SectionID
    let seriesID: SeriesID
    let volume: Int
    let span: Int
    let visual: BookVisualDescriptor
}

enum StableBookLocation: Codable, Equatable, Sendable {
    case floor(point: WorldPoint, rotation: Float)
    case stack(id: ContainerID, ordinal: Int)
    case cart(id: ContainerID, slot: Int)
    case shelf(rowID: String, slot: Int, span: Int)
    case recoveryTray(slot: Int)
}

struct WorldState: Codable, Sendable {
    let schemaVersion: Int
    let contentVersion: Int
    var placements: [BookID: StableBookLocation]
    var stacks: [ContainerID: StackState]
    var cart: CartState
    var camera: CameraBookmark
    var completedAt: Date?
}
```

La forma exacta puede cambiar tras implementación, pero se conservan estas
invariantes:

1. todo `BookID` definido aparece exactamente una vez en `placements`;
2. dos libros no ocupan el mismo slot/span, salvo ordinals diferentes de una
   pila;
3. los ordinals de pila son contiguos y el libro superior es determinista;
4. todo contenedor, fila y slot referenciado existe en `WorldDefinition`;
5. una operación en curso no forma parte del estado estable ni del guardado;
6. la presentación de progreso se deriva de placements + reglas, no se guarda
   como capturas o duplicados de estado.

`BookState` puede ser una vista derivada (`definition + location + validation`),
no una segunda fuente mutable de verdad.

## Entidades de libro componibles

`BookVisualDescriptor` referencia tokens reutilizables:

- familia de forma y geometría de lomo;
- altura y anchura discretas;
- color de cubierta desde una paleta aprobada;
- textura/patrón repetible;
- emblema de sección;
- marca de serie;
- número de volumen renderizado como texto/glifo;
- hasta dos detalles pequeños (bandas, desgaste, cantonera, marcador).

`BookNodeFactory` compone capas en runtime o desde un atlas pequeño de piezas:

```text
shadow
  + base spine geometry
  + palette/material treatment
  + reusable texture mask
  + section emblem
  + series mark
  + volume glyph
  + optional detail
  + interaction/validation overlay
```

El descriptor se genera de forma determinista a partir de contenido versionado;
no a partir de azar nuevo en cada lanzamiento. Un cambio de arte puede sustituir
un token sin cambiar identidad, regla ni ubicación.

### Por qué no explotan los assets

- 180 libros son 180 registros de datos, no 180 PNG.
- Las combinaciones se producen al componer unas pocas formas, máscaras,
  paletas, emblemas y glifos.
- Los números de volumen son tipografía/glifos; no una textura por número.
- Sombras, selección, destino, provisional, correcto y VFX son overlays
  reutilizables.
- LOD cambia capas visibles de la misma entidad, no carga variantes dibujadas.
- Si el rendimiento exige cachear, la caché se indexa por descriptor y se
  genera durante ejecución/build; nunca se mantiene manualmente por libro.

Antes de arte final, la puerta visual debe aprobar paleta, materiales, forma,
iconografía, tipografía y legibilidad por escala. Esta arquitectura no los fija.

## Arquitectura, estantes y slots

El edificio se ensambla con módulos reutilizables:

- fondos y planos arquitectónicos repetibles;
- tramos de estantería parametrizados por ancho/alto;
- baldas y filas;
- slots lógicos invisibles con `span`;
- suelo, paredes, pasarelas y mobiliario;
- puntos de luz, sombra y VFX;
- landmarks decorativos originales;
- superficies de staging, carro y recovery tray.

Una estantería no tiene una imagen por ocupación. `ShelfNode` renderiza el
módulo base y coloca `BookNode` según los slots ocupados. Polvo, luz o pequeña
restauración usan estados discretos reutilizables derivados del porcentaje
validado de su zona.

`RowDefinition` contiene sección, slots, capacidad y restricciones de contenido.
El builder de contenido valida antes de empaquetar:

- capacidad total por sección;
- anchuras/spans compatibles;
- cada serie completa y volúmenes sin huecos inesperados;
- al menos una asignación final posible;
- ninguna identidad duplicada.

## Pilas provisionales

Una pila es un contenedor del mundo, no una ilustración:

```swift
struct StackState: Codable, Sendable {
    let id: ContainerID
    var anchor: WorldPoint
    var rotation: Float
    var labelToken: String?
}
```

Sus miembros se derivan de `placements` por `stack(id, ordinal)`. Reglas:

- soltar un libro sobre un anchor compatible lo coloca arriba;
- arrastrar el libro superior lo retira; al abrir/fanear la pila se puede elegir
  otro sin perder el orden;
- arrastrar la base/asa de pila mueve el contenedor completo, no cada libro;
- soltar en suelo libre puede crear una pila o mantener un libro suelto según
  la intención/target preview;
- unir o dividir pilas es una transacción atómica;
- el jugador puede asignar un símbolo visual opcional, no texto obligatorio.

Los límites de altura visual pueden colapsar libros inferiores en LOD, pero el
orden completo sigue en datos.

## Carro

El carro es una entidad física con:

- `CartID`, pose en el mundo y cinco slots ordenados;
- hit region separada para asa/chasis y para cada libro;
- bounds de movimiento y rutas accesibles;
- snap suave a puntos de aparcamiento sin obligar a usarlos.

Arrastrar el asa mueve el carro y sus libros como una unidad. Arrastrar un libro
actúa solo sobre ese `BookID`. Si la cámara necesita seguir, usa el mismo auto-pan
de borde. La posición del carro y la ocupación de sus slots se guardan tras cada
drop confirmado.

## Selección, arrastre, encaje e intercambio

### Ciclo de una operación

1. `InputCoordinator` resuelve el hit y entra en `pending`.
2. Superado el umbral de puntos de pantalla, crea un `DragDraft` con origen
   estable; el dominio aún no cambia.
3. `TargetResolver` calcula previews por geometría, capacidad y compatibilidad.
4. Al soltar, `CommandDispatcher` construye un `MoveTransaction`.
5. El dominio valida invariantes físicas, aplica todos los cambios o ninguno.
6. `RuleValidator` recalcula solo filas/zonas afectadas.
7. El render anima desde estado anterior al nuevo y `SaveCoordinator` persiste.

Si se cancela, entra un segundo dedo o no existe destino aceptable, el libro
vuelve visualmente al origen y nunca hubo mutación persistente.

### Snap

Los radios se expresan en puntos de pantalla para mantener sensación constante
con cualquier zoom. Orden de preferencia provisional:

1. slot de estante bajo el centro de agarre;
2. slot libre/intercambiable del carro;
3. anchor de pila;
4. superficie de suelo permitida.

El preview muestra qué pasará antes del drop. Un slot de estante puede aceptar
una colocación lógicamente incorrecta si cabe físicamente; queda provisional.
Nunca se finge que un libro acertó solo porque estaba cerca.

### Intercambio

Un drop ocupado solo ofrece intercambio si el origen puede aceptar legalmente
al libro desplazado:

- shelf↔shelf: intercambia slots/spans compatibles;
- cart↔cart o shelf↔cart: intercambia si ambos slots tienen capacidad;
- stack/floor↔shelf: el libro desplazado vuelve al origen como libro superior
  de pila o a la pose estable anterior;
- si el intercambio no preserva invariantes, el preview lo marca como no
  disponible y el drop se cancela.

Ambos cambios forman una sola `MoveTransaction`; nunca hay un frame persistente
con un libro sin ubicación.

### Undo

La última transacción confirmada conserva su inversa mientras la sesión siga
activa. Undo vuelve a validar y guardar. No es necesario mantener una historia
ilimitada para el MVP.

## Validación

`RuleValidator` es determinista, puro e incremental. Para cada fila afectada:

1. verifica ocupación física y ausencia de solapes;
2. compara `sectionID` de cada libro con la fila;
3. agrupa adyacencias por `seriesID` y rechaza una serie partida;
4. comprueba volúmenes estrictamente ascendentes dentro de cada bloque;
5. compara los IDs presentes con el contenido esperado de la fila/zona cuando
   deba marcar `complete`.

El orden entre bloques de series completas puede variar. El validador devuelve
códigos semánticos, no colores:

```text
empty | incomplete | wrongSection | splitSeries | volumeOrder |
physicalConflict | valid | complete
```

La capa de presentación traduce esos códigos a contorno, símbolo, animación,
sonido, háptica y texto accesible. La aprobación visual decide su aspecto.

La zona se completa cuando todas sus filas están completas y no quedan libros
de su sección fuera. La biblioteca se completa solo cuando:

- todos los `BookID` están en shelves válidos;
- carro, pilas, suelo y recovery tray no contienen libros;
- todas las invariantes globales pasan en una auditoría determinista.

Esto evita la frustración de un último libro invisible: el `LocatorIndex` puede
enumerar siempre los libros pendientes y su contenedor exacto.

## Arbitraje de cámara y gestos

Un solo `InputCoordinator` es dueño de la superficie jugable. Los overlays
SwiftUI interceptan exclusivamente sus controles visibles; el resto deja pasar
la entrada al mundo.

Prioridad:

1. control SwiftUI explícito;
2. gesto de dos dedos (pinch/pan de cámara);
3. asa de carro o base de pila;
4. libro/slot interactivo;
5. fondo para pan de un dedo.

Reglas esenciales:

- los umbrales se miden en puntos de pantalla, no coordenadas de mundo;
- un segundo dedo cancela cualquier draft sin confirmar y entrega el gesto a
  la cámara;
- pan de un dedo solo comienza desde fondo no interactivo;
- drag cerca del borde activa auto-pan gradual sin cambiar de modo;
- doble tap sobre landmark/shelf anima foco; doble tap en fondo retrocede una
  escala;
- Reduce Motion sustituye viajes por transiciones breves sin perder contexto;
- el modo `Select & Place` usa la misma resolución de targets y comandos: tap en
  libro, navegación/foco, tap en destino, confirmación. No es otro juego.

La matriz cuantitativa y los umbrales iniciales están en
`TOUCH_PROTOTYPE.md`; la prueba puede afinarlos sin fijar UI o arte.

## Persistencia local

### Qué se guarda

- versión de schema y contenido;
- identidad y `StableBookLocation` de cada libro;
- anchors/metadatos de pilas;
- pose y slots del carro;
- bookmark de cámara;
- Settings locales;
- fecha de finalización si existe.

No se guardan capturas, nodos SpriteKit, frames, texturas combinadas ni una
imagen de cada estado. El progreso visual se vuelve a derivar del dominio.

### Commit y autosave

Cada acción relevante es una `MoveTransaction` con ID y before/after de las
entidades afectadas. Secuencia:

1. validar en memoria;
2. aplicar de forma atómica al `WorldState`;
3. anexar una entrada compacta al journal local;
4. escribir snapshot temporal con `Codable`;
5. verificar checksum e invariantes;
6. reemplazar atómicamente el snapshot principal;
7. conservar la última copia verificada y compactar journal periódicamente.

El input puede continuar tras actualizar la sesión, pero no se muestra
`saved` hasta terminar la escritura. Un fallo conserva el estado en memoria,
reintenta de forma acotada y muestra un estado recuperable; no se ignora.

### Carga y recuperación

Orden de recuperación:

1. cargar snapshot principal y verificar checksum + invariantes;
2. si falla, cargar la copia anterior y reproducir entradas completas del
   journal;
3. si una migración referencia un contenedor retirado, conservar el `BookID` y
   mover solo ese libro al `recoveryTray`;
4. si ninguna copia global es verificable, reconstruir desde la definición y
   aplicar todas las transacciones válidas disponibles; nunca crear IDs nuevos
   para sustituir los existentes;
5. informar al jugador de la recuperación en lenguaje sencillo.

Tests de propiedad deben demostrar igualdad de IDs antes/después, ubicación
única, replay determinista y exactitud tras cierre en cualquier frontera de
transacción.

## Localización y recuperación de libros

`LocatorIndex` se deriva de `placements` y permite consultar por ID, sección,
serie, volumen y contenedor. No guarda una copia de posiciones.

- `Find this book` anima la cámara hasta la ubicación real y destaca el
  contenedor; no teletransporta.
- Los contadores por zona proceden del mismo índice.
- Un libro en una pila colapsada puede revelarse abriendo/faneando esa pila.
- Un libro recuperado por migración queda visible en `recoveryTray` y conserva
  todos sus atributos.
- Un comando interno de auditoría puede recorrer los IDs pendientes para QA.

## Estado visual del edificio

La transformación usa `ZonePresentationState` derivado, por ejemplo:

```text
chaotic -> clearing -> ordered -> restored
```

Cada estado activa combinaciones de módulos reutilizables: densidad de objetos
de fondo, capa de polvo, intensidad de luz, decoración recuperada, mezcla de
ambiente y VFX. No existe una ilustración completa distinta por porcentaje ni
por combinación de libros. Los umbrales y la apariencia final dependen de la
aprobación visual.

## Pruebas

### Dominio

- generación de 60 y 180 `BookDefinition` con IDs estables;
- contenido soluble y capacidad por sección;
- validación de sección, serie contigua, volumen y spans;
- movimientos, swaps compatibles/incompatibles, pilas, carro y undo;
- invariantes tras secuencias aleatorias de miles de comandos.

### Persistencia

- round-trip exacto de toda ubicación;
- interrupción simulada antes/después de cada paso atómico;
- corrupción de principal, recuperación de backup y replay de journal;
- migración con contenedor retirado hacia recovery tray;
- ningún ID perdido o duplicado.

### Cámara e input

- conversiones screen↔world en zoom mínimo/máximo;
- prioridad y cancelación de recognizers;
- hit targets independientes de escala;
- auto-pan sin salto de libro;
- foco y retorno conservando bounds/orientación;
- ruta equivalente Drag y `Select & Place`.

### Render, accesibilidad y rendimiento

- snapshots provisionales solo para geometría/LOD, nunca como aprobación
  visual;
- labels, hints, acciones y orden de foco;
- feedback sin color/sonido/háptica como único canal;
- Reduce Motion y tamaños táctiles;
- presupuesto de frame y memoria con el total del MVP y peor zoom visible.

## Frontera con la puerta visual

Se puede implementar antes de aprobación: tipos de dominio, contenido de test,
validador, transacciones, persistencia, pruebas, cámara/gestos y una escena de
depuración etiquetada `PROVISIONAL TOUCH PROTOTYPE`.

No se puede fijar antes de aprobación: layout final, arquitectura visual final,
paleta, materiales, iconos, tipografía, decoración, VFX principales, animación
final, HUD, pantalla final, icono o screenshots de tienda.

Las cuatro V2 existentes son referencias de tono no aprobadas y encuadran
demasiado mundo. No constituyen maestras, no autorizan assets y no deben guiar
la implementación final como si estuvieran aprobadas.

## Originalidad y ausencia de explosión de estados

La arquitectura no reproduce el referente exacto:

- no usa su mapa, dimensiones, personajes, magia, poderes, nombres, textos,
  categorías, interfaz o assets;
- define una biblioteca original y una interacción iPhone 2D con cámara continua,
  carro de cinco slots y clasificación propia;
- conserva solo la idea genérica no exclusiva de ordenar una colección y ver
  transformarse un espacio.

Tampoco modela cada combinación como estado visual. El estado real es un
conjunto compacto de identidades y ubicaciones; reglas y presentación se
derivan. Por ello, aumentar libros o posiciones incrementa datos y nodos, no el
número de assets ni una matriz exponencial de pantallas pre-renderizadas.

