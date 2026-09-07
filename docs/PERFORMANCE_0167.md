# Quiet Stacks 0.16.7 (1): GPU sprite rendering

## Actual iPhone report

The owner supplied an automatic 0.16.6 report from iPhone10,6 (iPhone X), iOS 16.7.16. The phone was charging, Low Power Mode was enabled, and thermal state was serious throughout. There were no memory warnings or WebContent terminations.

| Stage | Submitted FPS | Median JavaScript draw ms |
| --- | ---: | ---: |
| Wide pan | 3.12 | 2 |
| Zoom | 5.90 | 1 |
| Drag | 5.63 | 1 |
| Sorted shelves | 5.24 | 1 |

Nearby placement: median 2 ms, maximum 5 ms over 21 probes. Idle: zero draws, ~33 ms scheduler cadence. Motion: 156–336 ms median intervals despite short JS submission times. This points toward graphics/WebKit scheduling work as the main suspect, not the placement search. The report cannot isolate GPU time or prove that heat is caused by this app. [Apple's thermal-state guidance](https://developer.apple.com/documentation/foundation/processinfo/thermalstate-swift.property) recommends reducing resource usage at elevated thermal states. The user's full report is retained locally, outside public source.

## Change

The game remains web-based and two-dimensional. A small WebGL sprite renderer uploads the existing room, signs and packed books once, then batches ordered geometry across up to eight textures. The typical frame needs two GPU draw calls instead of hundreds of Canvas sprite commands. No new runtime dependency, server or SDK.

Existing images, map coordinates, 525 books, collection bindings, embedded volume numbers, sprite proportions, draw order and save schema are unchanged. The output canvas retains the same DPR cap of 2. The room retains nearest-neighbor sampling; books use GPU bilinear sampling rather than Canvas high-quality resampling, so downscaled edges differ slightly. No source artwork was resized or regenerated.

WebGL uses premultiplied alpha, no depth/stencil or antialias buffer, no preserveDrawingBuffer and no synchronous GPU readback. Texture uploads are reused across pan/zoom/drag. Context restoration rebuilds GPU resources and redraws the original state. Asset retry releases old textures. Canvas remains a fallback when WebGL cannot initialize.

The shareable report now names the actual graphics backend and estimates uploaded texture memory; this is not total process memory. Reporting is still local until the user shares/copies it.

## Verification

- Existing 78 Node tests cover the model, input, placement, persistence, loading and reports.
- Real Chrome A/B exercises identical positions in six sorted/scattered scenes at zoom 1, 3.5 and 8; checks graphics errors, idle, no repeated texture uploads, at most four calls/frame and recovery from an actual forced WebGL context loss.
- Visual comparison is approximate because the two APIs use different resampling. Mean channel difference was below 6/255 in all six initial comparisons; zoomed images were inspected. No spatial/aspect-ratio/layout change.
- Desktop Chrome already reaches its display cadence with both backends; this is not evidence of iPhone improvement. Native QA compares both renderers on the same saved game and simulator, including report sharing and saved-state restoration, before any upload.
- The physical iPhone must run the new test after installation. No claim of 60 FPS on that phone is made before receiving that report.

Evidence: scripts/verify-gpu.cjs, scripts/verify-profiler.cjs, artifacts/performance-0167/. Apple [UIActivityViewController](https://developer.apple.com/documentation/uikit/uiactivityviewcontroller) provides JSON file sharing as in 0.16.6.
