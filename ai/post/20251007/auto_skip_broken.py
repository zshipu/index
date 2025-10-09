import subprocess
import re
import os

os.chdir("D:/app/zsp/zshipu-blog-gen/ai")

max_iterations = 50
skipped = []

for i in range(max_iterations):
    # Run Hugo and capture error
    result = subprocess.run(
        ["hugo", "server"],
        capture_output=True,
        text=True,
        timeout=3,
        encoding='utf-8',
        errors='ignore'
    )

    output = result.stderr + result.stdout

    # Look for YAML error
    match = re.search(r'"([^"]+\.md)[:"]\d+:\d+": failed to unmarshal YAML', output)

    if not match:
        print(f"\nNo more errors! Hugo is working.")
        print(f"\nTotal files skipped: {len(skipped)}")
        for f in skipped:
            print(f"  - {os.path.basename(f)}")
        break

    error_file = match.group(1)

    if not os.path.exists(error_file):
        print(f"File not found: {error_file}")
        break

    # Skip this file
    new_name = error_file + ".skip"
    os.rename(error_file, new_name)
    skipped.append(error_file)
    print(f"[{i+1}] Skipped: {os.path.basename(error_file)}")

else:
    print(f"\nReached max iterations ({max_iterations}). There may be more errors.")

print("\nFinal Hugo test:")
result = subprocess.run(["hugo", "server"], capture_output=True, text=True, timeout=3, encoding='utf-8', errors='ignore')
if "Web Server is available" in result.stdout or "Built in" in result.stdout:
    print("✓ Hugo is now working!")
else:
    print("✗ Hugo still has errors")
    print(result.stdout[:500])
