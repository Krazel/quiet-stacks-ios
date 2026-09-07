# Quiet Stacks 0.16.9 (1): drag-only placement

Owner request: selecting a book must not allow moving it by tapping a destination.

Removed the tap-placement branches for floor, shelves and trolley, and their unused movement helper. Tapping books or occupied trolley space only opens information; tapping empty space clears selection and closes the card. Actual book placement remains in the completed book-drag gesture, using the existing nearest-valid-drop logic. Pinch, camera dragging, cancellation, persistence and the explicit demo Sort/Scatter controls are retained.

The card action now reads **Back to library** instead of Pick up & place, matching its actual behavior. No changes to art, renderer, save format or layout.

Regression checks cover destination taps with the card open and closed, phone and desktop dimensions, unchanged books after reload, and dragging onto/off the trolley. Existing tests cover shelves, tables, nearest valid surface, pinch and cancelled drags. Native delivery is recorded separately when verified.

## Test infrastructure

The first CI attempt (34144941789) exposed an assumption in the simulator-only card probe: it required a floor book even when an earlier test had shelved all books. The probe now supports both placements. Removing stale reload snapshots then exposed the restore test replaying Sort all while waiting for simulator commands (34145656223). Reload verification now uses a simulator-only read-only mode, and requires fresh snapshots. The final run passed the original strict save comparison. These fixes do not change device gameplay. Browser checks also exercise the native probe script with both sorted and scattered fixtures and verify that its read-only polling leaves books unchanged.

## Verified delivery

Version 0.16.9 (1), build 80bf5303-0041-40c6-b3f8-870b767a57eb: VALID / IN_BETA_TESTING in the existing internal group. [CI](https://github.com/Krazel/quiet-stacks-ios/actions/runs/34146164845), commit c97dd5f3c2363fb665bd43ffd70f08a445741d11. All 80 Node tests and native iPhone/iPad smoke checks passed. Real browser touch tests at four sizes confirm that destination taps preserve every book and drag still places the book. Native smoke checks retain rendering, save/reload, reporting and both device layouts; gesture-specific regression coverage is Node and real browser input, not physical-device acceptance. The signed arm64 IPA and all 23 runtime resources match the exact commit. No external beta or public App Store submission.
