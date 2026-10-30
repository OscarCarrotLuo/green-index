---
name: "Green Transition Atlas"
description: "An immersive metropolitan atlas in dark green, silver glass and living geographic imagery."
colors:
  harmony-green: "#8bebaa"
  ink-green: "#090f0e"
  silver-ink: "#edf3f0"
  muted-sage: "#a9bdb3"
  fine-line: "#d5f2e21c"
  action-mint: "#bce4c5"
  action-ink: "#173720"
  round-action-mint: "#bfeacc"
  round-action-ink: "#173a25"
  satellite: "#e2e9e3"
  solar: "#f4cc75"
  buildings: "#b3bfdc"
  vegetation: "#a8dbaf"
typography:
  display:
    fontFamily: "Urbanist, sans-serif"
    fontSize: "clamp(54px, 5.3vw, 82px)"
    fontWeight: 430
    lineHeight: 1.02
    letterSpacing: "-.04em"
  city-display:
    fontFamily: "Urbanist, sans-serif"
    fontSize: "clamp(46px, 5vw, 72px)"
    fontWeight: 420
    lineHeight: 1.1
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Urbanist, sans-serif"
    fontSize: "31px"
    fontWeight: 450
    lineHeight: 1.2
    letterSpacing: "-.025em"
  title:
    fontFamily: "Urbanist, sans-serif"
    fontSize: "23px"
    fontWeight: 450
    letterSpacing: "-.025em"
  body:
    fontFamily: "Urbanist, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
  reading:
    fontFamily: "Urbanist, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "Urbanist, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  metric:
    fontFamily: "Urbanist, sans-serif"
    fontSize: "38px"
    fontWeight: 400
    lineHeight: 1.1
rounded:
  input: "12px"
  file: "13px"
  locator: "14px"
  panel: "16px"
  pill: "999px"
  circle: "50%"
spacing:
  tight: "8px"
  compact: "12px"
  small: "16px"
  control: "20px"
  panel: "24px"
  wide: "32px"
  page: "clamp(28px, 4.5vw, 80px)"
components:
  button-primary:
    backgroundColor: "{colors.action-mint}"
    textColor: "{colors.action-ink}"
    rounded: "{rounded.pill}"
    padding: "16px"
    width: "100%"
  button-glass:
    textColor: "{colors.silver-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "13px 19px"
  button-round:
    backgroundColor: "{colors.round-action-mint}"
    textColor: "{colors.round-action-ink}"
    rounded: "{rounded.circle}"
    width: "47px"
    height: "47px"
  navigation:
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "5px"
  search-input:
    rounded: "{rounded.input}"
    padding: "14px 16px"
  status-chip:
    rounded: "{rounded.pill}"
    padding: "12px 16px"
  glass-panel:
    textColor: "{colors.silver-ink}"
    rounded: "{rounded.panel}"
  layer-rail:
    rounded: "{rounded.pill}"
    padding: "7px"
  switch:
    width: "32px"
    height: "19px"
    padding: "3px"
  archive-file:
    rounded: "{rounded.file}"
    padding: "22px"
    width: "240px"
    height: "326px"
---

# Design System: Green Transition Atlas

## Overview

**Creative North Star: "A spatial atlas of living cities"**

The ClauseOS-inspired world pairs ink-black green with silver transparent glass, geometric Urbanist lettering and luminous green selection. Geographic imagery remains visible through and around the controls. The Green Transition Atlas identity and English interface carry across the national atlas, city maps and source drawers.

Depth comes from translucent material, fine lit rims and a physical archive rack. Active objects gain color and face the visitor; quiet controls use recessed pills and slender line icons. The interface supports an immersive desktop presentation while keeping labels, research status and keyboard controls explicit.

**Key Characteristics:**

- Ink-green ground, silver text and Harmony Green interaction cues.
- Transparent glass with directional light, soft ambient shadows and fine rims.
- Urbanist throughout, with light display weights and compact operational labels.
- A cyclic archive rack whose selected file turns toward the viewer.

