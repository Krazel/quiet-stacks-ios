# Quiet Stacks — definición de producto

Estado: especificación de producto previa a aprobación visual  
Plataforma inicial: iPhone, 2D, solo en inglés  
Versión objetivo inicial: MVP local, sin publicación autorizada

## Decisión de producto

**Quiet Stacks** es un juego 2D sin reloj sobre recuperar una biblioteca
monumental y persistente. El jugador no resuelve una sucesión de puzles de un
estante: recorre un único lugar mayor que la pantalla, crea su propio sistema de
trabajo, forma pilas provisionales, carga un carro y devuelve cada libro a una
estantería coherente por sección, serie y volumen.

La promesa es doble:

- cada movimiento debe sentirse preciso, comprensible y agradable;
- el caos debe transformarse de forma acumulativa hasta que el edificio entero
  quede recuperado.

El mapa completo no cabe en el viewport, tampoco en el zoom más alejado de uso
normal. Explorar, trabajar con pilas/carro y acercarse a una estantería son tres
escalas de la misma escena continua, no menús o niveles desconectados.

## Público

Público primario:

- personas que disfrutan de juegos cozy, metódicos y de organización;
- lectores y amantes de bibliotecas atraídos por una transformación visual
  prolongada;
- jugadores de iPhone que prefieren sesiones sin presión, puntuación o
  castigo, pero quieren una meta finita y visible.

No se presupone conocimiento bibliotecario. Las reglas deben poder leerse a
través de símbolos, números y relaciones espaciales sin depender de texto
pequeño ni de distinguir colores.

## Promesa principal

> Restore one vast library your way, one book at a time.

El jugador vuelve porque su biblioteca conserva exactamente el método, las
pilas, el carro y los libros donde los dejó. Cada sesión puede resolver una fila,
limpiar una zona o simplemente preparar el siguiente paso. No hay racha diaria,
energía ni urgencia artificial.

## Pilares

1. **Un lugar persistente.** El edificio, los libros y los útiles de trabajo
   mantienen identidad y posición entre sesiones.
2. **Método propio.** El juego admite ordenar por zona, preparar series, usar el
   carro o crear pilas. No prescribe una única secuencia correcta.
3. **Tres escalas, una escena.** Pan, zoom y focos animados conservan orientación
   espacial entre exploración, zona de trabajo y estantería.
4. **Clasificación legible.** Sección, serie y volumen determinan la solución.
   Color, altura, textura y emblema son pistas redundantes, no la regla única.
5. **Progreso sin castigo.** La colocación provisional es válida. El juego
   confirma el orden correcto, pero no penaliza el proceso intermedio.
6. **Transformación global.** Se despeja el suelo, se recupera el mobiliario y
   cambia la luz/atmósfera mediante estados componibles derivados del progreso.

## Loop principal

1. **Orientarse.** Reanudar en la última posición de cámara o enfocar una zona
   física del edificio sin abandonar el mundo.
2. **Inspeccionar.** Leer emblema de sección, marca de serie y número de volumen
   de los libros cercanos.
3. **Preparar.** Separar libros en pilas provisionales o cargar hasta cinco en
   el carro; el jugador decide su criterio.
4. **Transportar.** Mover el carro, desplazar pilas o arrastrar un libro mientras
   la cámara acompaña mediante auto-pan controlado.
5. **Colocar.** Encajar, intercambiar o retirar libros en slots de estante. Una
   colocación incorrecta puede quedarse provisionalmente.
6. **Validar.** La fila y la zona comunican por símbolo, contorno, movimiento,
   sonido y háptica si la regla ya es válida.
7. **Contemplar y continuar.** El cambio local se refleja en el edificio. El
   jugador elige otra pila, fila o zona, o cierra la app sin perder nada.

No existe fin de sesión impuesto. La duración la decide el jugador.

## Reglas de clasificación

Cada libro posee una identidad estable y tres atributos lógicos obligatorios:

- `section`: determina en qué zona de estanterías pertenece;
- `series`: los volúmenes de una serie deben formar un bloque contiguo;
- `volume`: los libros de ese bloque se ordenan de izquierda a derecha.

Una fila puede contener más de una serie completa. El orden relativo entre
series completas no está prescrito, por lo que diferentes resultados finales
pueden ser válidos. El contenido del MVP se construirá con soluciones probadas:
ninguna combinación de anchuras podrá dejar el mundo en un estado imposible.

Estados de una fila:

- **incomplete**: quedan huecos o faltan libros;
- **provisional**: la ocupación cabe físicamente pero incumple sección,
  contigüidad o volumen;
