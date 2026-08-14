#!/usr/bin/env python3
"""Generate NOSSY text images at various sizes to prevent browser translation."""

from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = "/home/z/my-project/public/brand"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Try multiple font paths
FONT_PATHS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
]

font = None
for fp in FONT_PATHS:
    if os.path.exists(fp):
        font = ImageFont.truetype(fp, size=48)
        print(f"Using font: {fp}")
        break

if not font:
    print("ERROR: No bold font found!")
    exit(1)

def create_nossy_image(text, width, height, font_size, color=(15, 23, 42), bg_transparent=True):
    """Create a NOSSY text image."""
    fnt = ImageFont.truetype(font.path, font_size)
    
    # Create image with transparency
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0) if bg_transparent else (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Get text bounding box to center it
    bbox = draw.textbbox((0, 0), text, font=fnt)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (width - tw) // 2
    y = (height - th) // 2 - bbox[1]
    
    draw.text((x, y), text, font=fnt, fill=color + (255,) if len(color) == 3 else color)
    return img

def create_nossy_white(width, height, font_size):
    """NOSSY text in white (for dark backgrounds like footer)."""
    return create_nossy_image("NOSSY", width, height, font_size, color=(255, 255, 255))

def create_nossy_dark(width, height, font_size):
    """NOSSY text in dark (for light backgrounds like header)."""
    return create_nossy_image("NOSSY", width, height, font_size, color=(15, 23, 42))

def create_nossy_sky(width, height, font_size):
    """NOSSY text in sky blue (for hover states)."""
    return create_nossy_image("NOSSY", width, height, font_size, color=(14, 165, 233))

# Generate images at multiple sizes
configs = [
    # (name, w, h, font_size)
    ("nossy-dark-20", 80, 24, 20),
    ("nossy-dark-24", 96, 28, 24),
    ("nossy-dark-28", 112, 32, 28),
    ("nossy-dark-32", 128, 36, 32),
    ("nossy-dark-36", 140, 40, 36),
    ("nossy-dark-40", 160, 44, 40),
    ("nossy-dark-48", 190, 52, 48),
    ("nossy-white-20", 80, 24, 20),
    ("nossy-white-24", 96, 28, 24),
    ("nossy-white-28", 112, 32, 28),
    ("nossy-white-32", 128, 36, 32),
    ("nossy-white-36", 140, 40, 36),
    ("nossy-white-40", 160, 44, 40),
    ("nossy-white-48", 190, 52, 48),
    ("nossy-sky-36", 140, 40, 36),
    ("nossy-sky-40", 160, 44, 40),
]

for name, w, h, fs in configs:
    if 'white' in name:
        img = create_nossy_white(w, h, fs)
    elif 'sky' in name:
        img = create_nossy_sky(w, h, fs)
    else:
        img = create_nossy_dark(w, h, fs)
    
    path = os.path.join(OUTPUT_DIR, f"{name}.png")
    img.save(path, 'PNG')
    print(f"Created: {path} ({w}x{h})")

print("\nAll NOSSY text images generated successfully!")
