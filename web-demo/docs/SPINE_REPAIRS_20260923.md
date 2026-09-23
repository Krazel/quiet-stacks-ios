# Collection spine repairs · 23 September 2026

Local candidate only. The released/internal TestFlight build remains 1.0.1 (1); App Store submission remains the user's responsibility.

59 spine sprites rebuilt for 22 collections. Each uses the first approved volume as the exact binding master; Folk Songs / West Alcove uses volume 2 because volume 1 was itself reported as incorrect. ImageGen painted the replacement numerals against repeated copies of that master. Only the numeral field is composited into the final spine, keeping its original dimensions, opaque binding pixels and silhouette. No runtime text overlay was added.

## Scope

| Collection | Section | Volumes |
| --- | --- | --- |
| Potion Making | Sun Tower | 2–4 |
| Celestial Instruments / Archive Edition | Celestial Records | 6 |
| Medicinal Roots | Natural Philosophy | 4, 12–19 |
| Trade Routes / Archive Edition | Eastern Records | 6 |
| Northern Expeditions / Archive Edition | Eastern Records | 7 |
| Desert Crossings, camel | Eastern Records | 7 |
| Desert Crossings, palm | East Alcove | 18–20 |
| Mountain Routes | East Alcove | 19–20 |
| Practical Charms | Clockwork Lore | 10–15 |
| Crystal Studies | Clockwork Lore | 14–16 |
| Elemental Reactions | Clockwork Lore | 5–7 |
| Protective Wards | Clockwork Lore | 5–7 |
| Border Wars | Forgotten Realms | 8 |
| Lost Kingdoms | Forgotten Realms | 8 |
| Deep Sky | Astral Charts | 6–7 |
| Night Navigation | Astral Charts | 5–7 |
| Folk Songs / Archive Edition | West Alcove | 1, 18–19 |
| Practical Charms | Arcane Studies | 5–6 |
| Enchanted Metals | Arcane Studies | 3–6 |
| Royal Histories | History & Myth | 17–18 |
| Woodland Herbs | Botanical Folios | 6–7 |
| Eclipses | Astral Charts | 5–7 rebuilt; alpha corrected for all 1–7 |

Interpretations stated to the user while awaiting clarification: “Pocket Making” is Potion Making / Sun Tower (five-volume collection); “6 al 5” is Practical Charms / Arcane Studies volumes 5–6. No answer received before implementation.

## Transparency root cause and correction

The numbered atlas packer applied a black color key to light-background artwork. It removed dark leather and ink connected to the exterior. Older coherent sprites had already inherited that damaged alpha mask.

The packer and unpacked runtime now preserve dark colors in light-background numbered sheets. Prepared atlases bypass color-key processing. Missing alpha was recovered in 601 existing spine sprites (1,228,605 pixels), using the exact original master silhouette for each collection. Only missing pixels were restored; currently opaque numeral pixels were preserved. Original light-background sheets are reimported without the black key. No rectangular fill, clipping enlargement, model change or save migration was added.

## Verification

- 122 tests passed, including a regression for dark binding pixels connected to the outside contour.
- All 1,119 book bindings resolve to packed sprites.
- All 59 replacements match the master's dimensions and alpha; opaque pixels outside the numeral field are identical.
- All sprites are packed losslessly; 9 pages and 141,950,976 decoded bytes, exactly the same as before.
- Real Chromium rendering at desktop, iPhone and iPad viewport sizes: 22 affected collections fit their slots, inspection identifies the correct volume, reload preserves positions, Demo sort/scatter works, no page or resource errors. These are browser checks, not a new native build validation.
- Visually inspected comparison sheets, restored dark contours, and in-game Eclipses, Medicinal Roots, Potion Making and Folk Songs views.

Evidence: `artifacts/reported-spines-20260923/index.html`, `verification.json`, `browser-verification.json`, screenshot PNGs; `artifacts/reported-spines-tests.log`.
Source art, reference masters, generation provenance and manifests: `design/reported-spines-20260923/`. Preparation is historical input capture; do not rerun it on the updated game. The alpha repair report records the first pass. Final assets are in the numbered atlases and packed pages used by the game.
