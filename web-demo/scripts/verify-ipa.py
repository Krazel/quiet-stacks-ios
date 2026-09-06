"""Verify a device IPA and exact offline web payload against the approved manifest."""
import json, pathlib, plistlib, struct, sys, zipfile
root = pathlib.Path(__file__).resolve().parent.parent
manifest = json.loads((root / 'artifacts/web-build.json').read_text())
with zipfile.ZipFile(sys.argv[1]) as archive:
    prefix = 'Payload/QuietStacks.app/'
    info = plistlib.loads(archive.read(prefix + 'Info.plist'))
    assert info['CFBundleSupportedPlatforms'] == ['iPhoneOS'], 'Not a device build'
    assert info['CFBundleShortVersionString'] == manifest['version'], 'Wrong version'
    assert info['CFBundleIdentifier'] == 'com.krazel.quietstacks'
    binary = archive.read(prefix + info['CFBundleExecutable'])
    magic, cpu = struct.unpack_from('<II', binary)
    assert magic == 0xfeedfacf and cpu == 0x100000c, 'Expected arm64 Mach-O executable'
    bundled = {n[len(prefix + 'web/'):] for n in archive.namelist()
               if n.startswith(prefix + 'web/') and not n.endswith('/')}
    assert bundled == set(manifest['files']), 'Missing or obsolete web resources'
    for asset in manifest['files']:
        assert archive.read(prefix + 'web/' + asset) == (root / 'web' / asset).read_bytes(), asset
print('Verified iPhoneOS arm64 executable, version and all', len(manifest['files']), 'offline resources.')
