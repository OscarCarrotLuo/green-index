# Product

<!-- impeccable:product-schema 1 -->

## Platform
web

## Users
A Fall 2026 MUSA 6950 final-project presentation, explored by the presenter and its academic audience.

## Product Purpose
Green Transition Atlas connects a national overview of the 20 largest U.S. metropolitan areas with city-level solar, building, and vegetation maps and a conditional Green Transition Index.

## Operating Context
English desktop presentation website, published on GitHub Pages under /green-index/. Mobile-specific design is deferred by the user. The user selected an immersive experience with 3D cards, maps, and transitions.

## Capabilities and Constraints
Preserve all 20 MSA entries, map links, deep links, the city catalog download, source and methodology panels, map controls, and data-loading contracts. Missing research values remain pending; population order must never become a green-index ranking. Solar polygons are illustrative; buildings and vegetation are geographic context until validated results are attached.

## Brand Commitments
User explicitly requests Rondesignlab's ClauseOS as the redesign reference. Retain the Green Transition Atlas identity and English interface. Cards must be draggable, loop across all cities, and turn the selected card toward the viewer.

## Evidence on Hand
src/data.ts and public/data contain the Census Vintage 2025 catalog and pending research records. src/CityMap.tsx supplies contextual map layers. Official design reference: https://rondesignlab.com/cases/clause-os-compliance-management-saas . No validated research scores currently supplied.

## Product Principles
- Make geographic exploration the primary experience.
- Let map and archive selection share one city state.
- Preserve honest distinctions between context, illustration, and validated results.
- Keep interaction usable with keyboard and reduced motion.
