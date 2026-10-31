#!/usr/bin/env python3
"""Render public/favicon.svg into the bitmap icons that browsers without SVG
favicons (Safari) and phones use:

    public/favicon.ico            16, 32 and 48 px
    public/apple-touch-icon.png   180 px, square corners (iOS rounds them itself)

Run it again after changing favicon.svg. Needs rsvg-convert (brew install librsvg).
"""
import re
import struct
import subprocess
from pathlib import Path

PUBLIC = Path(__file__).resolve().parent.parent / "public"
SVG = (PUBLIC / "favicon.svg").read_text()


def png(svg, size):
    return subprocess.run(
        ["rsvg-convert", "-w", str(size), "-h", str(size)],
        input=svg.encode(), capture_output=True, check=True,
    ).stdout


def ico(images):
    """An .ico file holding PNG images (fine in every browser and in Windows)."""
    head = struct.pack("<HHH", 0, 1, len(images))
    offset = len(head) + 16 * len(images)
    entries, data = b"", b""
    for size, image in images:
        entries += struct.pack("<BBBBHHII", size % 256, size % 256, 0, 0, 1, 32,
                               len(image), offset + len(data))
        data += image
    return head + entries + data


(PUBLIC / "favicon.ico").write_bytes(ico([(s, png(SVG, s)) for s in (16, 32, 48)]))
# Square corners, and the lines shrunk a little to leave a margin at this size.
square = re.sub(r'\s+rx="[^"]*"', "", SVG, count=1)
square = re.sub(r"(<path [^>]*/>)", r'<g transform="translate(16 16) scale(.8) translate(-16 -16)">\1</g>',
                square, count=1)
(PUBLIC / "apple-touch-icon.png").write_bytes(png(square, 180))
print("wrote public/favicon.ico and public/apple-touch-icon.png")
