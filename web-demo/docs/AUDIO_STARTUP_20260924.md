# Audio startup correction · 24 September 2026

Status: candidate verified in browser and native simulator. The App Store/TestFlight delivery remains 1.0.1 (1). Source validation retains those version fields; it is distinguished from the shipped binary by commit `94fab7999c67b3a8589b3a1e68cd6649b8d610b2` (parent `e6edc94`). No new tester binary or store submission has been delivered.

## Report and diagnosis

The user clarified that playback starts after pressing the **physical iPhone volume buttons**, not the controls in Settings. That precise hardware symptom has not been reproduced on a physical device by this task.

Inspection and regressions identified several defects in the existing activation paths:

- The app waited for a pointerdown before creating the audio context. The WKWebView did not explicitly permit bundled media playback; the JS then awaited context resume and a complete MP3 fetch before calling play. This makes activation dependent on a later interaction and the platform's gesture rules.
- Resuming the audio context on foreground was inside the music-only play function. Music muted or at zero prevented effects-only sessions from resuming.
- The recovery path handled suspended but not WebKit's interrupted state.
- A pending media play interrupted by pause/background could leave the subsequent play blocked until another interaction. A focused regression failed before the attempt-token fix and passes after it.

These are verified software defects. They explain activation/recovery failures, but do not prove that the physical button symptom has a single hardware/session cause. Native audio session category and hardware output volume are not changed.

## Changes

- The bundled app explicitly permits its local media and activates the shared audio context when the gallery renders its first frame. Saved music mute, music level and effects level still govern output.
- Browser playback is requested directly in normal pointer/touch/key gestures, with the media URL assigned ahead of time. Native media keeps the Blob path that avoids custom-scheme range-request issues.
- Small effects preload while the room loads. Recently requested effects can wait briefly for decode/resume, but old effects are discarded and the existing two-voice cap remains.
- Foreground recovery resumes the context independently of music preferences, including interrupted contexts. Background suspends music/effects and clears queued sounds.
- Interrupted play attempts are invalidated; an obsolete promise cannot block or overwrite a newer attempt.
- No library art, book catalog, sorting, saved book placements, music recording, floor sound L, pitch variation or user controls were replaced.

## Verified evidence

- Source test suite: **131/131 passed**, including 9 audio regressions.
- Real Chromium audio decoding: **5 scenarios passed**. High/low levels, touch activation without Settings, music mute with audible effects, zero levels, preserved preferences after reopening, background/foreground, actual internal gain control, and a media request interrupted before bytes arrive. PCM analyser peaks confirm nonzero samples for effects; no page errors. Browser lifecycle dispatches and touch emulation are not physical iOS tests.
- Original cancelled native run35937165481 compiled successfully; cancellation occurred during simulator boot. It did not validate audio.
- [Final native validation run35981852411](https://github.com/Krazel/quiet-stacks-ios/actions/runs/35981852411) succeeded on commit94fab79: **5/5 scenarios**, real WKWebView in iPhone16Pro simulator / iOS18.5. Each cold launch already had a running context before any probe gesture. Music started automatically at saved high/low volumes (PCM peaks .04175/.001566); muted music remained silent with effects audible (.02607); zero music/effects remained silent and persisted after relaunch. Actual app switches to Safari and back suspended/resumed correctly; a single audio context remained, without extra effect voices. Evidence: `native/verification.json` and ten cold/resumed JSON files.

Evidence folder: `artifacts/audio-startup-20260924/`. Native probe uses a real WKWebView with the packaged game and exports cold/restarted audio state, sample peaks and voice/context counts. It is compiled behind TARGET_OS_SIMULATOR and the probe asset is copied only by the QA script.

Library PR-014 revision168 saved and reread: audio candidate and physical-device follow-up recorded; marketing v4, TestFlight/App Store tracking and all other fields preserved.

## Platform constraints and follow-up

A simulator cannot certify the physical volume buttons, silent switch, speaker route, Bluetooth, or behavior of the user's iPhone10,6 on iOS16.7.16 (last hardware report in this task). That device/version must be reconfirmed if needed. Check on a real device after a future tester build: saved high/low volume, silent switch both positions, cold launch without any volume-button press, music/effects separately, app switch/lock/unlock, and changing physical volume afterward. Do not claim this physical check passed.

Authoritative references consulted:
- [WebKit autoplay guidance](https://webkit.org/blog/7734/auto-play-policy-changes-for-macos/): request playback from interaction, handle rejected play promises, and preserve one media element.
- [WKWebView media action policy](https://developer.apple.com/documentation/webkit/wkwebviewconfiguration/mediatypesrequiringuseractionforplayback): configuration controls media gesture requirements in the app.
- [Apple audio session behavior](https://developer.apple.com/library/archive/documentation/Audio/Conceptual/AudioSessionProgrammingGuide/AudioSessionBasics/AudioSessionBasics.html): output/silent/background behavior depends on the session and system; app gain is not the device volume.
- [WebKit interrupted AudioContext report](https://bugs.webkit.org/show_bug.cgi?id=263627): prior platform resumption issues exist; that report alone does not establish the cause on this user's device.
