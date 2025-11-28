#!/usr/bin/env python3
"""
下载 `img.txt` 中的图片到 `images` 目录，跳过已存在的文件。
使用：在包含 `img.txt` 的目录运行 `python download_images.py`。
"""

import os
import sys
import hashlib
import re
from pathlib import Path
from urllib.parse import urlparse

BASE_DIR = Path(__file__).parent
IMG_TXT = BASE_DIR / "img.txt"
IMAGES_DIR = BASE_DIR / "images"


def sanitize_filename(name: str) -> str:
    name = re.sub(r"[^A-Za-z0-9._-]", "_", name)
    return name


def filename_from_url(url: str) -> str:
    p = urlparse(url)
    name = os.path.basename(p.path)
    if not name:
        # fallback to short hash if URL has no path basename
        name = hashlib.sha1(url.encode()).hexdigest()[:12]
    name = sanitize_filename(name)
    return name


def download_with_requests(url: str, dest: Path) -> bool:
    import time
    import requests
    attempts = 3
    for attempt in range(1, attempts + 1):
        try:
            with requests.get(url, stream=True, timeout=20) as r:
                r.raise_for_status()
                with open(dest, "wb") as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
            return True
        except Exception:
            if attempt < attempts:
                time.sleep(1 * attempt)
                continue
            return False


def download_with_urllib(url: str, dest: Path) -> bool:
    import time
    from urllib import request as ureq
    from urllib.error import URLError, HTTPError

    attempts = 3
    for attempt in range(1, attempts + 1):
        try:
            req = ureq.Request(url, headers={"User-Agent": "python-urllib/3"})
            with ureq.urlopen(req, timeout=20) as resp:
                with open(dest, "wb") as f:
                    while True:
                        chunk = resp.read(8192)
                        if not chunk:
                            break
                        f.write(chunk)
            return True
        except (HTTPError, URLError, TimeoutError, OSError):
            if attempt < attempts:
                time.sleep(1 * attempt)
                continue
            return False


def download(url: str, dest: Path) -> bool:
    # try requests first (better for streaming), fallback to urllib
    try:
        import requests  # type: ignore
    except Exception:
        return download_with_urllib(url, dest)
    else:
        ok = download_with_requests(url, dest)
        if not ok:
            # fallback if requests failed for some reason
            return download_with_urllib(url, dest)
        return True


def main() -> int:
    if not IMG_TXT.exists():
        print(f"`{IMG_TXT}` not found. 请把 `img.txt` 放在同级目录后重试。")
        return 1

    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    seen_urls = set()
    count_total = 0
    count_downloaded = 0
    count_skipped = 0
    count_failed = 0

    try:
        with IMG_TXT.open("r", encoding="utf-8") as fh:
            for raw in fh:
                url = raw.strip()
            if not url:
                continue
            if url.startswith("#"):
                continue
            count_total += 1
            if url in seen_urls:
                print(f"跳过重复 URL: {url}")
                count_skipped += 1
                continue
            seen_urls.add(url)

            fname = filename_from_url(url)
            dest = IMAGES_DIR / fname

            if dest.exists() and dest.stat().st_size > 0:
                print(f"已存在，跳过: {dest.name}")
                count_skipped += 1
                continue

            print(f"下载: {url} -> {dest.name}")
            ok = download(url, dest)
            if ok:
                count_downloaded += 1
            else:
                print(f"下载失败: {url}")
                count_failed += 1
    except KeyboardInterrupt:
        print('\n已手动中断。正在退出...')

    print("\n完成。总结:")
    print(f"  总行数(含空/注释): {count_total}")
    print(f"  已下载: {count_downloaded}")
    print(f"  已跳过(重复或已存在): {count_skipped}")
    print(f"  下载失败: {count_failed}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
