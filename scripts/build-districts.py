"""Group the 384 research tracts into Philadelphia's 18 planning districts.

Each 2018 tract is assigned to the district holding most of its area. District
coverage pools the tract areas (class m2 / observed land m2); it never averages
tract percentages. District shapes are the dissolved member tracts, so every
value describes exactly the area drawn on the map.

Run with a Python that has geopandas, from this repository:
    ~/.cache/philadelphia-pilot-venv/bin/python scripts/build-districts.py
"""
from pathlib import Path
import csv
import json

import geopandas as gpd
import pandas as pd
from shapely.geometry import Polygon
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parents[1]
VEG = ROOT / 'public/data/philadelphia/vegetation-2d'
SOURCES = ROOT / 'data-sources/philadelphia'
PROJECTED = 2272  # NAD83 / Pennsylvania South (ft)
SOURCES_META = ('official', 'model')
CLASSES = ('tree', 'low_vegetation')


# Place names help people recognise a district; parks, rivers and industrial
# zones are dropped, and Center City is the common name for the Central core.
NOT_PLACES = {'Riverfront', 'Industrial', 'Airport', 'Northeast Phila Airport', 'Wissahickon Park', 'Pennypack Park', 'East Park', 'West Park', 'Fairmount Park'}
COMMON_NAMES = {'CTR': ['Center City']}


def place_name(name):
    name = name.split(' - ')[0]
    for suffix in (', West', ', East', ', North', ', South', ', Old'):
        name = name.removesuffix(suffix)
    return name


def pct(part, whole):
    return None if not whole else round(100 * part / whole, 3)


