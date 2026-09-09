# Quiet Stacks 0.17.3 (2)

Candidate release. The previous delivered version is 0.17.2 (1), internal TestFlight.

The left camera reach now reveals a painted stone wall and pilasters instead of repeated wood. Original room geometry, full-bleed viewport and bottom gesture exclusion remain unchanged. Image source and hashes: design/library-west-wall/README.md.

Selected sprites use brightness 1.4 and saturation 1.35 in WebGL, preserving premultiplied transparency. Canvas fallback uses one cached, alpha-masked warm illumination sprite without relying on unsupported Canvas filters. No outline.

A successful drag into the correct physical bookcase triggers four gold sparks (430 ms). The unique slot belonging to that volume triggers nine green sparks (760 ms). Other bookcases do not celebrate. Free placement and the existing exact slot order remain unchanged. Effects render on a small independent overlay, stop fully, and reduce movement when requested.

The existing 525 numbered spine images are retained. The remaining 435 volumes receive gold foil digits over a prepared leather binding derived from their own collection artwork. One 2048×776 startup atlas covers the 108 affected collections; the transparent numeral atlas supports volumes 1–17. No new texture uploads during play. 960 books and 117 collections retain their IDs and saved positions.

Validation: 88 Node tests; actual mouse drops in wrong/right/exact locations; representative spine contact sheet; full viewport and bottom drop checks; Canvas/WebGL comparison and context restore; performance report/share/save checks. Native iPhone/iPad build and delivery verification are pending.

Runtime manifest: 26 files. GPU preparation: 11 textures, 123.70 MiB, versus 117.05 MiB previously. Independent celebrations do not redraw the book scene after drop. Simulator performance is not a physical-device measurement.

Candidate CI: https://github.com/Krazel/quiet-stacks-ios/actions/runs/34345549085; commit 982fd6e587fcf7a8a5e847fba86b1e5fc18713ef. Native QA and upload in progress.

The first and last volume of all 117 collections were also visually reviewed: artifacts/placements-0173/all-collections.png. The Canvas highlight comparison warms the shared cover atlas first to isolate the illumination from Chrome's one-time image sampling cache change; all five viewport/backend cases then change only pixels inside the selected book.

Effect stress check: 1,000 effect requests with reduced motion enabled are capped at four active effects, all stop, and the book scene renders no extra frames (artifacts/placements-0173/effects-budget.json). This is an effect queue check, not a physical-device FPS benchmark.

Build 1 native QA passed, but its wide-pan measurement was 28.17 FPS versus 54.69 previously, alongside an anomalous 16-second idle stage. Build 2 guards the color operation so unselected books and the background skip it, then repeats native validation. Build 1 is not the final delivery.
