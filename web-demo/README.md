# Quiet Stacks web demo 0.16.0

The current playable game uses HTML, Canvas 2D and JavaScript, with all art bundled offline.
525 volumes across 100 collections have engraved volume numbers on their shelf spines.

Run `npm start`, `npm test` or `npm run build` from this directory.

## iOS sideload build

On macOS with Xcode, run `bash scripts/build-ios.sh`.
Shared scheme: QuietStacks. Minimum iOS 16, arm64, iPhone/iPad landscape.
Bundle identifier: com.krazel.quietstacks.webdemo. Version 0.16.0, build 1.
The WKWebView wrapper loads the same game from local resources; no server is required.
The IPA is unsigned and must be signed by your sideload installer. No App Store or TestFlight submission.
The build validates a device arm64 executable and byte-identical offline resources.
Physical iPhone testing remains pending. The app currently uses the default icon.

A manual GitHub Actions workflow builds the IPA and retains its artifact for 14 days.
The historical Swift package at repository root is preserved separately.
