# Quiet Stacks 0.16.10 (1): prevent page zoom

Double taps on book panels could trigger browser smart zoom instead of the game camera. The app viewport now declares a fixed scale of 1, WKWebView explicitly respects those limits, and panel elements use touch-action: manipulation. The scene retains touch-action: none and its existing two-pointer camera zoom. Scrollable card content retains pan-y; report selection and copy/share controls remain available.

References: [WebKit touch-action behavior](https://webkit.org/blog/5610/more-responsive-tapping-on-ios/) and [Apple viewport scale limits](https://developer.apple.com/documentation/webkit/wkwebviewconfiguration/ignoresviewportscalelimits).

Validation and exact TestFlight delivery are recorded below when complete. Browser gesture tests and native WKWebView scale constraints are separate evidence; physical-device acceptance remains pending.

## Verified delivery

0.16.10 (1), build eb8b0f5a-537e-4d9f-9977-742c3e046ef9: VALID / IN_BETA_TESTING in the existing internal group. [CI](https://github.com/Krazel/quiet-stacks-ios/actions/runs/34169469202), commit 8085aa4d7cb1761b40e519e1dbae08f57fd2f675. All 80 Node tests passed. Browser tests use mobile emulation and actual CDP double-tap/touch gestures at four viewport sizes: page scale stays 1 on book headings, descriptions and summary; game pinch increases camera zoom without moving books; overflow content still scrolls. Native iPhone and iPad probes verify WKWebView current, minimum and maximum page zoom all equal 1, alongside existing save/reload, reporting and render checks. Native scale constraints are verified; physical double taps on the user's iOS version remain for device acceptance. The signed arm64 IPA and its 23 runtime files match the exact commit.
