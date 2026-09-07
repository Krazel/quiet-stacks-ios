# Quiet Stacks 0.16.9 (1): drag-only placement

Owner request: selecting a book must not allow moving it by tapping a destination.

Removed the tap-placement branches for floor, shelves and trolley, and their unused movement helper. Tapping books or occupied trolley space only opens information; tapping empty space clears selection and closes the card. Actual book placement remains in the completed book-drag gesture, using the existing nearest-valid-drop logic. Pinch, camera dragging, cancellation, persistence and the explicit demo Sort/Scatter controls are retained.

The card action now reads **Back to library** instead of Pick up & place, matching its actual behavior. No changes to art, renderer, save format or layout.

Regression checks cover destination taps with the card open and closed, phone and desktop dimensions, unchanged books after reload, and dragging onto/off the trolley. Existing tests cover shelves, tables, nearest valid surface, pinch and cancelled drags. Native delivery is recorded separately when verified.
