# Quiet Stacks — Visual Proposal V3

Status: **PROPOSAL ONLY — NOT APPROVED**

This coherent four-frame set is a visual-first approval proposal for the English iPhone MVP. It is not implemented UI, final art, an App Store capture, or permission to begin final visual implementation. Nothing in this directory is canonical until the owner explicitly approves it and the project brain records that approval separately. No file from this set belongs in `design/approved/` yet.

## Generation method

- Tool: OpenAI integrated `image_gen` tool (built-in mode), one generation per requested frame.
- Use-case taxonomy: `ui-mockup`.
- Canvas: portrait iPhone-oriented raster, 853 × 1844 px, PNG.
- Reference role: the four V2 images in Brain were inspected only as **tone references** for warm painted wood, paper, brass, and lamp light. They were not edit targets or masters. Their building layout, framing, UI, signage, furniture arrangement, and map were explicitly excluded from reproduction.
- Continuity method: frame 1 was generated from the written V3 brief with V2 used for tone only; each later frame used preceding V3 output(s) as continuity anchors for architecture, palette, lighting, cart, rugs, and book families.
- Originality boundary: no names, text, characters, maps, UI, assets, or artwork from *Librarian: Tidy Up the Arcane Library!* were downloaded, copied, or reused.

## Deliverables and verification

| Frame | Canonical proposal path | Delivery-copy path | Dimensions | SHA-256 | What it demonstrates |
|---|---|---|---|---|---|
| 1 — Exploration | `design/proposals/v3/quiet-stacks-v3-01-exploration-east-gallery.png` | `outputs/quiet-stacks-v3/quiet-stacks-v3-01-exploration-east-gallery.png` | 853 × 1844 | `B046152097FA9E3A3BCCF6453A948A8261427FE878B91041D679567FDE46D446` | A cropped sector of a much larger continuous library: shelf bays, balconies, stairs, and galleries leave all four edges; a long minimap and edge chevrons establish pan/zoom without fitting the map on screen. |
| 2 — Work zone | `design/proposals/v3/quiet-stacks-v3-02-work-floor-cart-stacks.png` | `outputs/quiet-stacks-v3/quiet-stacks-v3-02-work-floor-cart-stacks.png` | 853 × 1844 | `C8BF29142E62ECCEA557EF56B103845588B893618B0C0DA36ADD416995CE3049` | The same East Gallery at a closer camera scale, with a physical five-slot cart, three player-created provisional stacks, an individual dragged book, and recognizable spatial anchors from frame 1. |
| 3 — Shelf placement | `design/proposals/v3/quiet-stacks-v3-03-botany-shelf-snap.png` | `outputs/quiet-stacks-v3/quiet-stacks-v3-03-botany-shelf-snap.png` | 853 × 1844 | `BFD4E1B0E0BC68CECCFB2C462802B78447F81F6A15ECFD4CAC55363999C62239` | A close zoom on the same world, with cart and floor stack still visible at the edges; section/series/volume logic, a physical staging ledge, snap target, swap affordance, and accessible confirmation via emblem, numeral, outline, check, words, ripple, and sound cue—not color alone. |
| 4 — Return | `design/proposals/v3/quiet-stacks-v3-04-return-partial-restoration.png` | `outputs/quiet-stacks-v3/quiet-stacks-v3-04-return-partial-restoration.png` | 853 × 1844 | `D399572F65E40F90F88D5092D9F14B5F8D5B610ED800FDDA83DAEE73B7E6416E` | Return to exploration in the same sector: the walkway and some rows are restored, while physical piles continue through the corridor and the minimap marks many off-screen unfinished areas with hatch and pile icons. |

The delivery copies are byte-identical to the proposal files and therefore share their hashes.

## Final prompts

### Frame 1 — Exploration

