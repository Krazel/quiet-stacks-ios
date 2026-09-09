# Quiet Stacks 0.17.1 (1): safe gameplay area and selected book

The user reported that the iPhone camera cutout hid part of a bookcase and books, and requested no books near the bottom system gesture, plus a visible selection border.

The library canvas now sits inside the device's safe insets. An additional 12 CSS pixels above a nonzero bottom inset separate books from the home gesture. A repeating floor fragment from the approved background fills the outside margins. There are no book images or interactive book surfaces there. The playable view is reduced to fit; no shelf collection, volume or stored position is removed. Camera movement and pinch zoom operate inside this viewport. ResizeObserver follows safe-area/layout changes and device rotation.

A fine gold border marks only the selected book, including when the compact summary is open and while dragging. It follows the existing drawing bounds and disappears on deselection. It is a pointer-transparent DOM overlay, updated with scene frames, with no continuous animation, extra GPU atlas or additional idle book frames.

Dragging into a reserved margin keeps the held book visible. Release searches nearby valid floor, shelf or trolley positions where the entire placed book fits inside the visible playfield. A clamped floor candidate covers zoomed views containing open floor without any furniture boundary. If no visible surface is available, the transaction preserves the original book. Existing saved books outside the current camera remain reachable by panning.

Validation: 86 Node tests, browser safe-inset cases for iPhone X, Dynamic Island, rotation, iPad and desktop; selected/dragged border, edge drops, 960 sorted volumes, unchanged saved books during camera changes and idle rendering. Mobile UI/gesture checks and Canvas/WebGL visual equivalence pass. Native safe-area and selection probes are included in the iPhone/iPad CI checks.

Candidate 0.17.1 (1). Native QA, signed IPA and TestFlight state are recorded after verification. Current active TestFlight remains 0.17.0 until the new build is accepted and assigned.
