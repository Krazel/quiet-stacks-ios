# Quiet Stacks 0.16.10 (1): prevent page zoom

Double taps on book panels could trigger browser smart zoom instead of the game camera. The app viewport now declares a fixed scale of 1, WKWebView explicitly respects those limits, and panel elements use touch-action: manipulation. The scene retains touch-action: none and its existing two-pointer camera zoom. Scrollable card content retains pan-y; report selection and copy/share controls remain available.

References: [WebKit touch-action behavior](https://webkit.org/blog/5610/more-responsive-tapping-on-ios/) and [Apple viewport scale limits](https://developer.apple.com/documentation/webkit/wkwebviewconfiguration/ignoresviewportscalelimits).

Validation and exact TestFlight delivery are recorded below when complete. Browser gesture tests and native WKWebView scale constraints are separate evidence; physical-device acceptance remains pending.
