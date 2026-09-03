#!/usr/bin/env python3
import requests

# Test a few URLs from different ranges
test_urls = [
    "https://opennana.com/awesome-prompt-gallery/images/575.jpeg",  # Successfully downloaded
    "https://opennana.com/awesome-prompt-gallery/images/522.jpeg",  # Successfully downloaded
    "https://opennana.com/awesome-prompt-gallery/images/521.jpeg",  # Failed
    "https://opennana.com/awesome-prompt-gallery/images/450.jpeg",  # Failed
    "https://opennana.com/awesome-prompt-gallery/images/400.jpeg",  # Failed
    "https://opennana.com/awesome-prompt-gallery/images/100.jpeg",  # Failed
    "https://opennana.com/awesome-prompt-gallery/images/1.jpeg",    # Failed
]

print("Testing URL accessibility:\n")
for url in test_urls:
    try:
        response = requests.head(url, timeout=10)
        print(f"✓ {url}")
        print(f"  Status: {response.status_code}")
        if 'content-length' in response.headers:
            print(f"  Size: {response.headers['content-length']} bytes")
    except requests.exceptions.Timeout:
        print(f"✗ {url}")
        print(f"  Error: Timeout")
    except Exception as e:
        print(f"✗ {url}")
        print(f"  Error: {type(e).__name__}: {str(e)}")
    print()
