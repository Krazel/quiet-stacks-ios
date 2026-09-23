# Quiet Stacks 1.0.1 (1)

User authorized TestFlight upload including all approved Settings changes.
No App Review submission or public release is authorized in this step.

Version 1.0.1/build1 groups the user-facing UI corrections since the prepared
1.0 candidate, following the project versioning procedure. Existing saves,
renderer, art, book placements and sounds are unchanged.

- Approved small square gear at the top right; 44px target and safe-area offsets.
- Settings > About groups support, privacy and complete audio credits.
- Performance test removed from the player menu.
- About returns to Settings; changing volume preserves the gear SVG.

Candidate commit: 9770c28b90d63681f81c6952279942c975f35193.
CI run: https://github.com/Krazel/quiet-stacks-ios/actions/runs/35869749898
Source tests: 121 passed. Distribution tests: 120 passed.
Native QA, signed upload and Apple processing: see verified receipts in
artifacts/store-101/ when completed; a started workflow is not delivery evidence.

The simulator-only diagnostic trigger now starts its test directly, since the
player button no longer exists. Store screenshot probes also exercise Settings,
About and return navigation in real WKWebView. These probes remain excluded
from device builds. The six store images preserve the approved mostly disordered
fixture (1110 floor, five shelved, four trolley) and must display the new gear.

Store target: existing editable record, updated to 1.0.1 with new build and
current screenshots; preserve price 3.99 EUR, metadata, privacy and MANUAL release.
Internal TestFlight group only; no external review or public release.

## Verified delivery

1.0.1 (1) is VALID / APP_STORE_ELIGIBLE and IN_BETA_TESTING for the existing
internal group. Apple build 0fe48d49-b667-4252-84a0-2a0d69d0bc04 is selected in editable App Store
version 0d38f274-c8f1-4560-8d6e-62db8ebeb33c. Six fresh native screenshots are COMPLETE and ordered
gallery, collections, trolley on iPhone and iPad. Price 3.99 EUR, 173 territories,
metadata/privacy/support and manual release re-read successfully.

Native QA run 35869749898, attempt 2, completed its assertions and six captures;
the workflow then reached its time limit. Recovery upload run 35873837845
validated that complete evidence against exact candidate 9770c28b90d63681f81c6952279942c975f35193, then
signed and uploaded the same candidate. Save/restore checks passed. IPA content matches all 44 offline runtime files, allowing
only Windows CRLF versus macOS LF in text files; simulator
probes are excluded from the device binary. SHA-256: 82cad51be75947565885e72302bc35558e4dd72f74333261262151f42a182090.

Library PR-014 revision 148 saved and re-read. No App Review submission,
external Beta App Review, or public release created. User sends review personally.
Evidence: artifacts/store-101/{final-audit,build-selected,ipa-verification,library}.json,
native captures artifacts/native-101/store/, exports artifacts/store-101/screenshots/.
Previous 1.0 evidence and screenshots remain in artifacts/store-100/.