```text
Use case: ui-mockup
Asset type: complete portrait iPhone gameplay screen, V3 frame 1 of a coherent four-frame visual proposal for an original 2D game
Primary request: Create a new, complete, shippable-looking gameplay mockup for an original game titled "Quiet Stacks". Show EXPLORATION at medium zoom inside one continuous monumental library world that is much larger than the phone viewport. This is a brand-new composition, not an edit or recreation of any reference image.
Input images: Images 1–4 are tone-only references. Borrow only the general warmth of painted wood, paper, brass and lamp light. Do not reproduce their room layout, camera composition, signage, furniture arrangement, UI frames, book designs, or map.
Scene/backdrop: a vast hand-painted 2D side-on library interior extending well beyond every edge of the vertical screen. The viewport catches only part of an enormous central aisle: a cropped stair begins below the bottom edge, a balcony continues beyond the left and right edges, tall shelf bays are visibly cut by both side edges, and upper galleries disappear above the top edge. Loose books cover this visible sector while distant adjacent sectors are glimpsed through arches.
Subject: no character. The persistent world itself is the subject. Hundreds of individually readable but composable books, modular shelf bays, floor runners, rolling ladder, reading tables and lamps. A small wheeled book cart is present in-world, not a UI inventory.
Style/medium: polished 2D painted game art with a clean editorial silhouette language, orthographic side elevation with mild layered depth/parallax only; clearly flat 2D, never 3D/isometric. Warm walnut, aged cream paper, forest green, oxblood red, dusty blue, brass, honey lamp light. Painterly texture but crisp gameplay readability.
Composition/framing: portrait iPhone 2:3 screen with safe areas. Crop the world boldly on all sides so the whole library cannot possibly fit. The current focus is a single sector, not a dollhouse overview. World-space objects remain the dominant visual area.
UI: restrained and modern. Top safe-area strip: exact title "Quiet Stacks"; beneath it a compact exact location label "East Gallery". Near one upper corner, a tiny unobtrusive vertical minimap showing a long multi-room library floor plan much larger than the current rectangular viewport; the current viewport rectangle occupies less than one tenth of that minimap. Add subtle edge chevrons at left, right, up and down, partially transparent, implying pan continuity. Bottom safe-area contains only a small round cart-focus button and a tiny two-finger pinch icon with exact microcopy "Pinch to explore". No timer, score, coins, lives, progress stars, ads, menus, or large panels.
Interaction cues: a faint two-finger pinch gesture trace and a very subtle pan trail over the world, integrated like a product mockup annotation, not a tutorial modal.
Lighting/mood: quiet evening warmth, inviting but monumental; lamps pool light locally, cooler shadow in adjacent unseen spaces.
Text (verbatim): "Quiet Stacks", "East Gallery", "Pinch to explore"
Constraints: original IP; English only; full-screen complete UI; visibly one continuous pannable and smoothly zoomable surface; no full-map view; no disconnected rooms-as-menu; no character; no magic; no fantasy runes; no timer; no coins; no lives; no ads; no leaderboard; no 3D; no isometric perspective; no brand marks; no watermark. Keep critical text exact and readable. Books must look systemically generated from reusable shapes, colors, small section emblems and volume numerals rather than unique illustrated covers.
Avoid: fitting the whole building in frame; dollhouse overview; ornate fantasy UI; generic goods-sort puzzle; triple-match slots; book covers laid out as cards; photographic realism; direct resemblance to any existing game.
```

### Frame 2 — Work floor

```text
Use case: ui-mockup
Asset type: complete portrait iPhone gameplay screen, V3 frame 2 of the same original game sequence
Primary request: Continue from Image 1 and show the SAME East Gallery, now smoothly panned downward/right and zoomed in to the physical WORK ZONE. Preserve the exact library identity, palette, architectural grammar, lamps, shelf bay style, forest-green brass-trimmed wheeled cart, rug language, book families and evening lighting. This is a newly rendered camera state on the same continuous 2D world surface, not a disconnected menu and not an edit of an older proposal.
Input images: Image 1 is the continuity anchor for world, palette, lighting and cart design.
Scene/backdrop: the visible background must retain recognizable fragments from frame 1: one cropped arched shelf bay, the same brass rolling ladder partly visible, the same lower stair/railing edge, and the corridor arch continuing beyond frame. Shelf bays and piles are cut by screen edges so the room continues outside the viewport.
Subject: a tactile staging area on the library floor. The same physical wheeled cart is now large enough to use, with exactly five visible upright book slots and three occupied. Around it are three neat provisional stacks sitting directly on the rug, each marked by a small reusable wooden tab: leaf symbol, wave symbol, starburst symbol. Many unsorted loose books remain around the edges. One individual oxblood book is being dragged from a loose pile toward the cart, with a soft amber lift shadow and a dotted trajectory; no hand illustration.
Style/medium: polished hand-painted 2D game art; clear editorial silhouettes; flat side-on layered scene with mild parallax depth only; no 3D, no isometric. Warm walnut, aged paper, forest green, oxblood, dusty blue, brass, honey lamp light. Books are independent composable entities assembled from consistent spine shapes, sizes, colors, textures, small section emblem and Roman volume numeral.
Composition/framing: portrait iPhone 2:3, full-screen world dominant. Camera feels roughly 1.8x closer than frame 1. Physical cart centered slightly low, three floor stacks around it without forming separate cards. The architecture remains visible enough to orient the player.
UI: minimal translucent safe-area header with exact text "East Gallery · Work Floor" and a small outlined back-to-sector magnifier-minus icon, never a menu tab. Retain the same tiny vertical minimap in an upper corner, with the viewport rectangle expanded/moved to this work-zone coordinate. At bottom, a compact five-slot cart strip mirrors the physical cart but remains subordinate; exact capacity text "3 / 5". One unobtrusive action label reads "Hold to stack". No other text.
Interaction cues: subtle pan/zoom continuity indicator; a faint ghost outline shows where the dragged book may snap into the fourth cart slot. The three provisional stacks must clearly be physical in-world objects that the player created.
Lighting/mood: calm focused pool of lamp light on the work rug, background slightly softer but still spatially legible.
Text (verbatim): "East Gallery · Work Floor", "3 / 5", "Hold to stack"
Constraints: preserve continuity with Image 1; original IP; English only; full-screen complete UI; one continuous pannable/zoomable world; no character; no timer; no coins; no lives; no ads; no scoring; no magic; no fantasy runes; no 3D; no isometric; no inventory-grid menu; no modal; no giant buttons; no brand marks; no watermark. Accessible symbol labels on every stack, not color alone.
Avoid: isolated tabletop; detached card layout; goods-sort or triple-match presentation; five identical book thumbnails; fitting the whole library in frame; changing art direction or architecture.
```

