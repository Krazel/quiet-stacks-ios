# App Store 1.0 preparation — 23 September 2026

User: prepare everything via API, Chrome only where needed. Do not send to review.
One-time price: EUR 3.99, Spain. Existing draft version reused; manual release.
App 6809193192, version 0d38f274-c8f1-4560-8d6e-62db8ebeb33c.

## Candidate and privacy inventory

1.0 (1), 11f9503543db4f5413f38efce152fd18b0338bab, CI 35795897927.
121 source/120 distribution tests and browser Settings checks pass.
Native UIKit/WKWebView shell, no third-party SDK. Fixed local quietstacks scheme
serves bundled assets. Game/graphics/audio have no external network dependency.
Local storage: book arrangement, camera, story and audio preferences. Native
diagnostics stay in app caches; performance reports remain local and export only
through an explicit copy/share action. No account, ads, IAP, tracking or analytics.
App Privacy: no automatic collection; optional developer support applies the
user-initiated support exception. Privacy manifest has no collected/tracking data. Required-reason API: systemUptime, 35F9.1, elapsed time between app events only.
New support/privacy HTTPS links open only after a user tap; allowed destinations
are restricted to the two Quiet Stacks pages on krazel.github.io.

Public support alias: coderappskrazel@gmail.com, reused from Studio’s published
support pages. Private review contact reused within Apple from VORO; never included
in public pages or artifacts. Support email may include user-selected diagnostics;
policy explains mailbox, usage and deletion requests separately from offline play.

## Store preparation

English app and listing; no new game localization. Games > Puzzle and Casual.
Age questionnaire reflects nonviolent offline sorting, no chat, UGC, gambling or
ads. Rights declared for attributed CC BY music and CC0 effects. No custom EULA.
Description/subtitle/keywords/promotion/support/privacy saved and re-read by API.
Review contact complete; login not required; notes describe controls and offline
scheme. Version remains PREPARE_FOR_SUBMISSION / MANUAL. No review request created.

Price base ESP 3.99 EUR verified. 173 territories selected; China and Vietnam
excluded because no local game licenses were supplied. No pre-order and no
automatic addition of new territories. Existing account agreements remain intact.

## Sources and evidence

- Apple OpenAPI 4.4.1 downloaded 23-09; no App Privacy label or DSA/account-agreement
  endpoints. Chrome used only for these unsupported areas.
- https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy
- https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications
- https://developer.apple.com/help/app-store-connect/reference/app-information/app-information
- https://developer.apple.com/app-store/review/guidelines/
- `artifacts/store-100/metadata.json`, `price-availability.json`, `ui/`.


## Verified completion — 23 September 2026

App Store 1.0 (1) is prepared; no review submission or release was created.
The user must review and submit personally. Release remains MANUAL.
Apple build e6d171d9-d0f5-45c8-98f8-448c5dc76616 is VALID / APP_STORE_ELIGIBLE and selected in
version 0d38f274-c8f1-4560-8d6e-62db8ebeb33c. TestFlight INTERNAL is active;
external beta has not been submitted. No public App Store release exists.

Runtime commit 11f9503543db4f5413f38efce152fd18b0338bab; signed build and native QA run 35795897927.
IPA SHA-256: 4e052fe4fdc65e682f312bb221b338bc70d50241388dfd2d688726647dd5e657.
Downloaded archive, signature evidence, arm64/iOS 16 target, privacy manifest and
all 44 bundled runtime files verified against the committed candidate. Simulator
fixtures and fault probes are absent from the device executable.
121 source / 120 distribution tests passed, plus native launch/restore, drag,
performance report sharing, layout, opening/ending and idle-render checks.
Performance values in artifacts are simulator measurements, not device claims.

Six native screenshots from release source, capture run 35798414358:
three iPhone 2778×1284 and three iPad 2752×2064. Reviewed visually and uploaded
through Apple's API; all six COMPLETE with checksums and order re-read.
The iPhone 13 Pro Max capture surface avoids the Dynamic Island overlay. No
artwork retouching, stretching or composited interface; orientation/RGB only.

One-time EUR 3.99 (Spain base), 173 territories, no pre-order. China and Vietnam
remain excluded pending local game licenses. English listing, 4+ age rating,
Games/Puzzle/Casual, complete private review contact and no-login notes verified.
Public support and privacy pages return HTTP 200. Published privacy label says
no data collected; existing paid agreement, banking/tax and DSA were active.
No ads, IAP, account, analytics or tracking SDK. Required-reason API: elapsed
systemUptime under 35F9.1. Third-party licensed audio is attributed in Settings.

Library PR-014 revision 140 saved and re-read; marketing context preserved.
Evidence: artifacts/store-100/final-audit.json, screenshots-upload.json,
screenshots/manifest.json, library-ready.json; artifacts/native-100-verification.json
and artifacts/ios-testflight-100-upload.json.

Prepared version: https://appstoreconnect.apple.com/apps/6809193192/distribution/ios/version/inflight
Support: https://krazel.github.io/quiet-stacks/support/
Privacy: https://krazel.github.io/quiet-stacks/privacy/
