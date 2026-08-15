#!/usr/bin/env python3
"""Generate OG images for social sharing preview."""
from PIL import Image, ImageDraw, ImageFont
import os

OUT = "/home/z/my-project/public/og"
os.makedirs(OUT, exist_ok=True)

W, H = 1200, 630

# Load fonts
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
font_title = ImageFont.truetype(FONT_BOLD, 72)
font_sub = ImageFont.truetype(FONT_REG, 32)
font_brand = ImageFont.truetype(FONT_BOLD, 48)

def create_og(filename, title, subtitle, accent_color=(14, 165, 233)):
    img = Image.new("RGB", (W, H), "#0f172a")
    draw = ImageDraw.Draw(img)
    
    # Gradient accent bar at top
    for x in range(W):
        r = int(accent_color[0] * (1 - x/W * 0.3))
        g = int(accent_color[1] * (1 - x/W * 0.3))
        b = int(accent_color[2] * (1 - x/W * 0.3))
        draw.line([(x, 0), (x, 8)], fill=(r, g, b))
    
    # Bottom accent line
    for x in range(W):
        r = int(accent_color[0] * (1 - x/W * 0.3))
        g = int(accent_color[1] * (1 - x/W * 0.3))
        b = int(accent_color[2] * (1 - x/W * 0.3))
        draw.line([(x, H-8), (x, H)], fill=(r, g, b))
    
    # NOSSY brand text
    brand = "NOSSY"
    bbox = draw.textbbox((0, 0), brand, font=font_brand)
    bw = bbox[2] - bbox[0]
    draw.text(((W - bw) // 2, 60), brand, fill=(56, 189, 248), font=font_brand)
    
    # Tagline
    tagline = "Seek and you shall find."
    bbox_t = draw.textbbox((0, 0), tagline, font=font_sub)
    tw = bbox_t[2] - bbox_t[0]
    draw.text(((W - tw) // 2, 120), tagline, fill=(148, 163, 184), font=font_sub)
    
    # Main title
    # Word wrap if needed
    words = title.split()
    lines = []
    current = ""
    for w in words:
        test = current + (" " if current else "") + w
        bbox = draw.textbbox((0, 0), test, font=font_title)
        if bbox[2] - bbox[0] > W - 160:
            lines.append(current)
            current = w
        else:
            current = test
    if current:
        lines.append(current)
    
    y_start = 220
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font_title)
        lw = bbox[2] - bbox[0]
        draw.text(((W - lw) // 2, y_start + i * 90), line, fill=(255, 255, 255), font=font_title)
    
    # Subtitle
    if subtitle:
        bbox_s = draw.textbbox((0, 0), subtitle, font=font_sub)
        sw = bbox_s[2] - bbox_s[0]
        sub_y = y_start + len(lines) * 90 + 30
        draw.text(((W - sw) // 2, sub_y), subtitle, fill=(148, 163, 184), font=font_sub)
    
    # Decorative circles
    draw.ellipse([W-200, H-200, W, H], fill=(30, 58, 138))
    draw.ellipse([W-150, H-150, W-20, H-20], fill=(14, 165, 233))
    
    img.save(os.path.join(OUT, filename), "PNG", optimize=True)
    print(f"  Created {filename} ({os.path.getsize(os.path.join(OUT, filename))} bytes)")

print("Generating OG images...")

# Default/generic OG image
create_og("og-default.png", "45,039+ Tech Jobs Worldwide", "Europe  -  Asia  -  United States  |  58 Countries  |  Free")

# Region-specific OG images
create_og("og-europa.png", "14,987+ Tech Jobs in Europe", "40 Countries  |  Software, Data, Cloud, AI  |  Free")
create_og("og-asia.png", "10,462+ Tech Jobs in Asia", "17 Countries  |  Software, Data, Cloud, AI  |  Free")
create_og("og-eua.png", "19,590+ Tech Jobs in USA", "All States  |  Software, Data, Cloud, AI  |  Free")

print("Done!")