### Frame 3 — Shelf placement

```text
Use case: ui-mockup
Asset type: complete portrait iPhone gameplay screen, V3 frame 3 of the same original game sequence
Primary request: Continue from Image 1 and show a smooth camera pan and close zoom from the SAME East Gallery Work Floor to ONE nearby shelf bay. This must look like the same continuous 2D world surface at roughly 3.5x zoom, not a separate puzzle screen. Preserve the same walnut architecture, forest-green/brass cart, rug, book-family system, palette and evening lamp light.
Input images: Image 1 is the continuity anchor for the exact world, cart and art direction.
Scene/backdrop: a single tall modular shelf bay dominates the center, but its left edge is cropped by the phone and adjacent shelf bays continue past the right edge. Along the lower-left border, show a recognizable cropped corner of the same physical cart and one wheel; along the bottom-right border, show the top of the same wave-symbol provisional floor stack on the same rug. A narrow slice of corridor and lamp behind the shelf keeps location continuity.
Subject: tactile shelf placement and validation. The active row contains an ordered leaf-emblem series with volumes I, II and III already placed, a dashed snap slot for IV, and volume V waiting to the right. A single oxblood leaf-emblem Volume IV book is mid-drag toward the slot. Above it, a small in-world wooden section plaque shows exact text "BOTANY" plus the leaf emblem. Neighboring rows show other reusable families using wave and starburst emblems and Roman numerals, proving section + series + volume logic rather than color sorting.
Staging: just below the active row, include a narrow physical staging ledge attached to the shelf holding two books from the cart; it is not an inventory card or separate menu.
Style/medium: polished hand-painted 2D game art with crisp editorial silhouettes and paper/wood texture; flat side-on layered scene, mild parallax only; no 3D, no isometric. Warm walnut, aged cream paper, forest green, oxblood, dusty blue, brass, honey lamp light.
Composition/framing: portrait iPhone 2:3 full screen. Keep the world visible edge-to-edge. The shelf is very close but intentionally cropped so it obviously belongs to a larger row of bays. Maintain safe areas.
UI: tiny translucent safe-area breadcrumb with exact text "East Gallery · Botany Bay"; compact minus magnifier icon for zooming back out. Retain the tiny vertical minimap in the same upper corner, now with an even smaller coordinate marker and a visibly larger viewport rectangle at this close zoom. At bottom, a compact cart strip with exact "2 / 5", showing two spine icons only. No modal panel and no full-width opaque tray.
Snap and accessible feedback: the Volume IV target uses a dashed rectangular outline, a leaf emblem embossed behind the slot, and a small Roman numeral IV marker. A white-gold landing halo and dotted motion path guide the dragged book. Beside the active row, show a small round seal with both a checkmark AND exact word "IN ORDER"; do not rely on green/red. Also show one subtle haptic ripple and tiny musical-note spark to suggest sound/haptics. A wrongly placed neighboring book may show an amber notched outline plus a swap-arrows icon, never red alone.
Text (verbatim): "East Gallery · Botany Bay", "BOTANY", "IN ORDER", "2 / 5"
Constraints: original IP; English only; same continuous pannable/zoomable world; no character; no timer; no coins; no lives; no ads; no score; no magic; no 3D; no isometric; no goods-sort grid; no triple-match; no detached puzzle board; no large menu panels; no brand marks; no watermark. Book identity must be readable through emblem + Roman volume number + spine shape, never color alone. Critical text exact and readable.
Avoid: recreating any older close-up reference; fitting an entire shelving wall in frame; generic card inventory; rainbow color sort; detached shelf puzzle; changing architecture or lighting.
```