- **valid**: todos los libros pertenecen a la sección, cada serie está contigua
  y sus volúmenes están ordenados;
- **complete**: la fila válida también satisface el contenido esperado por la
  definición de mundo.

La validación nunca depende solo de rojo/verde. La presentación final queda
sujeta a la puerta visual.

## MVP pequeño

El MVP es **una sola biblioteca conectada**, no una campaña de niveles:

- dos alturas arquitectónicas y seis zonas reconocibles dentro de una misma
  escena 2D mayor que el viewport;
- 18 filas de estantería y aproximadamente 180 libros;
- unas 20 series repartidas entre varias secciones;
- un carro móvil de cinco huecos;
- pilas provisionales creadas, reordenadas y desplazadas por el jugador;
- pan, pinch-to-zoom, foco animado por zona y auto-pan durante arrastre;
- selección, arrastre, snap, intercambio compatible, undo de la última jugada
  y localización de libros sin teletransportarlos;
- guardado local automático tras cada movimiento confirmado y reanudación
  exacta;
- sonido y háptica opcionales, feedback redundante y alternativa de
  seleccionar-destino para accesibilidad motora/VoiceOver;
- Settings mínimo y reinicio protegido por confirmación;
- final único al recuperar toda la biblioteca, seguido de modo libre.

Las cifras son presupuesto de contenido, no una promesa inamovible. Solo podrán
reducirse si la prueba táctil demuestra que la fantasía de escala y el método
propio permanecen intactos.

## No objetivos del MVP

- puzles aislados de un solo estante o estructura `goods sort`/triple match;
- temporizador en la experiencia principal, puntuación, estrellas, vidas,
  energía, monedas, boosters, recompensas diarias o anuncios;
- personajes controlables, clientes, diálogos largos, economía, decoración
  comprable o inventario de objetos ajeno al trabajo de clasificación;
- 3D, Android, iPad como alcance específico, backend, cuentas, sincronización,
  analítica, tracking, contenido remoto o permisos no indispensables;
- generación en línea, IA, editor de niveles o contenido infinito;
- segundo idioma, TestFlight, App Review o publicación;
- soporte voluntario, IAP o decisión de precio dentro de este hito;
- copiar nombre, textos, arte, personajes, mapa, categorías, poderes,
  interfaz, assets o dimensiones de *Librarian: Tidy Up the Arcane Library!*.

Quiet Stacks conserva una fantasía general de ordenar una colección y ver
sanar un lugar; su mundo, reglas concretas, identidad, composición y producción
de assets deben ser originales.

## Inventario de pantallas y estados

Ninguna pantalla de este inventario está autorizada para implementación visual
final. Cada pantalla/estado material necesitará una imagen completa aprobada y
registrada antes de implementarse.

### 1. Biblioteca — mundo jugable

Es la pantalla principal y contiene las tres escalas en una escena continua.

Estados que debe cubrir la propuesta visual:

- primer acceso, caos inicial y orientación breve;
- exploración con viewport recortado y continuidad evidente fuera de pantalla;
- zona de trabajo con pila, carro y estantes visibles en contexto;
- primer plano de estante con sección, serie y volumen legibles;
- libro seleccionado;
- libro en arrastre con origen reservado;
- auto-pan de borde;
- destino compatible, incompatible y ocupado/intercambiable;
- colocación provisional;
- snap correcto con feedback accesible;
- fila completa, zona completa y progreso global intermedio;
- modo localizar con indicación espacial, sin teletransporte;
- guardado en curso, guardado correcto y fallo recuperable;
- biblioteca totalmente restaurada;
- modo libre posterior al final.

### 2. Pausa

Overlay que conserva visible el mundo y ofrece, como mínimo, `Resume`,
`Settings` y `Return to Library`. No debe convertir las zonas del mundo en una
lista de niveles.

Estados: normal y confirmación de salida si existe una operación no confirmada.
El modelo previsto evita esta última persistiendo solo movimientos atómicos.

### 3. Settings

Contenido funcional provisional en inglés:

- `Sound`;
- `Haptics`;
- `Accessibility`;
- `Reduce Motion`;
- `High Contrast Symbols`;
- `Drag or Select & Place`;
- `Locate a Book`;
- `New Library`;
- `Credits`.

No contiene cuenta, analítica, compras ni permisos. `New Library` abre una
confirmación destructiva independiente y nunca borra con un solo toque.

### 4. Localizador de libro

Overlay/bandeja conectada visualmente al mundo. Permite filtrar por sección,
serie y volumen; al elegir un resultado, la cámara viaja hasta su ubicación
real y la destaca. No mueve el libro ni sustituye la exploración por una lista.

