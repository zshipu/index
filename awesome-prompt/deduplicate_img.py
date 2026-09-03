
from pathlib import Path

img_path = Path("img.txt")
if img_path.exists():
    lines = img_path.read_text(encoding="utf-8").splitlines()
    unique_lines = []
    seen = set()
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if line not in seen:
            unique_lines.append(line)
            seen.add(line)
    
    img_path.write_text("\n".join(unique_lines) + "\n", encoding="utf-8")
    print(f"Original lines: {len(lines)}")
    print(f"Unique lines: {len(unique_lines)}")
    print(f"Removed: {len(lines) - len(unique_lines)}")
else:
    print("img.txt not found")
