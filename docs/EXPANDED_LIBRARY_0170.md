# Quiet Stacks 0.17.0 (1): complete library

The expanded room approved by the user on 2026-09-08 is now playable. Its 16 complete, named racks contain 117 distinct collections and 960 volumes. All shelf spines use the same 9 × 27 world-pixel dimensions. Each measured compartment has one exact slot for every volume, with no overlap or spare book-width gaps. The Luminara divider is completed with existing wood artwork; Clockwork slots avoid its posts.

The original 525 books and first 100 collection identities are preserved. The version-4 save receives map revision 2: shelf assignments, trolley, order and camera survive; floor books retain their position where valid, otherwise move to the nearest valid surface. New volumes start on the floor. The previous save is backed up before the first migrated write. Corrupt legacy saves are rejected before state mutation.

Seventeen new binding designs occupy the additional compartments. Volumes beyond the existing illustrated set use small gold numbers embedded within the spine. The approved background is `web/assets/gallery-expanded-v170.png`, SHA256 `6913829f25079ce919195e03dad037a815b5769d4931709f8110616077aea8a5`. It is the approved expanded composition at 1672 × 941, not an upscaled resolution claim. New generated sheets and their measured sprite bounds are retained in the product. The fourth generated sheet is spare design material and is excluded from the app.

Lamp glow and a few window dust motes animate on a separate low-resolution canvas at at most 12 FPS. The book scene does not redraw while idle. Ambience pauses when hidden or Reduce Motion is enabled. Four subpixel samples smooth minified book textures without another atlas or mipmap memory. Context restoration re-enables the required extension before recompiling the shader.

The camera fills the viewport and constrains panning/zoom to the room. WKWebView fills the native view, while interactive overlays respect safe-area insets. Drag-only placement, compact phone panels and blocked browser selection/zoom remain in place.

## Validation before native upload

- 84 Node tests: complete shelf fit, unique designs, exact legacy-save migration, malformed-save rejection, input and rendering behavior.
- Browser room tests: 960 correctly sorted books, 117 collections; ambient pixels and reduced-motion clearing; no idle book frames.
- Four mobile UI sizes and 64 edge/zoom cases, plus rotation and safe-area bounds.
- Canvas/WebGL comparison at six scene/zoom combinations: mean channel error at most 4.02/255; context loss/restoration preserves state; no repeated texture uploads during motion.
- Automatic/manual performance report, JSON sharing, clipboard, cancel/background and exact saved-state restoration pass.
- Runtime: 24 active files; 7 lossless packed pages; approximately 117.05 MiB GPU textures. Desktop frame rates are not physical iPhone measurements.

Candidate 0.17.0 (1). Native simulator verification, signed upload and App Store Connect group activation are recorded after completion. No external TestFlight or public App Store release is implied.