Estados: vacío, resultados, libro en pila, carro, suelo o estante, y libro ya
colocado correctamente.

### 5. Recuperación de guardado

Solo aparece si el guardado principal no puede verificarse. Debe explicar de
forma breve si se recuperó la copia anterior o si libros afectados se movieron
a la mesa de devoluciones. Nunca muestra detalles técnicos ni pierde identidades
silenciosamente.

Copy funcional provisional:

- `Your library was restored from the last safe save.`
- `Some books were moved to the return desk so nothing was lost.`

### 6. Final

Secuencia dentro del mismo mundo: la cámara recorre zonas recuperadas y vuelve
al punto elegido por el jugador. Mensaje provisional: `Library restored.` Las
acciones posteriores son `Keep arranging` y `View the library`.

No se necesita una pantalla de loading de red, permisos, login, perfil, tienda,
compras o error de servidor porque esas capacidades no pertenecen al MVP.

## Copy funcional provisional en inglés

El copy también está sujeto a la propuesta visual; no fija layout:

- `Pick a place to begin.`
- `Restore the library, one book at a time.`
- `This row is in order.`
- `Some books still belong elsewhere.`
- `No rush. Your work is saved.`
- `Undo`;
- `Find this book`;
- `Library restored.`

No se usarán claims de terapia, salud mental u `OCD relief`.

## Definición verificable de terminado

El MVP solo puede declararse terminado cuando se cumplan **todos** estos
criterios:

### Producto y alcance

- existe una única biblioteca continua mayor que el viewport, con seis zonas,
  18 filas y el conjunto final de libros aprobado para el MVP;
- todos los libros se pueden clasificar mediante sección, serie y volumen y
  existe al menos una solución demostrada por tests de contenido;
- el loop completo funciona sin temporizador, moneda, anuncio o recompensa
  extrínseca;
- carro, pilas y orden de trabajo son realmente opcionales y útiles; el juego
  no exige una secuencia fija;
- completar cada zona y la biblioteca produce progreso local y global
  persistente.

### Puerta visual

- el propietario ha aprobado explícitamente una imagen completa para cada
  pantalla/estado material del inventario;
- las referencias vigentes están registradas con dispositivo, orientación,
  idioma, fecha y SHA-256 en `design/approved/` y `design/APPROVALS.md`;
- existe un inventario de assets previo a la UI final;
- cada pantalla final tiene una captura runtime al mismo tamaño que su maestra,
  comparación lado a lado y diferencias visibles corregidas o elevadas;
- ninguna V1/V2 histórica se trata como aprobación implícita.

### Interacción, accesibilidad y estabilidad

- la prueba descrita en `TOUCH_PROTOTYPE.md` supera sus criterios de pan, zoom,
  drag, staging, snap, orientación y reanudación;
- pinch, pan, drag de libro, movimiento de carro/pila y controles SwiftUI no
  producen gestos simultáneos ambiguos;
- existe una ruta equivalente `Select & Place`, labels/acciones accesibles,
  feedback no basado solo en color, objetivos táctiles adecuados y soporte de
  Reduce Motion;
- sonido e háptica pueden desactivarse sin perder información;
- no hay libros duplicados, perdidos, solapados de forma inválida o fuera de
  contenedores tras pruebas aleatorias, cierre forzado y migración de guardado;
- errores de lectura del guardado recuperan una copia válida o llevan libros a
  un punto de recuperación visible sin cambiar su identidad.

### Arquitectura y producción

- la auditoría técnica documentada en `ARCHITECTURE.md` confirma o sustituye
  SpriteKit + SwiftUI antes de fijar la arquitectura final;
- los libros, estanterías, mundo y estados se generan desde definiciones y
  componentes reutilizables; no existen imágenes únicas por libro,
  combinación, estante o estado;
- dominio, validación y persistencia se prueban sin depender del render;
- la app compila y sus tests unitarios, de integración, persistencia, UI y
  accesibilidad pasan en el entorno iOS soportado que se fije tras la auditoría;
- el rendimiento de interacción cumple el presupuesto de la prueba táctil en
  el iPhone de referencia y no degrada por el número total de libros;
- el repositorio no contiene secretos, assets ajenos ni dependencias/costes no
  aprobados.

### Cierre

- versión, build, commit y evidencia de verificación quedan registrados;
- limitaciones conocidas y diferencias visuales restantes están documentadas;
- publicar, TestFlight y App Review permanecen sin ejecutar hasta autorización
  expresa posterior.

