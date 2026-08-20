from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
SIZE = 256


def rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((12, 12, size - 12, size - 12), radius=radius, fill=255)
    return mask


def create_icon() -> Image.Image:
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    background = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    pixels = background.load()
    for y in range(SIZE):
        ratio = y / (SIZE - 1)
        color = (
            round(234 + (207 - 234) * ratio),
            round(245 + (230 - 245) * ratio),
            255,
            255,
        )
        for x in range(SIZE):
            pixels[x, y] = color
    canvas.alpha_composite(Image.composite(background, Image.new("RGBA", (SIZE, SIZE)), rounded_mask(SIZE, 56)))

    draw = ImageDraw.Draw(canvas, "RGBA")
    eye = [(52, 129), (76, 98), (101, 84), (128, 84), (155, 84), (180, 98), (204, 129),
           (180, 159), (155, 173), (128, 173), (101, 173), (76, 159)]
    draw.polygon(eye, fill=(255, 255, 255, 150))
    draw.line(eye + [eye[0]], fill=(42, 125, 221, 230), width=8, joint="curve")
    draw.arc((71, 111, 185, 166), start=198, end=342, fill=(42, 125, 221, 200), width=7)
    draw.ellipse((109, 97, 147, 135), outline=(91, 165, 245, 70), width=5)
    draw.ellipse((118, 106, 138, 126), fill=(23, 104, 206, 255))
    return canvas


if __name__ == "__main__":
    ASSETS.mkdir(parents=True, exist_ok=True)
    icon = create_icon()
    icon.save(ASSETS / "icon.png", format="PNG", optimize=True)
    icon.save(
        ASSETS / "icon.ico",
        format="ICO",
        sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )
    print("Generated assets/icon.png and assets/icon.ico")
