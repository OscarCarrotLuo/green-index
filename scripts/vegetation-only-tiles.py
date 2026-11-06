"""Make the display tiles show vegetation only.

The U-Net display tiles paint four classes. For the map, other land and water
become transparent so the aerial image shows through; tree canopy and
grass/shrub keep their colours. Display only: statistics never read these tiles.
Idempotent, and run by sync-vegetation.py after each copy.
"""
from pathlib import Path

import numpy as np
from PIL import Image

TILES = Path(__file__).resolve().parents[1] / 'public/data/philadelphia/vegetation-2d/tiles'
HIDDEN = [(116, 122, 118), (111, 158, 184)]  # other land, water


def main():
    changed = 0
    for path in sorted(TILES.rglob('*.png')):
        pixels = np.array(Image.open(path).convert('RGBA'))
        mask = np.zeros(pixels.shape[:2], bool)
        for colour in HIDDEN:
            mask |= (pixels[..., :3] == colour).all(axis=-1) & (pixels[..., 3] > 0)
        if mask.any():
            pixels[mask] = 0
            Image.fromarray(pixels).save(path, optimize=True)
            changed += 1
    print(f'Vegetation-only display tiles: {changed} updated under {TILES}')


if __name__ == '__main__':
    main()
