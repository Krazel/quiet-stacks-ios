# Quiet Stacks 1.1 (1) · TestFlight

User authorized TestFlight on 25 September 2026 after removing destination previews from the floor. Previews now appear only for shelf and trolley destinations. Free placement on floors/tables and nearest-valid fallback are unchanged. Softer placement recordings vary subtly in pitch and release duration; existing startup/foreground audio fixes, repaired bindings and temporary Demo controls are included.

The version advances from 1.0.1 to 1.1 for the placement-preview feature; build resets to 1. No App Store version, submission, release or marketing page is changed by this upload.

Validation before upload: 135 source tests / 134 distribution tests, Chromium desktop/touch/Canvas cases, iPhone/iPad native gallery QA and five native audio startup/resume cases. CI gates signing/upload on both native jobs. App Store screenshot generation is omitted for this TestFlight-only delivery; normal gallery, persistence, diagnostics and UI checks remain enabled. Device builds exclude simulator probes.

Delivery requires signed IPA verification, successful Apple processing and reread membership in the existing internal TestFlight group. See the run artifacts and final API receipt; a queued workflow alone is not delivery.

## Verified delivery · 25 September 2026

Version1.1 build1 is VALID / IN_BETA_TESTING in the existing internal group. Apple build 7d2da7de-bf10-4eb7-b39a-3c32ed6b6142. Candidate 1deeb55de08c1426df7578609234565425460ef0; all three CI jobs passed: https://github.com/Krazel/quiet-stacks-ios/actions/runs/36162137792. Five native audio cases and iPhone/iPad UI/save/restore passed; no process termination or graphics context loss. The device IPA matches all44 offline resources (only text line endings differ from Windows), SHA256 3641146a7877390d62f6b84385af3136dd6fd68a72d256d22a16f0b5f02872fd; simulator probes absent, floor previews absent, four softened WAV assets present. Physical-device play remains to be checked by testers. App Store version1.0.1/build1 and its manual, unsubmitted state were re-read unchanged. No external Beta App Review or App Review requested. PR-014 revision175 saved/re-read, tracking preserved. Receipts in artifacts/release-110/.
