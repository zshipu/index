
import os
import time
import random
import requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configuration
IMG_TXT = Path("img.txt")
IMAGES_DIR = Path("images")
MAX_WORKERS = 5  # Number of concurrent downloads
TIMEOUT = 30     # Seconds

def setup_dir():
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

def get_urls():
    if not IMG_TXT.exists():
        print("img.txt not found!")
        return []
    with open(IMG_TXT, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip()]

def download_one(url):
    filename = url.split("/")[-1]
    if not filename:
        filename = f"unknown_{random.randint(1000,9999)}.jpg"
    
    dest = IMAGES_DIR / filename
    
    if dest.exists() and dest.stat().st_size > 0:
        return "SKIPPED", url
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        # Random delay to be polite
        time.sleep(random.uniform(0.1, 0.5))
        
        response = requests.get(url, headers=headers, stream=True, timeout=TIMEOUT)
        response.raise_for_status()
        
        with open(dest, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return "SUCCESS", url
    except Exception as e:
        return "FAILED", f"{url} ({str(e)})"

def main():
    setup_dir()
    urls = get_urls()
    total = len(urls)
    print(f"Found {total} URLs. Starting download with {MAX_WORKERS} threads...")
    print(f"Images will be saved to: {IMAGES_DIR.absolute()}")
    
    success = 0
    skipped = 0
    failed = 0
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_url = {executor.submit(download_one, url): url for url in urls}
        
        for i, future in enumerate(as_completed(future_to_url), 1):
            status, msg = future.result()
            
            if status == "SUCCESS":
                success += 1
                print(f"[{i}/{total}] ✓ Downloaded: {msg.split('/')[-1]}")
            elif status == "SKIPPED":
                skipped += 1
                print(f"[{i}/{total}] - Skipped (exists): {msg.split('/')[-1]}")
            else:
                failed += 1
                print(f"[{i}/{total}] ✗ Failed: {msg}")

    print("\n" + "="*30)
    print(f"Download Summary:")
    print(f"Total: {total}")
    print(f"Success: {success}")
    print(f"Skipped: {skipped}")
    print(f"Failed: {failed}")
    print(f"Location: {IMAGES_DIR.absolute()}")
    print("="*30)

if __name__ == "__main__":
    main()
