# Technical direction (provisional ADR)

Status: accepted for the structural prototype; visual implementation pending
owner approval. Date: 2026-08-27.

## Decision

Use a dependency-free Swift package as the authoritative domain layer. The
recommended app shell remains SpriteKit for the continuous 2D world and camera,
with SwiftUI limited to non-gameplay containers, subject to an on-device audit
before it becomes irreversible. No SpriteKit scene or SwiftUI screen is included
yet.

The core stores stable book identities and semantic locations, not rendered
frames. A book is generated from reusable parameters (dimensions, palette,
texture, emblem, section, series, and volume). Shelves are rows and slots;
stacks and cart positions are containers; world-floor positions are coordinates.
The renderer will later combine reusable architecture, shelf, floor, furniture,
book, shadow, and VFX layers.

## Why this avoids asset and state explosion

There is no asset per book, shelf combination, room state, or progress state.
Book appearance is a compact recipe and library state is a list of independent
book records. A rendered state is derived from those records and reusable
modules. Moving a book changes only its semantic location. Progress, occupancy,
validation, and before/after states are computed from data, so they do not
require alternate background images or enumerated scene variants.

The versioned snapshot persists book identity and semantic location, floor
rotation, stack anchors, cart pose, and the camera anchor needed for spatial
continuity. It can be encoded after every committed move. The current file
adapter writes atomically; verified backup, journal replay, and recovery-tray
migration remain acceptance work for the tactile prototype and must surface
failure rather than silently reset.

## Interaction contract for the one-room tactile prototype

- One finger beginning on a book owns that book after a small movement threshold
  or a short hold; the book stays independent while dragged.
- One finger beginning on empty space pans the continuous world after a small
  threshold.
- A second finger always promotes the interaction to camera pinch and cancels a
  pending or active book drag. This makes accidental relocation recoverable.
- Pinch zoom preserves the world point under the gesture centroid. Camera bounds
  and zoom limits prevent losing the room while still allowing a cropped view.
- Dropping onto a shelf or cart slot uses a semantic snap target. Occupied slots
  can reject or exchange books. Dropping onto the floor creates or targets a
  stack without changing book identity.
- Every committed move returns a transaction containing all changed books; undo
  restores it exactly.
- Shelf validation allows complete series blocks in any relative order, while
  rejecting split series and invalid volume order. A future renderer must
  communicate results with symbol/shape, motion, sound, and haptics as well as
  color.

The minimum tactile test is one provisional room with 60 generated books, three
rows, a five-slot cart, and temporary stacks. It validates pan, pinch, drag,
staging, snap, exchange, undo, and exact save/reload. It must not establish final
layout or art.

## Rejected for now

- One image or sprite sheet for every state: unmaintainable and incompatible
  with independent book movement.
- A menu of disconnected shelf puzzles: loses spatial orientation and the
  persistent-world promise.
- A custom 3D engine, backend, account system, analytics SDK, or remote content:
  outside the approved scope.
- UI implementation before the visual gate: prohibited by the project process.

## Audit before app-shell commitment

On macOS, measure SpriteKit camera/gesture interoperability, 180 independently
addressable books, culling, texture-atlas pressure, snapshot latency, and
VoiceOver alternatives. Confirm the SwiftUI/SpriteKit boundary does not fragment
the three spatial scales. If the audit fails, revisit the shell without changing
the domain model.
