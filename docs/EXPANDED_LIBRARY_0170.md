# Quiet Stacks 0.17.0 (1): complete library

The expanded room approved by the user on 2026-09-08 is now playable. Its 16 complete, named racks contain 117 distinct collections and 960 volumes. All shelf spines use the same 9 × 27 world-pixel dimensions. Each measured compartment has one exact slot for every volume, with no overlap or spare book-width gaps. The Luminara divider is completed with existing wood artwork; Clockwork slots avoid its posts.

The original 525 books and first 100 collection identities are preserved. The version-4 save receives map revision 2: shelf assignments, trolley, order and camera survive; floor books retain their position where valid, otherwise move to the nearest valid surface. New volumes start on the floor. The previous save is backed up before the first migrated write. Corrupt legacy saves are rejected before state mutation.

Seventeen new binding designs occupy the additional compartments. Volumes beyond the existing illustrated set use small gold numbers embedded within the spine. The approved background is `web/assets/gallery-expanded-v170.png`, SHA256 `6913829f25079ce919195e03dad037a815b5769d4931709f8110616077aea8a5`. It is the approved expanded composition at 1672 × 941, not an upscaled resolution claim. New generated sheets and their measured sprite bounds are retained in the product. The fourth generated sheet is spare design material and is excluded from the app.

Lamp glow and a few window dust motes animate on a separate low-resolution canvas at 12 FPS while idle, synchronizing immediately with camera changes during movement. The book scene does not redraw while idle. Ambience pauses when hidden or Reduce Motion is enabled. Four subpixel samples smooth minified book textures without another atlas or mipmap memory. Context restoration re-enables the required extension before recompiling the shader.

The camera fills the viewport and constrains panning/zoom to the room. WKWebView fills the native view, while interactive overlays respect safe-area insets. Drag-only placement, compact phone panels and blocked browser selection/zoom remain in place.

## Validation before native upload

- 84 Node tests: complete shelf fit, unique designs, exact legacy-save migration, malformed-save rejection, input and rendering behavior.
- Browser room tests: 960 correctly sorted books, 117 collections; ambient pixels and reduced-motion clearing; no idle book frames.
- Four mobile UI sizes and 64 edge/zoom cases, plus rotation and safe-area bounds.
- Canvas/WebGL comparison at six scene/zoom combinations: mean channel error at most 4.02/255; context loss/restoration preserves state; no repeated texture uploads during motion.
- Automatic/manual performance report, JSON sharing, clipboard, cancel/background and exact saved-state restoration pass.
- Runtime: 24 active files; 7 lossless packed pages; approximately 117.05 MiB GPU textures. Desktop frame rates are not physical iPhone measurements.

The first native run (`34239007022`, commit `01ed7e0`) passed launch, sustained play, persistence and report sharing, but its first wide pan stalled: 3.79 FPS followed by 57.81–59.2 FPS in the remaining motion stages. The upload was blocked. Textures and both filter paths now complete their initial GPU submission under the loading panel, before interaction. The original native performance thresholds are unchanged.

Corrected CI commit `6b594ce6092e75c6f0d9f61bb888cf8a1572737c`, [run 34240466079](https://github.com/Krazel/quiet-stacks-ios/actions/runs/34240466079), passed all 84 tests and native QA. On the iPhone 16 Pro simulator, iOS 18.5, the first wide pan reached 56.18 submitted FPS; zoom 58.60, drag 59.41 and shelves 59.38. These are simulator measurements, not a physical iPhone X claim. The separate sustained-play probe measured 46.62 FPS.

All 960 books sort/scatter, saved state survives relaunch, native diagnostic copy and performance-file sharing pass, and idle produces no book frames. All ten textures are prepared before the automatic test starts. iPhone and iPad probes verify full native-view coverage and page zoom fixed at 1. Native phone card and tablet summary screenshots were inspected. The iPad details JSON captures the open card; the later screenshot shows its automatically closed summary.

Evidence: `artifacts/native-0170-verification.json`; raw native artifacts are retained locally and in the CI run.

## Verified delivery

0.17.0 (1), Apple build `1af53a49-01e2-42d5-991e-69b9bdbdd117`, is VALID / IN_BETA_TESTING in the existing internal group `2de05410-3476-48a4-b3b9-b8d3a56d6cfb`, verified by official API on 2026-09-08 at 15:07 UTC. Release notes and group membership were read back after writing. External state READY_FOR_BETA_SUBMISSION is not external testing; no external or public App Store release was submitted.

The signed arm64 device IPA targets iOS 16+. Its SHA256 is `3298474f8973f37f1c92994e2f22a67ded7e884e731e5f57cec8b8e2a8361c77`. All 24 bundled resources match the exact CI commit byte for byte; simulator probes are absent. Evidence: `artifacts/ios-testflight-0170-upload.json` and `artifacts/testflight-0170-verification.json`.

Studio library PR-014 was updated and reread at revision 40. It records 0.17.0 (1) in internal TestFlight, preserves App Store Connect created/publication No and ads Por confirmar, and names physical iPhone/iPad acceptance as the next step.