## Colors

The palette combines a near-black green ground, cool silver text and pale green light. The frontmatter records the implemented color values; the descriptions below explain their roles.

### Primary

- **Harmony Green** marks keyboard focus, status dots and active interaction cues.
- **Action Mint / Action Ink** form the filled catalog-download action. The round map-entry action uses its own paired mint and dark-green tokens.

### Secondary

- **Solar** is the warm gold layer accent.
- **Buildings** is the pale blue-lavender layer accent.
- **Vegetation** is the leaf-green layer accent.

These semantic colors appear in layer icons, legends and geographic context. They are not a decorative multi-accent theme.

### Neutral

- **Ink Green** is the page background.
- **Silver Ink** is the main interface text.
- **Muted Sage** supports body copy and secondary information.
- **Fine Line** is the translucent divider color.
- **Satellite** is the neutral accent for the satellite lens.

**The Selection Rule.** Use Harmony Green and the green file material to identify interaction and selection; they do not certify environmental performance.

## Typography

**Display and body font:** Urbanist, with a sans-serif fallback. The local variable font supplies weights from 100 through 900 and uses swap loading.

Large headings use light intermediate weights and tight tracking. Operational text stays compact and sentence case. The frontmatter's display, city-display, headline, title, body, reading, label and metric roles preserve the actual hierarchy; they are distinct roles rather than a fabricated modular scale.

The atlas display emphasizes its final word with pale green. City titles are separate from the longer MSA name beneath them. Drawers use a larger reading heading (42px, weight 450, line height 1.08); supporting paragraphs use the reading role. Metric values use tabular numbers; units remain adjacent in smaller text. The archive's WebGL texture also uses Urbanist and reduces long city names to fit the card.

## Layout

Desktop is the commissioned device class; dedicated mobile design is deferred. The implementation includes a readable narrow-screen fallback without establishing a separate mobile design language.

A shared fluid page gutter aligns the header, atlas, archive dossier and city controls. The primary content limit is 1680px; the header has a 1800px limit. At wide desktop sizes the atlas uses a 30% / 70% text-to-map grid, and the archive spans the content width. The geographic map and archive are large surfaces with room around their controls.

The city map fills the viewport (100svh, minimum height 700px). Its lower insight surface has three columns (1.45fr / 1fr / .85fr), a height of 166px and a 38px bottom offset. The lens rail and map tools share a baseline 24px above that surface. The source drawer occupies the right edge at 530px wide, with a 16px outer inset and its own scrolling area.

At 1200px the layout tightens gaps and controls. At 1000px the atlas becomes a stacked composition, the dossier wraps its lens links to a second row, and the city insight surface becomes 174px tall. The WebGL archive is enabled from 761px; narrower layouts use the DOM archive. At 760px the gutter becomes 22px and the map insight content wraps to two columns. At 1600px and above the atlas and archive receive more vertical space. These are implemented breakpoints, not a claim that a dedicated mobile design has been completed.

## Elevation & Depth

Glass combines a directional translucent gradient, three inset rim highlights and an ambient shadow. The common surface uses blur (24px) and saturation (120%); the city insight bar uses blur (20px) and saturation (125%). The sidecar carries the exact gradient-bearing component snippets and shadow values, because the frontmatter schema does not model these treatments.

**The Material Rule.** Retain transparency, lit inset edges and soft shadows together when extending a glass control. The map remains perceptible behind it.

The archive uses one orthographic 3D scene. Transparent extruded files share a lean while their yaw opens toward the rack ends; the selected file moves forward, enlarges and faces the camera. Side files use silver transparent textures, while the selected texture gains a green gradient. This is structural depth rather than a drop-shadow substitute.

State transitions use the shared easing curve (cubic-bezier(.16, 1, .3, 1)). Most control changes take 0.2–0.35s; file transforms in the DOM fallback take 0.72s. The WebGL rack retains the previous layout, front-card position, camera framing and exponential settling curve (rate 13). Its desktop stage is 440px high, narrowing to 408px at 1000px. Reduced motion removes CSS animation and transitions, disables route transitions and makes the rack settle immediately.

