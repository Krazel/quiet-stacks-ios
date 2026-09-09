# Quiet Stacks 0.17.1 (1): safe gameplay area and selected book

The user reported that the iPhone camera cutout hid part of a bookcase and books, and requested no books near the bottom system gesture, plus a visible selection border.

The library canvas now sits inside the device's safe insets. An additional 12 CSS pixels above a nonzero bottom inset separate books from the home gesture. A repeating floor fragment from the approved background fills the outside margins. There are no book images or interactive book surfaces there. The playable view is reduced to fit; no shelf collection, volume or stored position is removed. Camera movement and pinch zoom operate inside this viewport. ResizeObserver follows safe-area/layout changes and device rotation.

A fine gold border marks only the selected book, including when the compact summary is open and while dragging. It follows the existing drawing bounds and disappears on deselection. It is a pointer-transparent DOM overlay, updated with scene frames, with no continuous animation, extra GPU atlas or additional idle book frames.

Dragging into a reserved margin keeps the held book visible. Release searches nearby valid floor, shelf or trolley positions where the entire placed book fits inside the visible playfield. A clamped floor candidate covers zoomed views containing open floor without any furniture boundary. If no visible surface is available, the transaction preserves the original book. Existing saved books outside the current camera remain reachable by panning.

Validation: 86 Node tests, browser safe-inset cases for iPhone X, Dynamic Island, rotation, iPad and desktop; selected/dragged border, edge drops, 960 sorted volumes, unchanged saved books during camera changes and idle rendering. Mobile UI/gesture checks and Canvas/WebGL visual equivalence pass. Native safe-area and selection probes are included in the iPhone/iPad CI checks.

0.17.1 (1), CI commit `1a5bdd0d321b0fbf3478633834ca02cd35b59594`, [run 34293420158](https://github.com/Krazel/quiet-stacks-ios/actions/runs/34293420158). The first attempt compiled successfully and passed the 25 native asset-path checks, then `simctl launch` timed out after 180 seconds before any game result was collected. The same commit was verified on a fresh runner (attempt 2); no test threshold was relaxed.

Attempt 2 passed all native checks on the unchanged commit. The iPhone 16 Pro simulator reported safe insets of 62 points left/right and 21 bottom; its playable area was x=62, y=0, width=750, height=369 inside an 874 × 402 native view. The iPad reported a 25-point bottom inset and a 1133 × 707 playable area. The selected border is visible with the summary on both. Native summary screenshots were inspected; their raw files use display orientation from simctl.

The iPhone simulator measured 59.69 FPS for wide pan, 59.80 for zoom and drag, and 59.78 for shelves. Idle produces no book frames. All 960 books, exact saved-state recovery, native diagnostic copy and performance JSON sharing pass. Evidence: `artifacts/native-0171-verification.json`. These are simulator measurements; physical-device acceptance remains the next step.

## Verified delivery

Apple build `56d33e1b-26ec-4939-a38f-aacdceea49dd` is VALID / IN_BETA_TESTING in the existing internal group, verified by official API on 2026-09-09 at 00:26 UTC. Notes and membership were reread after writing. No external testing or public App Store submission was made.

The signed arm64 iOS 16+ IPA has SHA256 `c16feed792f38ed350b77bd29e1968f2bebc8555d7ae7a143d6291d55ad347e3`. Its 24 resources match the exact CI commit byte for byte, and simulator probes are absent. Evidence: `artifacts/ios-testflight-0171-upload.json`, `artifacts/testflight-0171-verification.json`, and `artifacts/native-0171-verification.json`.

Studio library PR-014 was updated and reread at revision 42: 0.17.1 (1) internal TestFlight, App Store Connect created/publication No and ads Por confirmar preserved. Physical iPhone acceptance of the new margins and selection is the next step.
