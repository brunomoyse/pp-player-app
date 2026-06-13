#!/usr/bin/env python3
"""Split the flat PocketPair icon PNG into Icon Composer layers.

Source: the 1024px app icon (gold cards + black spade on a dark background).
Outputs (into Assets/):
  cards.png  - full card silhouette, original pixels, transparent elsewhere
  spade.png  - the spade only, transparent elsewhere
The dark background is dropped so Icon Composer's `fill` provides it.
"""
import numpy as np
from PIL import Image
from scipy import ndimage

SRC = "/Users/brunomoyse/Development/applications/PERSO/pocketpair/pp-player-app/ios/PocketPair/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png"
OUT = "/Users/brunomoyse/Development/applications/PERSO/pocketpair/pp-player-app/assets/PocketPair.icon/Assets"

img = Image.open(SRC).convert("RGB")
a = np.asarray(img).astype(np.int16)
R, G, B = a[..., 0], a[..., 1], a[..., 2]

# Gold = warm + bright: red leads, blue trails.
gold = (R > 110) & (R > B + 35) & (G > B + 10)

# Full card silhouette = gold region with internal holes (the spade) filled.
card = ndimage.binary_fill_holes(gold)
# Clean specks
card = ndimage.binary_opening(card, iterations=2)
card = ndimage.binary_fill_holes(card)

# Spade (+ seam) = dark pixels enclosed by the card.
dark_inside = card & ~gold
# Keep only the largest blob -> the spade (drops the thin inter-card seam).
lbl, n = ndimage.label(dark_inside)
if n:
    sizes = ndimage.sum(np.ones_like(lbl), lbl, range(1, n + 1))
    spade = lbl == (1 + int(np.argmax(sizes)))
    spade = ndimage.binary_closing(spade, iterations=2)
else:
    spade = np.zeros_like(card)

def soft_alpha(mask):
    """Binary mask -> anti-aliased 0..255 alpha."""
    al = ndimage.gaussian_filter(mask.astype(np.float32) * 255.0, sigma=0.8)
    return np.clip(al, 0, 255).astype(np.uint8)

def save(rgb_src, mask, path):
    out = np.zeros((*mask.shape, 4), dtype=np.uint8)
    out[..., :3] = rgb_src
    out[..., 3] = soft_alpha(mask)
    Image.fromarray(out, "RGBA").save(path)

rgb = np.asarray(img, dtype=np.uint8)
save(rgb, card, f"{OUT}/cards.png")
save(rgb, spade, f"{OUT}/spade.png")
print(f"card px: {card.sum()}  spade px: {spade.sum()}  blobs: {n}")
