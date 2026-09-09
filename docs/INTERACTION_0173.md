# Quiet Stacks 0.17.3 (2)

Delivered release: 0.17.3 (2), internal TestFlight. It follows 0.17.2 (1).

The left camera reach now reveals a painted stone wall and pilasters instead of repeated wood. Original room geometry, full-bleed viewport and bottom gesture exclusion remain unchanged. Image source and hashes: design/library-west-wall/README.md.

Selected sprites use brightness 1.4 and saturation 1.35 in WebGL, preserving premultiplied transparency. Canvas fallback uses one cached, alpha-masked warm illumination sprite without relying on unsupported Canvas filters. No outline.

A successful drag into the correct physical bookcase triggers four gold sparks (430 ms). The unique slot belonging to that volume triggers nine green sparks (760 ms). Other bookcases do not celebrate. Free placement and the existing exact slot order remain unchanged. Effects render on a small independent overlay, stop fully, and reduce movement when requested.

The existing 525 numbered spine images are retained. The remaining 435 volumes receive gold foil digits over a prepared leather binding derived from their own collection artwork. One 2048×776 startup atlas covers the 108 affected collections; the transparent numeral atlas supports volumes 1–17. No new texture uploads during play. 960 books and 117 collections retain their IDs and saved positions.

Validation: 88 Node tests; actual mouse drops in wrong/right/exact locations; representative spine contact sheet; full viewport and bottom drop checks; Canvas/WebGL comparison and context restore; performance report/share/save checks. Native iPhone/iPad build and delivery verification passed for build 2.

Runtime manifest: 26 files. GPU preparation: 11 textures, 123.70 MiB, versus 117.05 MiB previously. Independent celebrations do not redraw the book scene after drop. Simulator performance is not a physical-device measurement.

Candidate CI: https://github.com/Krazel/quiet-stacks-ios/actions/runs/34345549085; commit 982fd6e587fcf7a8a5e847fba86b1e5fc18713ef. Build 1 was superseded after measurement review.

The first and last volume of all 117 collections were also visually reviewed: artifacts/placements-0173/all-collections.png. The Canvas highlight comparison warms the shared cover atlas first to isolate the illumination from Chrome's one-time image sampling cache change; all five viewport/backend cases then change only pixels inside the selected book.

Effect stress check: 1,000 effect requests with reduced motion enabled are capped at four active effects, all stop, and the book scene renders no extra frames (artifacts/placements-0173/effects-budget.json). This is an effect queue check, not a physical-device FPS benchmark.

Build 1 native QA passed, but its wide-pan measurement was 28.17 FPS versus 54.69 previously, alongside an anomalous 16-second idle stage. Build 2 guards the color operation so unselected books and the background skip it, then repeats native validation. Build 1 is not the final delivery.

Build 2 CI: https://github.com/Krazel/quiet-stacks-ios/actions/runs/34346973380; commit 641ab83cd0b92513e082043bcb717042e032e25b.

Build 2 native measurements (iPhone 16 Pro simulator, iOS 18.5): pan-wide 46.60 FPS, zoom 57.18, drag 58.82, shelves 56.77; zero idle book frames. The previous 0.17.2 run measured 54.69 FPS in pan-wide. These shared-runner measurements vary and do not establish physical-device performance or isolate the cause of every pause. Evidence: artifacts/performance-0173/native-comparison.json.

## Entrega verificada

- 0.17.3 (2), TestFlight **interno**, VALID / IN_BETA_TESTING; build `429bbb8d-38d9-48e0-8ffa-cbe3f6e3a13d`.
- [CI verificada](https://github.com/Krazel/quiet-stacks-ios/actions/runs/34346973380), commit `641ab83cd0b92513e082043bcb717042e032e25b`.
- QA nativa en simuladores iPhone/iPad: escenario igual a toda la vista, ganancia de selección 1.4 sin borde, zona inferior reservada, cámara/partida conservadas tras relanzar y ejecutar el informe.
- 960 volúmenes, ordenación/dispersión, guardado, diagnóstico y archivo JSON compartible correctos; once texturas preparadas y cero redibujados de libros en reposo.
- IPA arm64 iPhoneOS: 26 recursos idénticos al commit, firma y SHA256 `6064b6faf8a439b43f6f68b224d0f1d4b640d43a54d940f0a2e144e38c3d1c68` verificados; no incluye las sondas del simulador.
- Biblioteca PR-014 guardada y releída en revisión 48; App Store creada sin publicación, anuncios Por confirmar, seguimiento restante conservado.

Evidencia: `artifacts/native-0173-verification.json`, `artifacts/ios-testflight-0173-upload.json`, `artifacts/testflight-0173-verification.json` y `artifacts/library-0173-verification.json`.
