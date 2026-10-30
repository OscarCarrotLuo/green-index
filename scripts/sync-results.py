"""Copy validated pipeline output into the atlas without manufacturing results."""
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
source = ROOT.parent / 'outputs/index/msa_indices.json'
if not source.exists():
    raise SystemExit('No research export yet. Run the audited notebooks and build_index.py first. Existing website data was not changed.')
rows = json.loads(source.read_text())
if not isinstance(rows, list):
    raise SystemExit('Expected the pipeline JSON records array.')
required = {'scope_id', 'msa_code', 'year', 'scope_type', 'footprint_id', 'score_status', 'reference_id'}
seen = set()
for row in rows:
    if not isinstance(row, dict) or not required <= row.keys():
        raise SystemExit('A research row is missing scope, provenance or status fields.')
    key = str(row['scope_id'])
    if key in seen:
        raise SystemExit('Duplicate scope_id. Resolve it in the research pipeline.')
    seen.add(key)
    for field in ('solar_share', 'energy_ratio', 'vegetation_share', 'index_equal'):
        val = row.get(field)
        if val is not None and (not isinstance(val, (int, float)) or isinstance(val, bool) or not math.isfinite(val)):
            raise SystemExit(f'{field} must be finite numeric data or null.')
    if row.get('score_status') != 'conditional_pilot' and row.get('index_equal') is not None:
        raise SystemExit('An ineligible scope cannot carry a composite score.')
# Strict JSON preserves null. Build/deploy after synchronization.
(ROOT / 'public/data/msa_indices.json').write_text(json.dumps(rows, indent=2, allow_nan=False) + '\n')
print(f'Copied {len(rows)} research scopes; no scores recalculated.')
