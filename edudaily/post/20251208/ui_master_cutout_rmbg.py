from __future__ import annotations

"""
Professional UI/sprite-sheet background removal for flattened images with fake checkerboard backgrounds.

Core idea:
1. Use an AI alpha-matting model to preserve white UI cards, icons, text, shadows and small assets.
2. Use checkerboard-aware post-processing only to force obvious fake-background pixels to transparent.
3. Export QA composites on black/white/magenta/checker backgrounds so the cutout can be visually audited.

Install:
    pip install torch torchvision transformers kornia pillow opencv-python numpy

Run:
    python ui_master_cutout_rmbg.py input.png output.png --qa

For this kind of sprite sheet, pure color thresholding is not professional-grade because the fake
checkerboard background and white UI panels share nearly identical RGB values.
"""

from dataclasses import dataclass
from pathlib import Path
import argparse
import math
import sys
from typing import Iterable

import cv2
import numpy as np
from PIL import Image


@dataclass(frozen=True)
class Tile:
    x0: int
    y0: int
    x1: int
    y1: int


def make_tiles(width: int, height: int, tile_size: int, overlap: int) -> list[Tile]:
    if tile_size <= 0:
        raise ValueError("tile_size must be positive")
    if overlap < 0 or overlap >= tile_size:
        raise ValueError("overlap must be >= 0 and < tile_size")

    def starts(length: int) -> list[int]:
        if length <= tile_size:
            return [0]
        stride = tile_size - overlap
        out = [0]
        while out[-1] + tile_size < length:
            nxt = min(out[-1] + stride, length - tile_size)
            if nxt == out[-1]:
                break
            out.append(nxt)
        return out

    xs = starts(width)
    ys = starts(height)
    return [Tile(x, y, min(x + tile_size, width), min(y + tile_size, height)) for y in ys for x in xs]


def weight_window(h: int, w: int) -> np.ndarray:
    """Raised-cosine tile merge weights. Prevents visible seams between overlapping tiles."""
    if h <= 1 or w <= 1:
        return np.ones((h, w), dtype=np.float32)
    wy = np.hanning(h)
    wx = np.hanning(w)
    # Hanning is zero at borders; keep a floor so edge-only tiles still contribute.
    win = np.outer(np.maximum(wy, 0.08), np.maximum(wx, 0.08)).astype(np.float32)
    return win / win.max()


def load_rmbg_model(model_name: str, device: str):
    import torch
    from transformers import AutoModelForImageSegmentation

    model = AutoModelForImageSegmentation.from_pretrained(
        model_name,
        trust_remote_code=True,
    )
    model.eval().to(device)
    return model


