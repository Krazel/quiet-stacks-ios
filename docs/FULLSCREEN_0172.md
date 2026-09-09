# Quiet Stacks 0.17.2 (1) — pantalla completa y selección suave

Corrección solicitada tras probar 0.17.1: se elimina el marco de madera y el recuadro dorado. El escenario vuelve a ocupar exactamente toda la vista, también en iPhone/iPad. Los paneles conservan su separación de los controles del sistema.

La cámara admite un pequeño recorrido adicional que lleva la biblioteca hacia la derecha: ancho de la cámara del dispositivo más 6 puntos, limitado a 160 unidades del mapa. Solo al llegar a ese extremo se dibuja una prolongación de suelo con la textura existente. No hay un marco fijo ni se reduce la superficie del escenario. El mapa, los huecos, los 960 volúmenes y la partida mantienen sus coordenadas.

En la zona inferior del gesto más 6 puntos no se dibujan ni se pueden seleccionar libros. El arrastre y la búsqueda de la superficie válida más cercana mantienen el ejemplar completo por encima de esa zona. Al mover la cámara los libros vuelven a verse; no se borran ni se altera automáticamente la partida.

El libro seleccionado se aclara un 9 % mediante su propia textura y transparencia. No hay contorno, rectángulo ni animación continua. La preparación de texturas bajo la pantalla de carga y el reposo sin redibujar el escenario se conservan.

## Comprobación local

- 86 pruebas de modelo, entrada, guardado y distribución pasan.
- `scripts/verify-fullscreen.cjs`: iPhone X, iPhone con Dynamic Island, iPad y escritorio; escena de borde a borde, recorrido adicional a zoom 1/3/8, partidas inalteradas al mover la cámara, arrastre y suelta junto al gesto, 960 libros ordenables.
- Comparación de capturas antes/después: el brillo modifica únicamente los píxeles del libro, sin cambios fuera de su rectángulo. Cero redibujados del escenario en reposo.
- Evidencias: `artifacts/fullscreen-0172/verification.json` y capturas.

La compilación y verificación nativa se registrarán aquí con la build exacta. La aceptación visual en el iPhone físico corresponde al usuario; el simulador no la sustituye.

La primera QA nativa (run 34337688919) detectó que un ajuste de cámara previo a la carga de imágenes perdía el recorrido adicional guardado. Se pospone ese ajuste hasta que la vista está lista; la nueva regresión reproduce el primer cálculo de insets a cero y verifica la recarga exacta. Ningún libro cambió. La build no llegó a TestFlight en ese intento.

## Entrega verificada

- 0.17.2 (1), TestFlight **interno**, VALID / IN_BETA_TESTING; build `c4d3b69d-5aac-49ff-9711-5e7f243a732c`.
- [CI verificada](https://github.com/Krazel/quiet-stacks-ios/actions/runs/34338599483), commit `63fef982058063ef1ea9cb70804b75eaa942772d`.
- QA nativa en simuladores iPhone/iPad: escenario igual a toda la vista, ganancia de selección 1.09 sin borde, zona inferior reservada, cámara/partida conservadas tras relanzar y ejecutar el informe.
- 960 volúmenes, ordenación/dispersión, guardado, diagnóstico y archivo JSON compartible correctos; diez texturas preparadas y cero redibujados de libros en reposo.
- IPA arm64 iPhoneOS: 24 recursos idénticos al commit, firma y SHA256 `40425fc4f88d762cb2986889367f091bbd2ed7fe33e6f4762b34e40aa0ed5d9d` verificados; no incluye las sondas del simulador.
- Biblioteca PR-014 guardada y releída en revisión 45; App Store creada sin publicación, anuncios Por confirmar, seguimiento restante conservado.

Evidencia: `artifacts/native-0172-verification.json`, `artifacts/ios-testflight-0172-upload.json`, `artifacts/testflight-0172-verification.json` y `artifacts/library-0172-verification.json`.
