# Quiet Stacks

Quiet Stacks is a new 2D iPhone game about restoring one monumental, persistent
library by sorting every misplaced book. The player explores a world larger
than the viewport, creates temporary stacks, uses a cart, and chooses their own
method. Classification uses section, series, and volume; the main experience
has no timer.

This repository currently contains only the provisional, platform-neutral game
core. It deliberately has no gameplay screen, final art, production animation,
or copied reference material. UI and final art remain blocked until the owner
explicitly approves a complete visual proposal.

## Current technical slice

- Data-oriented book identity and location model.
- Reversible moves, occupied-slot swapping, and undo.
- Shelf validation by section, series, and volume.
- Versioned, deterministic JSON snapshots and an atomic local file store.
- Camera math for a world larger than the viewport.
- Abstract gesture arbitration for book drag, background pan, and two-finger
  pinch.
- Deterministic unit tests for the above behavior.

The package has no third-party dependencies. On a machine with Swift 5.9 or
newer, run:

```sh
swift test
```

Swift is not installed in the current Windows workspace, so the initial
verification here is limited to repository and source-level checks. The package
is intended to compile and run its tests on macOS before any iOS shell is added.

## Product boundaries

First release: iPhone and English only. No 3D, Android, backend, accounts,
analytics, tracking, ads, energy, lives, currencies, daily rewards, TestFlight,
App Review, or publication. The current marketing version is `0.1`; a future
first binary would start at build `1`.
