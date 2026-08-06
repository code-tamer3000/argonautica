#!/usr/bin/env python3
"""Перекраска сырых текстур (белое на чёрном) в палитру Арго.

Яркость исходника становится альфа-каналом, цвет — сплошной заливкой.
Читает design_system/ui_kits/Raw/**, пишет в tinted/{цвет}/{имя файла}.png.

Запуск:  python3 tint.py
"""

from pathlib import Path

from PIL import Image

PALETTE = {
    "balance": "#C29A48",
    "air": "#E9E2D4",
    "fire": "#B23A2E",
    "water": "#134E45",
    "earth": "#6E6A5E",
}

SUFFIXES = {".png", ".jpg", ".jpeg"}

HERE = Path(__file__).resolve().parent
SRC = HERE.parent / "Raw"
OUT = HERE / "tinted"


def hex_to_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def tint(image, rgb):
    """Сплошной цвет + альфа = яркость исходника."""
    alpha = image.convert("L")
    tinted = Image.new("RGBA", image.size, rgb + (255,))
    tinted.putalpha(alpha)
    return tinted


def main():
    if not SRC.is_dir():
        raise SystemExit(f"Нет папки с исходниками: {SRC}")

    sources = sorted(
        p for p in SRC.rglob("*") if p.is_file() and p.suffix.lower() in SUFFIXES
    )
    if not sources:
        raise SystemExit(f"В {SRC} не найдено изображений")

    colors = {name: hex_to_rgb(value) for name, value in PALETTE.items()}
    for name in colors:
        (OUT / name).mkdir(parents=True, exist_ok=True)

    written = set()
    for path in sources:
        with Image.open(path) as image:
            image.load()
            for name, rgb in colors.items():
                target = OUT / name / f"{path.stem}.png"
                if target in written:
                    print(f"! конфликт имён, перезапись: {target.relative_to(HERE)}")
                written.add(target)
                tint(image, rgb).save(target, "PNG", optimize=True)
        print(f"{path.relative_to(SRC)} -> {len(colors)} цв.")

    print(f"\nГотово: {len(sources)} исходников × {len(colors)} цветов "
          f"= {len(sources) * len(colors)} файлов в {OUT}")


if __name__ == "__main__":
    main()
