#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
test "$(uname -s)" = Darwin || { echo 'Requires macOS with Xcode.' >&2; exit 1; }
node build.mjs
node scripts/prepare-ios.mjs
mkdir -p artifacts/ios
OUTPUT="$(pwd)/artifacts/ios"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
VERSION="$(node -p 'require("./package.json").version')"
COMMIT="$(git rev-parse HEAD)"
BUILD=1
xcodebuild archive -project ios/QuietStacks.xcodeproj -scheme QuietStacks \
  -configuration Release -destination 'generic/platform=iOS' \
  -archivePath "$WORK/QuietStacks.xcarchive" \
  CURRENT_PROJECT_VERSION="$BUILD" CODE_SIGNING_ALLOWED=NO
APP="$WORK/QuietStacks.xcarchive/Products/Applications/QuietStacks.app"
test -f "$APP/QuietStacks"
file "$APP/QuietStacks" | grep 'Mach-O 64-bit executable arm64'
plutil -lint "$APP/Info.plist"
test "$(/usr/libexec/PlistBuddy -c 'Print :CFBundleSupportedPlatforms:0' "$APP/Info.plist")" = iPhoneOS
mkdir -p "$WORK/package/Payload"
cp -R "$APP" "$WORK/package/Payload/"
IPA="QuietStacks-${VERSION}-build${BUILD}-${COMMIT:0:7}-Local-QA.ipa"
(cd "$WORK/package" && zip -qry "$OUTPUT/$IPA" Payload)
python3 scripts/verify-ipa.py "$OUTPUT/$IPA"
shasum -a 256 "$OUTPUT/$IPA" > "$OUTPUT/$IPA.sha256"
python3 - "$OUTPUT" "$IPA" "$VERSION" "$BUILD" "$COMMIT" <<'PY'
import json, os, sys
out, ipa, version, build, commit = sys.argv[1:]
data = dict(app='Quiet Stacks', version=version, build=build, commit=commit,
    purpose='Local-QA', signing='Unsigned; re-sign with sideload installer',
    bundleId='com.krazel.quietstacks', minimumIOS='16.0', artifact=ipa,
    deviceTested=False, ciRun=os.environ.get('GITHUB_RUN_ID'))
with open(os.path.join(out, 'manifest.json'), 'w') as f: json.dump(data, f, indent=2)
PY