def main():
    tracts = gpd.read_file(VEG / 'tracts.geojson')[['GEOID', 'NAME', 'geometry']].to_crs(PROJECTED)
    districts = gpd.read_file(SOURCES / 'planning_districts.geojson')[['abbrev', 'dist_name', 'geometry']].to_crs(PROJECTED)
    areas = {s: pd.read_csv(VEG / f'{s}_tracts.csv', dtype={'tract_geoid': str}).set_index('tract_geoid') for s in SOURCES_META}

    overlay = gpd.overlay(tracts, districts, how='intersection', keep_geom_type=True)
    overlay['share'] = overlay.area / overlay['GEOID'].map(tracts.set_index('GEOID').area)
    best = overlay.sort_values('share', ascending=False).drop_duplicates('GEOID').set_index('GEOID')
    assert len(best) == len(tracts), 'Every tract must fall in a planning district'
    tracts['district'] = tracts['GEOID'].map(best['abbrev'])
    tracts['share'] = tracts['GEOID'].map(best['share'])

    neighborhoods = gpd.read_file(SOURCES / 'neighborhoods.geojson')[['LISTNAME', 'geometry']].to_crs(PROJECTED)
    places = gpd.overlay(neighborhoods, districts, how='intersection', keep_geom_type=True)
    places['area'] = places.area

    rows, features = [], []
    shapes = tracts.dissolve(by='district', as_index=True)
    for abbrev, name in districts[['abbrev', 'dist_name']].itertuples(index=False):
        members = tracts.loc[tracts['district'] == abbrev, 'GEOID']
        row = {'id': abbrev, 'name': name, 'tracts': int(len(members))}
        for source in SOURCES_META:
            table = areas[source].loc[members]
            land = table['land_m2'].sum()
            row[f'{source}_land_km2'] = round(land / 1e6, 3)
            for cls in CLASSES:
                row[f'{source}_{cls}_pct'] = pct(table[f'{cls}_m2'].sum(), land)
            row[f'{source}_vegetation_pct'] = pct(table['tree_m2'].sum() + table['low_vegetation_m2'].sum(), land)
        for metric in ('vegetation', *CLASSES):
            row[f'difference_{metric}_pp'] = round(row[f'model_{metric}_pct'] - row[f'official_{metric}_pct'], 3)
        top = places[places['abbrev'] == abbrev].sort_values('area', ascending=False)
        names = COMMON_NAMES.get(abbrev, []) + [place_name(n) for n in top['LISTNAME'] if n not in NOT_PLACES]
        row['places'] = list(dict.fromkeys(names))[:3]
        rows.append(row)
        # Close hairline gaps between member tracts before simplifying for the web.
        # Seams between tracts leave slivers under 0.003 km2; no district has a real enclave.
        shape = shapes.loc[abbrev, 'geometry'].buffer(6).buffer(-6)
        shape = unary_union([Polygon(part.exterior) for part in getattr(shape, 'geoms', [shape])]).simplify(15, preserve_topology=True)
        largest = max(getattr(shape, 'geoms', [shape]), key=lambda part: part.area)
        label = gpd.GeoSeries([largest.representative_point()], crs=PROJECTED).to_crs(4326).iloc[0]
        geometry = gpd.GeoSeries([shape], crs=PROJECTED).to_crs(4326).iloc[0]
        features.append({'type': 'Feature', 'id': len(features), 'properties': {**row, 'places': ' · '.join(row['places']), 'label': [round(label.x, 5), round(label.y, 5)]}, 'geometry': json.loads(gpd.GeoSeries([geometry]).to_json(drop_id=True))['features'][0]['geometry']})

    for feature in features:
        geometry = feature['geometry']
        def rounded(coords):
            return [rounded(c) for c in coords] if isinstance(coords[0], list) else [round(coords[0], 5), round(coords[1], 5)]
        geometry['coordinates'] = rounded(geometry['coordinates'])

    citywide = {}
    for source in SOURCES_META:
        table = areas[source]
        land = table['land_m2'].sum()
        citywide[source] = {f'{cls}_pct': pct(table[f'{cls}_m2'].sum(), land) for cls in CLASSES}
        citywide[source]['vegetation_pct'] = pct(table['tree_m2'].sum() + table['low_vegetation_m2'].sum(), land)
    official, model = areas['official'], areas['model'].reindex(areas['official'].index)
    gap = 100 * ((model['tree_m2'] + model['low_vegetation_m2']) / model['land_m2'] - (official['tree_m2'] + official['low_vegetation_m2']) / official['land_m2'])
    metadata = {
        'tract_agreement': {'tracts': int(gap.notna().sum()), 'mean_abs_pp': round(float(gap.abs().mean()), 3), 'median_pp': round(float(gap.median()), 3), 'within_5pp_share': round(float((gap.abs() <= 5).mean()), 4)},
        'unit': 'Planning district, approximated by whole 2018 census tracts',
        'assignment': 'Each tract assigned to the planning district holding most of its area',
        'aggregation': 'Pooled class area / observed non-water land area across member tracts',
        'minimum_tract_share': round(float(tracts['share'].min()), 4),
        'tracts_below_90pct_share': int((tracts['share'] < .9).sum()),
        'citywide': citywide,
        'sources': ['City of Philadelphia Planning Districts (City Planning Commission)', 'Azavea / OpenDataPhilly neighborhoods (place names only)'],
    }
    (VEG / 'districts.geojson').write_text(json.dumps({'type': 'FeatureCollection', 'metadata': metadata, 'features': features}, separators=(',', ':')))
    with open(VEG / 'districts.csv', 'w', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=[k for k in rows[0] if k != 'places'] + ['places'])
        writer.writeheader()
        for row in rows:
            writer.writerow({**row, 'places': '; '.join(row['places'])})
    print(json.dumps(metadata, indent=2))
    for row in sorted(rows, key=lambda r: -r['official_vegetation_pct']):
        print(f"{row['id']:5} {row['name']:22} tracts {row['tracts']:3}  official {row['official_vegetation_pct']:6.2f}  model {row['model_vegetation_pct']:6.2f}  diff {row['difference_vegetation_pp']:+5.2f}  {' · '.join(row['places'])}")


if __name__ == '__main__':
    main()
