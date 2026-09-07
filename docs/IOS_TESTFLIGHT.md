# Quiet Stacks · TestFlight

**Versión actual: 0.16.10 (1), válida y activa en TestFlight interno.**
[Corrección del zoom de página](PAGE_ZOOM_01610.md). Doble toque en fichas y paneles sin ampliar la página; el zoom propio del juego y el desplazamiento de contenido se conservan.
80 pruebas, gestos en cuatro tamaños y límites nativos de escala iPhone/iPad verificados. Build eb8b0f5a-537e-4d9f-9977-742c3e046ef9, VALID / IN_BETA_TESTING. [Validación y subida](https://github.com/Krazel/quiet-stacks-ios/actions/runs/34169469202).
Siguiente paso: instalar 0.16.10 y comprobar doble toque en descripciones.

## Historial: iOS 0.16.9

[Movimiento solo al arrastrar](DRAG_ONLY_0169.md). Tocar un destino ya no coloca el libro seleccionado. Tocar libros abre su ficha; la acción vuelve a la biblioteca.
80 pruebas, interacción táctil en cuatro tamaños web y QA nativa correctas. Build 80bf5303-0041-40c6-b3f8-870b767a57eb, VALID / IN_BETA_TESTING. [Validación y subida](https://github.com/Krazel/quiet-stacks-ios/actions/runs/34146164845).
Siguiente paso: instalar 0.16.9 y probar arrastre entre suelo, estantes y carro.

## Historial: iOS 0.16.8

[Interfaz móvil y evidencias](MOBILE_UI_0168.md).
Eliminados título y controles de zoom de las esquinas; resumen compacto en iPhone, ficha completa legible y sin selección de texto al jugar. Pinch y arrastre conservados; iPad mantiene su tarjeta lateral.
78 pruebas Node, cuatro tamaños web, copia/compartición del informe y QA nativa iPhone/iPad correctas. Build 811e4a7b-f15c-4189-8308-3bbeef9d2d41, VALID / IN_BETA_TESTING.
[Compilación, validación y subida](https://github.com/Krazel/quiet-stacks-ios/actions/runs/34141375963).
Siguiente paso: instalar 0.16.8 y valorar la interfaz en iPhone/iPad.
Sin TestFlight externo ni publicación pública en App Store.

## Historial: iOS 0.16.7

El usuario confirma buen rendimiento en su dispositivo. [Optimización basada en el informe del iPhone](PERFORMANCE_0167.md). Renderizado WebGL 2D por lotes con arte y partida conservados. Build a2fd3e6a-8ab2-467e-97b4-89087d46dd42.

## Historial: iOS 0.16.6

Informe recibido: iPhone X a 3–6 FPS, con ahorro activo y estado térmico serious.
[Prueba de rendimiento e informe compartible](PERFORMANCE_TEST_0166.md).
Demo → Performance test → Automatic test → Share report → WhatsApp.
También permite grabar 20 segundos de juego real. 78 pruebas Node e integración
de navegador y QA nativa correctas, incluido archivo JSON, menú de compartir y
partida conservada. El informe real del iPhone está pendiente.
Build `330d9412-d94e-42ec-b3b5-0b11a16d3651`, VALID / IN_BETA_TESTING.

## Historial: iOS 0.16.5

El usuario confirma mejora, pero aún va lento; se añade medición en 0.16.6.
[Optimización, entrega y límites de rendimiento](PERFORMANCE_0165.md).
Dibujo bajo demanda, menos trabajo fuera de pantalla y búsqueda rápida al soltar.
75 pruebas Node, 25 comprobaciones de rutas y QA funcional nativa correctas;
seis escenas comparadas sin diferencias de píxeles. La fluidez en el iPhone real
sigue pendiente de comprobar; el simulador remoto no acredita 60 FPS.
Build `629c09f0-e338-4a21-abb7-4d900f7d2bc6`, VALID / IN_BETA_TESTING.
Sin publicación pública en App Store ni pruebas externas.

## Historial: iOS 0.16.4

[Corrección del error -1102, entrega y evidencias](IOS_PATH_FIX_0164.md).
Corrige una comparación incoherente de rutas locales, reproducida en Foundation.
25 comprobaciones de rutas, 70 pruebas Node y QA nativa correctas. El 2026-09-07
el usuario confirma que ya abre en el iPhone, pero va muy lenta. La apertura
queda confirmada; rendimiento pendiente de corregir y validar en dispositivo.
[Auditoría y experimentos medidos](PERFORMANCE_AUDIT.md). Copy diagnostic sigue disponible.
Sin publicación pública en App Store ni pruebas externas.

## Historial: iOS 0.16.1

El usuario autorizó corregir el fallo móvil, crear la ficha y hacer TestFlight.
App Store Connect: https://appstoreconnect.apple.com/apps/6809193192
Bundle ID definitivo: `com.krazel.quietstacks`. Versión 0.16.1, build 1.
La ficha está en preparación, categoría Juegos, publicación manual.
No se ha enviado a revisión pública de App Store.

## Corrección verificada

La versión 0.16.0 cargaba mediante file://. WebKit rechazaba getImageData con
SecurityError, provocando el mensaje de error. Se reprodujo en simulador.
Ahora WKURLSchemeHandler sirve únicamente recursos empaquetados de web/ desde
quietstacks://localhost, comprobando host y límites del directorio. El juego
sigue funcionando sin servidor externo. Los sprites usan CORS anónimo.
Los atlas se importan uno a uno como ImageBitmap y liberan canvases y bitmaps
obsoletos al reintentar. Se mantienen resolución, arte, 525 libros y 100 colecciones.

64 pruebas correctas, incluyendo importación asíncrona y reintentos.
Carga nativa en iPhone 17 Pro, iOS 26.2 simulado: ready=true, errors=[].
Evidencia: artifacts/native-qa-0161/launch.json y launch.png.
Baseline fallido: artifacts/native-qa-baseline2/QuietStacks-native-QA/.
Commit remoto: 9b72ca561b4bf0d8dbc47b92c5502e6af82858c3.
CI: https://github.com/Krazel/quiet-stacks-ios/actions/runs/34043848933
Prueba en dispositivo físico pendiente.

## Distribución

Grupo interno «Krazel — pruebas internas», distribución automática desactivada.
Compilación firmada, validada y subida. Apple procesó la build como VALID.
Build ID: 2eff6809-a42e-4db6-aef3-3134604efc5e.
Grupo ID: 2de05410-3476-48a4-b3b9-b8d3a56d6cfb.
Estado comprobado: Lista para las pruebas / READY_FOR_BETA_TESTING.
1 tester interno; 1 compilación. Invitación enviada al titular tras la
autorización explícita del usuario. Estado verificado en App Store Connect: Invitado.
Evidencia: artifacts/testflight-verification.json y artifacts/ios-testflight-upload.json.
IPA: artifacts/testflight/QuietStacks-0.16.1-build1-9b72ca5-TestFlight.ipa.
SHA256: 967fb38a781e9ec6ef77b329a9d75f9d4a272c1f1f8d4317400eec471c2c6564.
Hash de descarga, ZIP y 52 recursos verificados contra el commit exacto de CI. La invitación al titular está enviada y verificada. La autorización explícita
del usuario resolvió el bloqueo anterior de la revisión automática.
La firma usa secretos cifrados del entorno GitHub app-store-production,
restringido a main. Certificado existente del estudio y perfil propio de esta app.
No se guardan secretos ni perfiles en el repositorio público.

## Biblioteca

PR-014 guardado y releído en revisión 21: 0.16.4 (1) activa en TestFlight interno,
App Store creada en Connect, publicación pública No. Anuncios Por confirmar
conservados. Siguiente paso: confirmar apertura y partida en el iPhone del usuario.
