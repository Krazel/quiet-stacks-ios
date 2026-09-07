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
- Native CI must additionally compile/run WKWebView, finish/copy the report, verify actual UIActivityViewController presentation with a matching JSON file, and relaunch to verify the save. Simulator-only probes are excluded from the device executable.
- Physical-phone performance diagnosis remains pending the owner's report. Simulator and desktop timings are not iPhone X benchmarks.

Native APIs: [ProcessInfo](https://developer.apple.com/documentation/foundation/processinfo), [WKScriptMessageHandler](https://developer.apple.com/documentation/webkit/wkscriptmessagehandler).
