"""Draws og.png (1200x630), the link-preview image: the headline on the dot grid.
Usage: python3 scripts/og.py <BricolageGrotesque[opsz,wdth,wght].ttf>
The font comes from github.com/google/fonts (ofl/bricolagegrotesque)."""
import math
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
BG, FG, MUT = (9, 9, 10), (243, 241, 236), (141, 139, 133)
font_path = sys.argv[1]


def font(size, weight):
    f = ImageFont.truetype(font_path, size)
    f.set_variation_by_axes([min(96, size), weight, 100])
    return f


img = Image.new('RGB', (W, H), BG)

# A soft spotlight, like the one that follows the cursor on the site.
glow = Image.new('L', (W, H), 0)
ImageDraw.Draw(glow).ellipse((620, 40, 1180, 600), fill=34)
img = Image.composite(Image.new('RGB', (W, H), FG), img, glow.filter(ImageFilter.GaussianBlur(120)))

# Dot grid, brighter and slightly pushed outward near the spotlight.
d = ImageDraw.Draw(img)
S, cx, cy, R = 34, 900, 320, 260
for y in range(S // 2, H, S):
    for x in range(S // 2, W, S):
        dx, dy = x - cx, y - cy
        dist = math.hypot(dx, dy)
        k = max(0.0, 1 - dist / R) ** 2
        px, py = (x + dx / dist * k * 6, y + dy / dist * k * 6) if dist else (x, y)
        a = 0.07 + k * 0.6
        c = tuple(int(BG[i] + (FG[i] - BG[i]) * a) for i in range(3))
        r = 1 + k * 1.4
        d.rectangle((px - r / 2, py - r / 2, px + r / 2, py + r / 2), fill=c)

title, by = font(168, 500), font(40, 500)
d.text((W / 2, 290), 'Side quests.', font=title, fill=FG, anchor='mm')
d.text((W / 2, 420), 'by: Ishan Malu', font=by, fill=MUT, anchor='mm')
d.text((W / 2, 560), 'ishanmalu.dev', font=font(24, 500), fill=(74, 73, 69), anchor='mm')

img.save('og.png', optimize=True)
print('wrote og.png', img.size)