def predict_alpha_tile(model, tile_rgb: Image.Image, device: str, input_size: int) -> Image.Image:
    """Predict one tile alpha as an L-mode PIL image, same size as tile_rgb."""
    import torch
    from torchvision import transforms

    original_size = tile_rgb.size

    transform_image = transforms.Compose([
        transforms.Resize((input_size, input_size), interpolation=transforms.InterpolationMode.BICUBIC),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    x = transform_image(tile_rgb).unsqueeze(0).to(device)
    with torch.no_grad():
        pred = model(x)[-1].sigmoid().detach().cpu()[0].squeeze(0).numpy()

    alpha = np.clip(pred * 255.0, 0, 255).astype(np.uint8)
    return Image.fromarray(alpha, mode="L").resize(original_size, Image.Resampling.BICUBIC)


def predict_alpha_tiled(
    image_rgb: Image.Image,
    model_name: str = "briaai/RMBG-2.0",
    device: str | None = None,
    tile_size: int = 1024,
    overlap: int = 128,
    input_size: int = 1024,
) -> np.ndarray:
    import torch

    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    model = load_rmbg_model(model_name, device)
    w, h = image_rgb.size
    tiles = make_tiles(w, h, tile_size=tile_size, overlap=overlap)

    acc = np.zeros((h, w), dtype=np.float32)
    weights = np.zeros((h, w), dtype=np.float32)

    for i, t in enumerate(tiles, start=1):
        crop = image_rgb.crop((t.x0, t.y0, t.x1, t.y1))
        alpha_tile = np.array(predict_alpha_tile(model, crop, device=device, input_size=input_size), dtype=np.float32)
        win = weight_window(t.y1 - t.y0, t.x1 - t.x0)
        acc[t.y0:t.y1, t.x0:t.x1] += alpha_tile * win
        weights[t.y0:t.y1, t.x0:t.x1] += win
        print(f"tile {i}/{len(tiles)} done", file=sys.stderr)

    alpha = acc / np.maximum(weights, 1e-6)
    return np.clip(alpha, 0, 255).astype(np.uint8)


def edge_connected(mask: np.ndarray) -> np.ndarray:
    """Keep only mask components connected to the image border."""
    n, labels = cv2.connectedComponents(mask.astype(np.uint8), connectivity=8)
    if n <= 1:
        return mask.astype(bool)
    border_ids = np.unique(np.concatenate([
        labels[0, :], labels[-1, :], labels[:, 0], labels[:, -1]
    ]))
    return np.isin(labels, border_ids) & mask


def fake_checkerboard_candidate(rgb: np.ndarray) -> np.ndarray:
    """
    Conservative fake-checkerboard detector.

    It intentionally detects only bright low-chroma pixels connected to the outer background.
    It is NOT trusted alone; it is used only where the AI mask is already low-confidence foreground.
    """
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    sat = hsv[:, :, 1]
    val = hsv[:, :, 2]
    mx = rgb.max(axis=2).astype(np.int16)
    mn = rgb.min(axis=2).astype(np.int16)
    chroma = mx - mn

    candidate = (val >= 218) & (sat <= 42) & (chroma <= 24)
    candidate = cv2.morphologyEx(candidate.astype(np.uint8), cv2.MORPH_OPEN, np.ones((2, 2), np.uint8)) > 0
    return edge_connected(candidate)


def refine_alpha(
    rgb: np.ndarray,
    alpha: np.ndarray,
    bg_force_threshold: int = 96,
    hard_low: int = 6,
    hard_high: int = 248,
    median_ksize: int = 3,
) -> np.ndarray:
    """
    Refine the AI alpha without destroying white UI surfaces.

    Important rule:
    - The checkerboard cleanup only forces alpha to 0 where the AI already says "probably background".
    - White panels/cards remain opaque if the model has recognized them as foreground.
    """
    out = alpha.astype(np.uint8).copy()

    checker_bg = fake_checkerboard_candidate(rgb)
    out[checker_bg & (out <= bg_force_threshold)] = 0

    if median_ksize and median_ksize >= 3:
        if median_ksize % 2 == 0:
            median_ksize += 1
        out = cv2.medianBlur(out, median_ksize)

    out[out <= hard_low] = 0
    out[out >= hard_high] = 255
    return out


def decontaminate_edges(rgb: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    """
    Remove checkerboard color contamination from semi-transparent edge pixels.

    This uses inpainting from nearby opaque foreground colors. It is deliberately limited to the
    semi-transparent edge band, so it does not repaint the whole sprite sheet.
    """
    out = rgb.copy()
    partial = ((alpha > 0) & (alpha < 245)).astype(np.uint8) * 255
    opaque = alpha >= 245

    # Avoid decontaminating broad soft shadows too aggressively: focus on a narrow edge band.
    if partial.any() and opaque.any():
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        partial = cv2.erode(partial, kernel, iterations=1)
        if partial.any():
            for c in range(3):
                out[:, :, c] = cv2.inpaint(out[:, :, c], partial, 3, cv2.INPAINT_TELEA)
    return out


def make_checker_bg(size: tuple[int, int], cell: int = 24) -> Image.Image:
    w, h = size
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    c0 = np.array([230, 230, 230], dtype=np.uint8)
    c1 = np.array([255, 255, 255], dtype=np.uint8)
    yy, xx = np.mgrid[0:h, 0:w]
    m = ((xx // cell + yy // cell) & 1).astype(bool)
    arr[~m] = c0
    arr[m] = c1
    return Image.fromarray(arr, "RGB").convert("RGBA")


def save_qa(output_png: str) -> None:
    im = Image.open(output_png).convert("RGBA")
    base = Path(output_png).with_suffix("")

    backgrounds = {
        "black": Image.new("RGBA", im.size, (0, 0, 0, 255)),
        "white": Image.new("RGBA", im.size, (255, 255, 255, 255)),
        "magenta": Image.new("RGBA", im.size, (255, 0, 255, 255)),
        "checker": make_checker_bg(im.size),
    }

    for name, bg in backgrounds.items():
        comp = bg.copy()
        comp.alpha_composite(im)
        comp.convert("RGB").save(f"{base}_qa_{name}.jpg", quality=95)

    im.getchannel("A").save(f"{base}_qa_alpha.png")


def cutout(
    input_path: str,
    output_path: str,
    model_name: str = "briaai/RMBG-2.0",
    device: str | None = None,
    tile_size: int = 1024,
    overlap: int = 128,
    input_size: int = 1024,
    no_decontaminate: bool = False,
    qa: bool = False,
) -> None:
    src = Image.open(input_path).convert("RGBA")
    rgb_pil = src.convert("RGB")
    rgb = np.array(rgb_pil)

    alpha = predict_alpha_tiled(
        rgb_pil,
        model_name=model_name,
        device=device,
        tile_size=tile_size,
        overlap=overlap,
        input_size=input_size,
    )

    alpha = refine_alpha(rgb, alpha)
    out_rgb = rgb if no_decontaminate else decontaminate_edges(rgb, alpha)

    # Respect source alpha if the image already had transparency.
    src_alpha = np.array(src.getchannel("A"), dtype=np.uint8)
    alpha = np.minimum(alpha, src_alpha)

    out = np.dstack([out_rgb, alpha]).astype(np.uint8)
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(out, "RGBA").save(output_path)

    if qa:
        save_qa(output_path)

    print(f"saved: {output_path}")
    if qa:
        print(f"qa files saved with prefix: {Path(output_path).with_suffix('')}_qa_*")


def main() -> None:
    parser = argparse.ArgumentParser(description="AI matte cutout for flattened UI sprite sheets with fake checkerboard backgrounds.")
    parser.add_argument("input", help="Input image path")
    parser.add_argument("output", help="Output transparent PNG path")
    parser.add_argument("--model", default="briaai/RMBG-2.0", help="Hugging Face model name or local model path")
    parser.add_argument("--device", default=None, choices=[None, "cpu", "cuda", "mps"], help="Force device; default auto")
    parser.add_argument("--tile-size", type=int, default=1024, help="Tile size for high-res sprite sheets")
    parser.add_argument("--overlap", type=int, default=128, help="Tile overlap")
    parser.add_argument("--input-size", type=int, default=1024, help="Model input size")
    parser.add_argument("--no-decontaminate", action="store_true", help="Disable edge RGB decontamination")
    parser.add_argument("--qa", action="store_true", help="Export black/white/magenta/checker/alpha QA files")
    args = parser.parse_args()

    cutout(
        input_path=args.input,
        output_path=args.output,
        model_name=args.model,
        device=args.device,
        tile_size=args.tile_size,
        overlap=args.overlap,
        input_size=args.input_size,
        no_decontaminate=args.no_decontaminate,
        qa=args.qa,
    )


if __name__ == "__main__":
    main()
