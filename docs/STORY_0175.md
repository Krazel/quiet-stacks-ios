# Quiet Stacks 0.17.5 (1) — Royal succession and camera continuity

Candidate, 2026-09-09. Native verification and internal TestFlight pending.

## Result

The player asks to succeed Master Alden, the ageing Royal Librarian. A brief
letter introduces his final test. Placing all 960 volumes in their exact slots
earns the brass keys and the title of Royal Librarian. The letter is remembered;
the ending waits for the final placement animation and survives a relaunch.
Demo offers Read the letter and Preview ending without awarding completion.
Existing books and saved progress remain intact. Text stays in English.

Books at the bottom no longer disappear as complete sprites when they cross the
home-gesture band: the renderer clips at the actual canvas edge. The exclusion
for dropping books into the gesture area remains. Both painted walls are now
reachable at every zoom, including devices reporting zero horizontal safe inset.
The camera uses the entire existing painted extent (-130 through 1862); the room
image, world coordinates, shelf geometry and 117 collections have not changed.

## Validation

- 97 Node tests passed: saved cameras near both walls, opening persistence,
  completion and cancellation, relaunch, previews and unavailable storage.
- Real browser: iPhone, small landscape phone, iPad, desktop and Canvas fallback.
  Opening/ending fit without scrolling; exact last-volume drag earns the ending;
  each wall is reachable at zoom 1, 3 and 8; books render continuously across the
  bottom band with unchanged world positions. No JavaScript errors.
- GPU/Canvas visual comparison and context recovery passed. The scene still
  prepares 11 textures / 124.27 MiB. Desktop FPS is not a physical iPhone result.
- Performance recording, file sharing, cancellation and save restoration passed.
- Build contains 26 runtime files, including the small story controller; no new
  raster assets, frameworks or GPU textures.

Evidence: `artifacts/story-0175/verification.json`, `artifacts/performance-0175/`,
`design/royal-story-0175/`. Native simulator QA and exact signed IPA will be
recorded below before claiming delivery.

## Distribution

Previous verified release: 0.17.4 (1), internal TestFlight. App Store Connect
record exists; no public App Store release or external beta is claimed.
Responsible task: `01a07092-414a-7d92-82da-1a1088f2897f`. Library: PR-014.
