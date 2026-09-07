# Quiet Stacks 0.16.6 (1): device performance report

The owner reports that 0.16.5 is faster but still slow on their phone. This release adds measurement before further optimization; it does not claim to fix sustained device performance.

## Use on iPhone

1. Install 0.16.6 (1) from the existing internal TestFlight group.
2. Open Demo → Performance test → Automatic test (~30 seconds). Keep the app open. It exercises idle, wide camera movement, zoom, dragging, sorted shelves and 21 nearby-placement probes, then restores the original library.
3. Tap Share report and select WhatsApp in the iOS share sheet. The attachment is a JSON document, not a pasted message or screenshot. WhatsApp must be installed and available as a sharing destination. Sharing is initiated and addressed by the user.
4. Optionally run Record my play (20 seconds), zooming and dragging where the game feels slow. Share this second report too; each native attachment has a timestamp. Manual recording keeps actual moves.

Cancelling, rotating, backgrounding or leaving during an automatic test restores the original state. The latest report is retained locally. Copy report remains available.

## Measurements and limits

Reports include app/build, viewport, canvas resolution, device pixel ratio, aggregate placement counts, decoded image memory estimate, stage timing distributions, submitted draw FPS, input-listener-to-draw latency and nearby-placement timings. Native context adds iPhone model, iOS, power-saving mode, thermal state, battery and memory-warning/process-termination counts at the start and end.

Canvas durations measure JavaScript draw submissions, not GPU presentation time. Idle draw FPS should be zero because the renderer draws on demand. Input latency starts at the JS listener, not the physical touch. Device physical RAM is not app memory. WebContent memory is explicitly null because the bridge cannot measure it. No saved layout, individual book identities or contacts are included. No diagnostic upload or analytics service is added. A report leaves the app only through the user's copy/share action.

The recorder is inactive outside a test. Samples are bounded and exported as aggregates. Automatic placement uses an isolated model; temporary camera/book changes use a snapshot restored before persistence on page exit.

## Verification

- 78 Node tests, including summary statistics, empty samples and version consistency.
- Real Chrome integration: six automatic stages and 21 drop cases; manual inputs and latency; exact layout/save restoration; cancel/background restoration; clipboard content; Web Share file payload through a mock; actual browser download fallback. No JavaScript errors. Evidence: artifacts/performance-0166/verification.json.
- Native CI passed on iOS 18.5 simulator: WKWebView completed six stages and 21 placement probes; native clipboard matched; UIActivityViewController presented a matching 10 KB JSON file; the saved layout survived relaunch. Evidence: artifacts/performance-0166/native-report.json, native-share.json/png and native-save.json. WhatsApp is not installed in the simulator, so actual delivery through that app remains a device check. Simulator-only probes are excluded from the device target.
- Physical-phone performance diagnosis remains pending the owner's report. Simulator and desktop timings are not iPhone X benchmarks.

Native APIs: [ProcessInfo](https://developer.apple.com/documentation/foundation/processinfo), [WKScriptMessageHandler](https://developer.apple.com/documentation/webkit/wkscriptmessagehandler), [UIActivityViewController](https://developer.apple.com/documentation/uikit/uiactivityviewcontroller).

## Signed delivery evidence

CI [34127697629](https://github.com/Krazel/quiet-stacks-ios/actions/runs/34127697629) passed native verification, signing, Apple validation and upload. Exact binary source commit: `6d18bf91030d9a2d7bd423c8492fb5b732e1264a`.

IPA: `QuietStacks-0.16.6-build1-6d18bf9-TestFlight.ipa`. SHA-256: `83f39f9ad587bb5087526059bbf640ed551fb77f89149c6bc5529d780fc85e9c`.

Downloaded archive verified against that committed source: 22 exact web resources, arm64 device binary, iOS 16 minimum, version/build 0.16.6 (1), valid ZIP and matching SHA-256. Simulator diagnostic fault probe absent. Evidence: artifacts/ios-testflight-0166-upload.json.

Apple API verified build `330d9412-d94e-42ec-b3b5-0b11a16d3651`: VALID / IN_BETA_TESTING. Membership of existing internal group `2de05410-3476-48a4-b3b9-b8d3a56d6cfb` and test instructions read back successfully. Evidence: artifacts/testflight-0166-verification.json. Internal TestFlight only; no external testers or public App Store submission. Physical-device report still pending.
