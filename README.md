# Green Index

An interactive Green Transition Atlas for the MUSA 6950 final project.

**Website:** https://oscarcarrotluo.github.io/green-index/

## Explore

- A dotted U.S. map with the 20 largest metropolitan statistical areas, selected by Census Vintage 2025 population estimates.
- A draggable 3D glass city archive with twenty direct-selection indicators and keyboard navigation.
- Satellite, rooftop solar preview, building footprints, and vegetation map views.
- A data catalog and methodology panel. Research scores remain pending until validated, comparable results are connected.

Population order is not a green-performance ranking. Map centers are navigation anchors, not MSA boundaries. Solar polygons are illustrative; satellite and OpenStreetMap layers provide geographic context.

## Local development

Requires Node.js 24 and pnpm 11.25.0.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open the printed local URL ending in `/green-index/`.

```sh
pnpm check
pnpm test
pnpm build
pnpm preview
```

The production output is `dist/`. Hash-based routes support direct city links such as `/green-index/#/city/miami/solar`. Internet access and WebGL are needed for satellite/vector maps and the 3D archive.

## GitHub Pages

Select **GitHub Actions** under repository **Settings → Pages**. The workflow builds and deploys the site on every push to `main`. The Vite base path is `/green-index/`; data requests use that same base path.

## Data and attribution

- Population: [U.S. Census Bureau, Vintage 2025 metropolitan estimates](https://www.census.gov/data/tables/time-series/demo/popest/2020s-total-metro-and-micro-statistical-areas.html). The derived catalog and provenance are in `public/data/top20-msas.json`.
- Satellite imagery: Esri World Imagery and its attributed providers.
- Contextual vector features: OpenStreetMap via OpenFreeMap.
- Manrope font: SIL Open Font License, included in `public/fonts/OFL.txt`.

No private research datasets, model weights, credentials, or hosting-account configuration are included.
