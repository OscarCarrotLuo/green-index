"""Copy completed analysis exports into the canonical green-index frontend; no training."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import sys
ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / 'outputs/vegetation_2d'
DEST = ROOT / 'public/data/philadelphia/vegetation-2d'
FILES = {'web_summary.json': 'summary.json', 'vegetation_2d_tracts.geojson': 'tracts.geojson', 'official_tracts.csv': 'official_tracts.csv', 'model_tracts.csv': 'model_tracts.csv', 'test_report.json': 'test_report.json', 'provenance.json': 'provenance.json'}
def main():
    for filename in FILES:
        if not (SOURCE / filename).is_file():
            raise FileNotFoundError(f'Missing completed analysis export: {SOURCE / filename}')
    for folder in ['gallery', 'tiles']:
        if not (SOURCE / folder).is_dir():
            raise FileNotFoundError(f'Missing completed analysis folder: {SOURCE / folder}')
    DEST.mkdir(parents=True, exist_ok=True)
    for source, target in FILES.items():
        shutil.copy2(SOURCE / source, DEST / target)
    for folder in ['gallery', 'tiles']:
        shutil.copytree(SOURCE / folder, DEST / folder, dirs_exist_ok=True)
    # Display tiles show vegetation only; see vegetation-only-tiles.py.
    subprocess.run([sys.executable, str(ROOT / 'scripts/vegetation-only-tiles.py')], check=True)
    report = {str(p.relative_to(DEST)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(DEST.rglob('*')) if p.is_file()}
    audit = ROOT / '.impeccable/review/philadelphia-integration'
    audit.mkdir(parents=True, exist_ok=True)
    (audit / 'vegetation-assets.json').write_text(json.dumps(report, indent=2))
    print(f'Synced {len(report)} completed vegetation assets to {DEST}')
if __name__ == '__main__':
    main()
