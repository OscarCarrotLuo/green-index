# Philadelphia research in the canonical frontend

The active frontend is `green-index`, served at `/green-index/`. The sibling `website` folder is a legacy implementation; it is not edited or served by this integration.

## Scope and visual contract

Extend the existing city workspace in Operate mode. Retain Claude's blue-charcoal ground, Urbanist typography, silver glass, green selection, floating geographic canvas, bottom lens rail and three-column insight surface. Detailed evidence opens in a non-modal glass side panel. Desktop is primary; narrow screens retain readable scrollable controls.

No approved visual comp was created: the incumbent implementation, `DESIGN.md`, `.impeccable/design.json` and `src/styles.css` are the visual authority. No homepage, carousel, national-map, ranking, global-CSS or design-system change is authorized. Existing app changes are limited to the Philadelphia branch in `src/Workspace.tsx` and Philadelphia-specific source/method content in `src/main.tsx`.

Quality bar: the city remains visible behind the controls; use the current type scale and glass tokens; preserve the original route structure and lens navigation; show source/date/denominator; make source switches, tract selection, evaluation, prediction gallery and downloads work under the deployment base path. Never turn population order or unavailable results into a green ranking.

## Connected evidence

- Vegetation: 384 2018 census tracts; official tree/grass-shrub/total coverage and four-class U-Net inference from 2017 NAIP. 1 m statistics, generalized XYZ display tiles, spatial holdout evaluation, six deterministic test examples, NDVI and Random Forest comparisons.
- Energy: 1,135 eligible disclosed properties, grouped by reported primary use. Tract/use EUI medians are suppressed below n = 5. This is not predicted land use, weather-normalized efficiency or citywide per-capita energy.
- Solar: two development-validation sites with provisional AI labels, image overlays and model comparison. No citywide prevalence or independent revised-model test result is implied.
- Study scope is Philadelphia city, not its full MSA. The results describe 2017–2018. No composite index is calculated.

The 1,490 public research files are copied byte-for-byte from the completed deliverable. Analysis, model checkpoints, source data and notebooks were not recomputed or modified. JSON/GeoJSON/CSV/image URLs are resolved through `import.meta.env.BASE_URL`, including image paths embedded in the historical summary JSON.

## Reproduction and verification

From this repository:

```sh
python3 scripts/sync-vegetation.py
pnpm build
pnpm test
pnpm dev
```

`sync-vegetation.py` reads completed `../outputs/vegetation_2d` artifacts and copies them into this repository directly; it does not retrain or write to the old frontend. The frozen energy/solar exports are already bundled in `public/data/philadelphia` and `public/research/philadelphia`.

Review evidence is in `.impeccable/review/philadelphia-integration/`. `before.json` records tracked-file hashes before this task; `data-validation.json` checks unchanged research bytes, permitted existing-file changes, research scope and HTTP base-path access. Review screenshots and final disposition are recorded after browser checks. This task does not commit, push or publish the site.

## Final verification · 2026-11-04

The bounded review disposition is **ship** for this local integration (`final-verification.json`). Initial persistence and visual-fidelity review passed; the sole F1 keyboard defect was resolved and the final verdict found no remaining blockers in that review scope.

- `data-validation.json` records a passing production build and all six existing tests passing. It confirms 1,490 byte-identical research assets, no research recomputation, and seven representative JSON, GeoJSON, image and tile URLs served under `/green-index/` in both development and local production preview.
- `production-browser.json` records working vegetation source switches, classified pixels, tree measure, tract 145 selection, Office EUI of 68.80, the `phl_02` solar reference image and a lens round trip, with no recorded browser errors. Chicago retains its pending contextual workspace; this is a representative other-city check, not an exhaustive browser test of all cities.
- `keyboard-validation.json` confirms that Escape and the close button both close research results and return focus to **Explore results**. Escape from either Data collection or Methodology closes that modal while preserving the open research panel.
- The nine reviewed captures are `desktop.png`, `desktop-results.png`, `model-evaluation.png`, `buildings.png`, `solar.png`, `user-1280.png`, `mobile.png`, `mobile-results.png` and `homepage.png`. They cover the desktop map and evidence panel, all research lenses, 1280 × 720 presentation view, narrow-screen fallback and incumbent homepage. `final-preview.png` is the additional final 1280 × 720 preview. Narrow captures verify the fallback, not a separately commissioned mobile design.

Final tracked-file hashes confirm that only `src/Workspace.tsx` and `src/main.tsx` changed among the original tracked files; the generic workspace body, homepage, carousel, national map, ranking, global stylesheet and design documents remain unchanged. New Philadelphia styles are scoped beneath `.phl-workspace`. Build, asset-serving and browser checks were local; no hosted deployment was verified, and no commit, push or publication was performed.

## Design-context comparison

Closeout compared `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, `src/styles.css`, all nine `src/philadelphia/` files, the two integration branches and the review evidence above. The implemented extension retains the current blue-charcoal/silver-glass material, Urbanist scale, map-first composition, lens rail and insight surface.

Pre-existing visual-documentation drift is recorded without repair: the sidecar still names `ink-green` and `muted-sage`, describes an ink-green ground and contains older green-tinted component specimens, while `DESIGN.md` and the current stylesheet use blue-charcoal and muted silver. `PRODUCT.md` retains its earlier pending-research context; this task-specific record documents the attached Philadelphia evidence, while a composite green index remains unavailable. These protected context files were not refreshed as part of this integration.

## Vegetation redesign · 2026-11-04

The Philadelphia workspace was reorganised around planning districts and one docked results panel.

- **Planning districts instead of tracts.** `scripts/build-districts.py` assigns each of the 384 tracts to the City Planning Commission district holding most of its area, then pools class area / observed land per district for the official and U-Net layers. District shapes are the dissolved member tracts, so each value describes exactly the area drawn. Citywide totals reproduce the published 43.53% (official) and 43.33% (U-Net). Six tracts have more than 10% of their area in a neighbouring district; the panel states this. Familiar place names come from the Azavea / OpenDataPhilly neighbourhood layer. Inputs and provenance: `data-sources/philadelphia/`. Outputs: `vegetation-2d/districts.geojson` and `districts.csv`.
- **One map, one panel.** `ResearchMap.tsx` replaces the two map components; switching lenses toggles layers and resets the camera instead of rebuilding the map. The summary bar, the floating control card and the "Explore results" launcher were removed; the panel is always open beside the map. `preserveDrawingBuffer` is off. Building tracts load only when the Buildings lens is opened.
- **Vegetation panel.** Measure (all / tree / grass-shrub) and map (official / U-Net / difference) switches; one headline value with district context; tabs for the district ranking, model check (district scatter, held-out IoU by method, U-Net confusion matrix) and held-out examples with an in-browser disagreement overlay.
- **Map.** Five quantile classes from the official district values, shared by the official and U-Net maps; a diverging U-Net − official map; an on-map legend; hover cards; one label per district. Selecting a district highlights it in place.
- **Pixel layer.** `scripts/vegetation-only-tiles.py` (run by `sync-vegetation.py`) makes other land and water transparent in the display tiles, leaving tree canopy and grass/shrub over the aerial image. Statistics never read these tiles. The pixel view opens on the selected district, or Center City.
- Buildings EUI remains tract-level: medians cannot be pooled from tract medians without property records.
