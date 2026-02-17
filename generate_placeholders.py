#!/usr/bin/env python3
"""Generate elegant placeholder images for Officina Gemmologica."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math
import os
import random

BASEDIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(BASEDIR, "images")
BLOG_DIR = os.path.join(IMG_DIR, "blog")
GALLERY_DIR = os.path.join(IMG_DIR, "gallery")

os.makedirs(BLOG_DIR, exist_ok=True)
os.makedirs(GALLERY_DIR, exist_ok=True)

random.seed(42)


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def create_gradient(size, color1, color2, angle=135):
    w, h = size
    c1 = hex_to_rgb(color1)
    c2 = hex_to_rgb(color2)
    img = Image.new("RGB", size)
    rad = math.radians(angle)
    cos_a, sin_a = math.cos(rad), math.sin(rad)
    for y in range(h):
        for x in range(w):
            proj = (x * cos_a + y * sin_a)
            max_proj = abs(w * cos_a) + abs(h * sin_a)
            t = max(0, min(1, (proj + max_proj / 2) / max_proj))
            r = int(c1[0] + (c2[0] - c1[0]) * t)
            g = int(c1[1] + (c2[1] - c1[1]) * t)
            b = int(c1[2] + (c2[2] - c1[2]) * t)
            img.putpixel((x, y), (r, g, b))
    return img


def draw_diamond_shape(draw, cx, cy, size, color, outline_color):
    points = [
        (cx, cy - size),
        (cx + size * 0.7, cy),
        (cx, cy + size * 0.5),
        (cx - size * 0.7, cy),
    ]
    draw.polygon(points, fill=color, outline=outline_color)
    # facet lines
    draw.line([(cx, cy - size), (cx + size * 0.3, cy * 0.3 + cy * 0.7)], fill=outline_color, width=1)
    draw.line([(cx, cy - size), (cx - size * 0.3, cy * 0.3 + cy * 0.7)], fill=outline_color, width=1)


def draw_gem_facets(draw, cx, cy, radius, n_facets, color, outline):
    for i in range(n_facets):
        angle1 = 2 * math.pi * i / n_facets
        angle2 = 2 * math.pi * (i + 1) / n_facets
        x1 = cx + radius * math.cos(angle1)
        y1 = cy + radius * math.sin(angle1)
        x2 = cx + radius * math.cos(angle2)
        y2 = cy + radius * math.sin(angle2)
        points = [(cx, cy), (x1, y1), (x2, y2)]
        r, g, b = hex_to_rgb(color)
        variation = random.randint(-20, 20)
        fill = (max(0, min(255, r + variation)),
                max(0, min(255, g + variation)),
                max(0, min(255, b + variation)))
        draw.polygon(points, fill=fill, outline=hex_to_rgb(outline))


def add_sparkles(draw, w, h, count=15):
    for _ in range(count):
        x = random.randint(0, w - 1)
        y = random.randint(0, h - 1)
        size = random.randint(1, 3)
        alpha = random.randint(180, 255)
        draw.ellipse([x - size, y - size, x + size, y + size],
                     fill=(255, 255, 255))


def add_label(draw, w, h, text, font_size=16):
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", font_size)
    except Exception:
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (w - tw) // 2
    y = h - th - 20
    # shadow
    draw.text((x + 1, y + 1), text, fill=(0, 0, 0), font=font)
    draw.text((x, y), text, fill=(200, 180, 130), font=font)


def generate_gem_image(filepath, size, colors, label, n_facets=8, angle=135):
    w, h = size
    img = create_gradient(size, colors[0], colors[1], angle)
    draw = ImageDraw.Draw(img)
    cx, cy = w // 2, h // 2
    radius = min(w, h) // 3
    draw_gem_facets(draw, cx, cy, radius, n_facets, colors[2] if len(colors) > 2 else colors[1], colors[0])
    add_sparkles(draw, w, h, 20)
    add_label(draw, w, h, label)
    img = img.filter(ImageFilter.GaussianBlur(radius=1))
    img.save(filepath, "JPEG", quality=85)
    print(f"  Created: {os.path.relpath(filepath, BASEDIR)}")


def generate_rough_stone(filepath, size, colors, label):
    w, h = size
    img = create_gradient(size, colors[0], colors[1], 160)
    draw = ImageDraw.Draw(img)
    cx, cy = w // 2, h // 2
    # irregular rough shape
    points = []
    n = 12
    for i in range(n):
        angle = 2 * math.pi * i / n
        r = min(w, h) // 3 + random.randint(-30, 30)
        points.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    base_r, base_g, base_b = hex_to_rgb(colors[2] if len(colors) > 2 else colors[1])
    draw.polygon(points, fill=(base_r, base_g, base_b), outline=hex_to_rgb(colors[0]))
    # texture lines
    for _ in range(8):
        x1 = cx + random.randint(-60, 60)
        y1 = cy + random.randint(-60, 60)
        x2 = x1 + random.randint(-40, 40)
        y2 = y1 + random.randint(-40, 40)
        draw.line([(x1, y1), (x2, y2)], fill=(base_r - 20, base_g - 20, base_b - 20), width=1)
    add_label(draw, w, h, label)
    img = img.filter(ImageFilter.GaussianBlur(radius=1))
    img.save(filepath, "JPEG", quality=85)
    print(f"  Created: {os.path.relpath(filepath, BASEDIR)}")


def generate_jewelry_image(filepath, size, colors, label, shape="ring"):
    w, h = size
    img = create_gradient(size, colors[0], colors[1], 120)
    draw = ImageDraw.Draw(img)
    cx, cy = w // 2, h // 2
    if shape == "ring":
        # ring band
        outer_r = min(w, h) // 4
        inner_r = outer_r - 12
        draw.ellipse([cx - outer_r, cy - outer_r + 20, cx + outer_r, cy + outer_r + 20],
                     fill=hex_to_rgb("#c9a962"), outline=hex_to_rgb("#9a7b3c"))
        draw.ellipse([cx - inner_r, cy - inner_r + 20, cx + inner_r, cy + inner_r + 20],
                     fill=hex_to_rgb(colors[0]))
        # gem on top
        gem_r = 15
        gem_color = colors[2] if len(colors) > 2 else "#e74c3c"
        draw_gem_facets(draw, cx, cy - outer_r + 20, gem_r, 6, gem_color, "#ffffff")
    elif shape == "necklace":
        # chain curve
        for t in range(0, 360, 3):
            rad = math.radians(t)
            x = cx + int(min(w, h) * 0.35 * math.cos(rad))
            y = cy + int(min(w, h) * 0.25 * math.sin(rad)) - 20
            draw.ellipse([x - 2, y - 2, x + 2, y + 2], fill=hex_to_rgb("#c9a962"))
        # pendant
        gem_color = colors[2] if len(colors) > 2 else "#2980b9"
        draw_gem_facets(draw, cx, cy + min(w, h) // 4 - 20, 20, 6, gem_color, "#c9a962")
    elif shape == "earring":
        for offset in [-50, 50]:
            x = cx + offset
            draw.line([(x, cy - 40), (x, cy + 10)], fill=hex_to_rgb("#c9a962"), width=2)
            gem_color = colors[2] if len(colors) > 2 else "#8e44ad"
            draw_gem_facets(draw, x, cy + 25, 12, 6, gem_color, "#c9a962")
    add_sparkles(draw, w, h, 10)
    add_label(draw, w, h, label)
    img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
    img.save(filepath, "JPEG", quality=85)
    print(f"  Created: {os.path.relpath(filepath, BASEDIR)}")


# Color palettes
RUBY = ["#1a0a0a", "#3d0c0c", "#c0392b"]
SAPPHIRE = ["#0a0a2e", "#1a1a5e", "#2980b9"]
EMERALD = ["#0a1a0a", "#0c3d1a", "#27ae60"]
AMETHYST = ["#1a0a2e", "#3d0c5e", "#8e44ad"]
GOLD = ["#1a1a0a", "#3d3d0c", "#c9a962"]
DIAMOND = ["#1a1a1a", "#3d3d3d", "#bdc3c7"]
TOPAZ = ["#1a150a", "#3d2e0c", "#e67e22"]
TORMALINE = ["#1a0a1a", "#3d1a3d", "#e91e9c"]
OPAL = ["#0a1a1a", "#1a3d3d", "#1abc9c"]
PEARL = ["#1a1a1a", "#2d2d2d", "#ecf0f1"]

print("=== Generating placeholder images ===\n")

# --- MAIN PAGE ---
print("[Homepage]")
generate_gem_image(
    os.path.join(IMG_DIR, "about-preview.jpg"),
    (800, 500), AMETHYST, "Officina Gemmologica", n_facets=8)

generate_gem_image(
    os.path.join(IMG_DIR, "gallery-1.jpg"),
    (600, 600), RUBY, "Rubino", n_facets=6)
generate_gem_image(
    os.path.join(IMG_DIR, "gallery-2.jpg"),
    (600, 600), SAPPHIRE, "Zaffiro", n_facets=8)
generate_gem_image(
    os.path.join(IMG_DIR, "gallery-3.jpg"),
    (600, 600), EMERALD, "Smeraldo", n_facets=6)

# Before/After
print("\n[Before/After]")
generate_rough_stone(
    os.path.join(IMG_DIR, "before-1.jpg"),
    (600, 400), RUBY, "Rubino Grezzo")
generate_gem_image(
    os.path.join(IMG_DIR, "after-1.jpg"),
    (600, 400), RUBY, "Rubino Tagliato", n_facets=8)

generate_rough_stone(
    os.path.join(IMG_DIR, "before-2.jpg"),
    (600, 400), SAPPHIRE, "Zaffiro Grezzo")
generate_gem_image(
    os.path.join(IMG_DIR, "after-2.jpg"),
    (600, 400), SAPPHIRE, "Zaffiro Tagliato", n_facets=8)

generate_rough_stone(
    os.path.join(IMG_DIR, "before-3.jpg"),
    (600, 400), EMERALD, "Smeraldo Grezzo")
generate_gem_image(
    os.path.join(IMG_DIR, "after-3.jpg"),
    (600, 400), EMERALD, "Smeraldo Tagliato", n_facets=6)

# Instagram (reuse 2 styles)
print("\n[Instagram]")
insta_configs = [
    (RUBY, "Rubino", "ring"),
    (SAPPHIRE, "Zaffiro", "necklace"),
    (EMERALD, "Smeraldo", "ring"),
    (AMETHYST, "Ametista", "earring"),
    (GOLD, "Creazione Oro", "necklace"),
    (DIAMOND, "Diamante", "ring"),
]
for i, (colors, label, shape) in enumerate(insta_configs, 1):
    generate_jewelry_image(
        os.path.join(IMG_DIR, f"insta-{i}.jpg"),
        (400, 400), colors, label, shape)

# --- CHI SIAMO ---
print("\n[Chi Siamo]")
generate_gem_image(
    os.path.join(IMG_DIR, "chi-siamo-1.jpg"),
    (800, 500), GOLD, "Gemme Preziose", n_facets=10, angle=160)
generate_gem_image(
    os.path.join(IMG_DIR, "chi-siamo-2.jpg"),
    (800, 500), DIAMOND, "Strumenti di Precisione", n_facets=12, angle=100)

# --- SERVIZI ---
print("\n[Servizi]")
generate_gem_image(
    os.path.join(IMG_DIR, "servizio-taglio.jpg"),
    (800, 500), RUBY, "Taglio Gemme", n_facets=8)
generate_gem_image(
    os.path.join(IMG_DIR, "servizio-consulenza.jpg"),
    (800, 500), SAPPHIRE, "Consulenza Gemmologica", n_facets=6)
generate_jewelry_image(
    os.path.join(IMG_DIR, "servizio-progettazione.jpg"),
    (800, 500), GOLD, "Progettazione Gioielli", "ring")
generate_rough_stone(
    os.path.join(IMG_DIR, "servizio-ricerca.jpg"),
    (800, 500), EMERALD, "Ricerca Pietre")
generate_jewelry_image(
    os.path.join(IMG_DIR, "servizio-restauro.jpg"),
    (800, 500), PEARL, "Restauro Gioielli", "necklace")
generate_gem_image(
    os.path.join(IMG_DIR, "servizio-formazione.jpg"),
    (800, 500), AMETHYST, "Formazione Gemmologica", n_facets=10)

# --- BLOG ---
print("\n[Blog]")
generate_gem_image(
    os.path.join(BLOG_DIR, "scegliere-pietra.jpg"),
    (800, 450), SAPPHIRE, "Come Scegliere la Pietra Giusta", n_facets=8)
generate_gem_image(
    os.path.join(BLOG_DIR, "taglio-mano.jpg"),
    (800, 450), RUBY, "L'Arte del Taglio a Mano", n_facets=6)
generate_rough_stone(
    os.path.join(BLOG_DIR, "significato-pietre.jpg"),
    (800, 450), AMETHYST, "Il Significato delle Pietre")
generate_gem_image(
    os.path.join(BLOG_DIR, "tendenze-2024.jpg"),
    (800, 450), EMERALD, "Tendenze Gemme 2024", n_facets=10)

# --- GALLERY (just a few samples) ---
print("\n[Gallery - campioni]")
gallery_items = [
    ("gemma-rubino.jpg", RUBY, "Rubino Birmano", 8),
    ("zaffiro-ceylon.jpg", SAPPHIRE, "Zaffiro Ceylon", 8),
    ("ametista.jpg", AMETHYST, "Ametista Brasiliana", 6),
    ("acquamarina.jpg", OPAL, "Acquamarina", 8),
    ("opale-nero.jpg", ["#0a0a0a", "#1a1a2e", "#1a1a3d"], "Opale Nero", 10),
    ("anello-smeraldo.jpg", None, None, 0),
    ("anello-fidanzamento.jpg", None, None, 0),
    ("anello-tanzanite.jpg", None, None, 0),
    ("collana-perle.jpg", None, None, 0),
    ("pendente-tormalina.jpg", None, None, 0),
    ("orecchini-diamanti.jpg", None, None, 0),
    ("spilla-vintage.jpg", None, None, 0),
]

for fname, colors, label, facets in gallery_items:
    fpath = os.path.join(GALLERY_DIR, fname)
    if colors and label:
        generate_gem_image(fpath, (600, 600), colors, label, n_facets=facets)
    else:
        # Jewelry items
        if "anello" in fname or "fidanzamento" in fname:
            c = EMERALD if "smeraldo" in fname else (SAPPHIRE if "tanzanite" in fname else DIAMOND)
            l = fname.replace(".jpg", "").replace("-", " ").title()
            generate_jewelry_image(fpath, (600, 600), c, l, "ring")
        elif "collana" in fname or "pendente" in fname:
            c = PEARL if "perle" in fname else TORMALINE
            l = fname.replace(".jpg", "").replace("-", " ").title()
            generate_jewelry_image(fpath, (600, 600), c, l, "necklace")
        elif "orecchini" in fname:
            generate_jewelry_image(fpath, (600, 600), DIAMOND, "Orecchini Diamanti", "earring")
        elif "spilla" in fname:
            generate_jewelry_image(fpath, (600, 600), GOLD, "Spilla Vintage", "necklace")

print(f"\n=== Done! ===")
print(f"Total images created: check with ls -la images/")