### Frame 4 — Return and partial restoration

```text
Use case: ui-mockup
Asset type: complete portrait iPhone gameplay screen, V3 frame 4 and final beat of the same original game sequence
Primary request: Return smoothly from the shelf close-up to EXPLORATION in the SAME East Gallery on the same continuous 2D library world. Show the visible East Gallery partially restored after the earlier sorting work while making it unmistakable that many unsorted areas continue beyond the viewport. This is a new camera state, not a summary menu and not a full-map overview.
Input images: Image 1 is the medium-zoom exploration anchor; Image 2 defines the exact physical cart and work-zone staging; Image 3 defines the shelf/book family and accessible validation language. Preserve their world identity, walnut architecture, green/brass cart, rug, lamps, shelf-bay grammar and evening palette.
Scene/backdrop: medium zoom on the same cropped central aisle, panned slightly right from Image 1 so the same corridor arch, tall brass ladder, one lower stair rail and modular shelf bays are recognizable. The frame cuts through shelf bays on both side edges, the balcony continues beyond both sides, a staircase exits below the bottom, and upper galleries disappear above the top. Through the arch on the far right/back, an adjacent unseen zone is still visibly choked with untidy piles, proving unfinished world continuity.
Transformation: in the current East Gallery sector, the central walkway is now clear, several leaf and wave series stand neatly in ordered rows, lamps glow brighter, and the same cart rests near the shelf with only one book. But leave deliberate unsorted physical piles along the left edge and through the distant off-screen corridor; this is partial restoration, not completion. Keep one provisional starburst stack on the rug, showing the player's method persists.
Style/medium: polished hand-painted 2D game art with clean editorial silhouettes; flat side-on layered world with mild parallax only; no 3D, no isometric. Warm walnut, aged paper, forest green, oxblood, dusty blue, brass, honey lamp light. Systemic composable books from reusable spine shapes, widths, colors, textures, emblems and Roman numerals.
Composition/framing: portrait iPhone 2:3 full-screen world. Bold crop on all four edges; never fit the whole building or floor plan in the viewport. Current sector is clearer and brighter than the messy adjacent sectors, creating an immediate local before/after while preserving long-term scale.
UI: same restrained safe-area language as prior frames. Exact title "Quiet Stacks" and location "East Gallery". Small exact status line "Walkway restored". Keep the tiny vertical minimap in the same upper corner: the current viewport rectangle remains less than one tenth of the long multi-room plan; one small completed segment uses solid fill plus a checkmark, while numerous remaining segments use diagonal hatch plus small pile icons, so status is not color-only. Subtle edge chevrons at left, right, up and down imply pan continuity. Bottom has a small cart-focus button with exact count "1 / 5" and exact action copy "Continue exploring". No other panels.
Feedback: a modest white-gold check seal beside the newly ordered shelf plus gentle dust motes and a lamp bloom. No confetti, stars, fireworks or reward currency.
Text (verbatim): "Quiet Stacks", "East Gallery", "Walkway restored", "1 / 5", "Continue exploring"
Constraints: preserve spatial and visual continuity across all three reference frames; original IP; English only; complete iPhone screen; same single pannable/zoomable world; visible areas beyond the screen remain unfinished; no character; no timer; no coins; no lives; no ads; no scores; no magic; no 3D; no isometric; no map menu; no disconnected rooms; no generic goods-sort UI; no triple-match; no brand marks; no watermark. Keep text exact and readable.
Avoid: showing the whole library; dollhouse view; 100% completion; a spotless empty room; celebration screen; menu cards for zones; changing architecture or palette; copying any existing game.
```

## Inspection notes

- All four frames were visually inspected at original resolution after generation.
- The sequence preserves the same East Gallery identity, cart, walnut/brass materials, rug language, emblem families, and lighting.
- Frames 1 and 4 deliberately crop architecture at every edge and keep the viewport marker small relative to the minimap.
- Frame 2 keeps piles and cart in world space and shows capacity without turning them into a disconnected inventory screen.
- Frame 3 keeps the cart wheel and a provisional stack visible at the edges, preserving spatial orientation through the close zoom.
- Accessible state feedback combines symbols, Roman numerals, outlines, motion, wording, sound cue, and haptic ripple. Color is supplementary.
- No frame contains a timer, currency, lives, energy, ads, daily rewards, leaderboard, character, 3D scene, or full-building view.

## Approval gate

This set remains **unapproved**. The owner must explicitly approve the V3 direction, reject it, or request a focused adjustment. Until then, it must not be copied into `design/approved/`, treated as canonical visual specification, or used to authorize final UI or final-art implementation.
