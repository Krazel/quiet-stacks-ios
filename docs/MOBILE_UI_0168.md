# Quiet Stacks 0.16.8 (1): phone interface

The owner confirms 0.16.7 now performs well on their device. This release addresses UI space and readability only; the GPU renderer and artwork are retained.

- Removed the upper-left Quiet Stacks banner and upper-right zoom controls from the DOM. Pinch/scroll and keyboard zoom remain; Home resets the camera for keyboard users and automated checks.
- Phone summary: small cover, up to two title lines, one collection/volume line. At 724×354 it measures 300×63 CSS pixels, versus the previous substantially larger panel. The trolley's book buttons scroll horizontally instead of wrapping into tall rows.
- Opening the full book card hides the duplicate summary. Closing or choosing Pick up & place restores it; dragging still identifies the book before release.
- Replaced conflicting top/bottom rules that reduced the phone card to a narrow strip. Phones use a wide card with cover alongside information. Header/close and bottom action remain outside the scrolling content. iPad retains a wider summary and side card.
- Removed the scene's 320-pixel minimum height, which pushed the footer beyond short phone viewports.
- Disabled browser text selection and iOS long-press callouts throughout the game and book panels. The diagnostic report alone remains selectable for manual copying. Pinch, book dragging and panel scrolling retain their existing touch behavior.

## Checks

78 existing Node checks cover gestures, placement, persistence and reporting. Updated old zoom-button checks to use keyboard controls. Real Chrome UI checks cover 724×354, 568×300, 390×844 and 1024×744 at DPR 2. They exercise book selection, card close and pickup, summary dimensions, removed controls, viewport boundaries, 44-pixel actions and no JS errors. The standard iPhone viewport shows the tested metadata without scrolling; smaller viewports keep the action visible and allow content scrolling.

Evidence: scripts/verify-mobile-ui.cjs and artifacts/mobile-ui-0168/. Screenshots are browser evidence unless explicitly labelled native. Native CI additionally opens the book card and captures its summary/details on both iPhone and iPad simulators, alongside the existing load/save/report and renderer checks.

Language remains English. No new assets, server, analytics, ads, purchases or public App Store release. Native delivery and device feedback must be recorded separately from local UI checks.

## Native delivery

0.16.8 (1) is VALID / IN_BETA_TESTING in the existing internal group. Build ID: 811e4a7b-f15c-4189-8308-3bbeef9d2d41. [Successful validation and delivery](https://github.com/Krazel/quiet-stacks-ios/actions/runs/34141375963), commit d87a246f73706c220ba864f35bfe7a4946f9f24c. Native iPhone card/summary and iPad summary screenshots, plus card/summary geometry for both devices, are saved under artifacts/mobile-ui-0168/native-*. The iPad details screenshot was delayed until after the test closed the card; that duplicate is excluded from the visual record. Its open-card geometry passed; visual detail coverage uses the full browser iPad capture. Both validate the WebKit selection/callout policy. Browser checks additionally exercise double-click and long-press/drag text selection; the report copy/share integration still passes. The signed arm64 IPA contains all 23 runtime resources, byte-for-byte matched to that commit; simulator probes are absent.

The first attempt (34139378671) passed game and iPhone checks but hit the overall timeout during iPad startup. The successful run shuts down iPhone before starting iPad and allows 25 minutes for native verification. The user has confirmed 0.16.7 performance; physical-device acceptance of this UI remains pending. No external beta or public App Store submission.