## Shapes

The general glass panel is a softly rounded rectangle. Inputs, locator panels and archive files use the nearby, slightly tighter corner values recorded in the frontmatter. Navigation and lens controls use full pills, while single icon actions use circles.

Fine inset lines describe transparent edges. Vertical separators divide nearby information within a common material; controls are not enclosed in heavy outlines. Geographic markers use concentric circles, and the identity mark uses fine geometric linework.

## Components

### Buttons

The filled action is pale mint with dark text and a full pill shape. The catalog control is a glass pill with an icon, label and count. The round map-entry action uses a diagonal vector arrow and rotates on hover; the atlas exploration arrow moves down slightly on hover. These transforms are removed for reduced motion.

Interactive controls retain the shared focus ring (2px Harmony Green, 5px offset). Disabled buttons reduce opacity to .45. The filled download action has no separate hover treatment in the source; the sidecar preserves that behavior rather than inventing a variant.

### Navigation and lens rail

The main navigation sits in a recessed pill. Its active item gains a slightly brighter glass fill and inset highlight. Hover increases text brightness and adds a faint fill. The city lens rail uses the same pill language, a brighter selected segment and a semantic icon color. The appearance control sits at the end of the rail behind a fine separator.

### Inputs and switches

City search is an inset translucent field with a line icon, muted placeholder and bright entered text. The opacity control uses a native range input with a pale-green accent. The satellite switch is a small pill whose circular thumb translates horizontally; its on-state changes the track color. Focus remains visible through the common control rule.

### Status, locator and insight surfaces

Research status is a quiet glass pill with a green dot and an explicit label. The locator pairs city identity with an entry action. The lower insight panel groups the current lens, metric and study scope with thin vertical rules. Missing metrics remain an em dash accompanied by explanatory status text; color or elevation does not imply validation.

### Cyclic city archive

The selected plate displays the city, region, MSA code and metropolitan population. Both WebGL and DOM fallback presentations use the same population label and unit. All 20 cities remain in the continuous cyclic selection model. Dragging and horizontal wheel motion scrub the rack; release settles it. Left and right arrow keys move selection, Enter opens the selected city, and the bead rail supplies named direct selections.

The bead for the active city expands into a short green capsule; other beads remain small. Tooltips appear on hover or keyboard focus. The dossier below follows the same selected city and exposes its three lenses. The sidecar's archive specimen records the DOM fallback face; the full 3D composition and exponential settling remain in the application scene.

### Reading drawers

Source and methodology content use the same glass material, with a stronger dark-green gradient for sustained reading. The drawer traps focus, closes with Escape and restores the prior focus. Its heading begins directly with content. Search rows, research statuses and the catalog action retain the shared text and icon vocabulary.

### Geographic imagery

National geography is drawn from vector dots, state borders and anchored city callouts. Satellite maps and archive thumbnails are remote geographic imagery with source attribution. No product raster artwork is bundled; the local font and its license are shipped. Reference imagery informs the material language and is not a product asset.

## Do's and Don'ts

### Do:

- Do preserve the ink-green, silver-glass and Harmony Green world chosen from ClauseOS.
- Do retain Urbanist, outlined vector icons, visible keyboard focus and reduced-motion behavior.
- Do keep all 20 metropolitan areas reachable through the map, cyclic archive and searchable catalog.
- Do label population and research values by their actual meaning; retain pending research states.
- Do keep geographic imagery and provider attribution visible in the map experience.

### Don't:

- Don't turn the population ordering or selected green card into an implied green-performance ranking.
- Don't flatten the archive into a generic card grid or remove its drag, loop and front-facing selection behavior.
- Don't replace contextual or illustrative map layers with unsupported claims of measured research results.
- Don't ship the ClauseOS reference imagery as product artwork or hide the map's source attribution.
