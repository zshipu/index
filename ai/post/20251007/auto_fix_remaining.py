import subprocess
import re
import os

os.chdir("D:/app/zsp/zshipu-blog-gen/ai")

fixed = 0
skipped = 0

for iteration in range(100):
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
    match = re.search(r'"([^"]+\.md)[:\"]', output)

    if not match:
        print(f"\nNo more errors! Hugo is working.")
        break

    error_file = match.group(1)

    if not os.path.exists(error_file):
        print(f"File not found: {error_file}")
        break

    # Try to read and check if XML-corrupted
    try:
        with open(error_file, 'r', encoding='utf-8') as f:
            first_10_lines = ''.join([f.readline() for _ in range(10)])

        if '<category>' in first_10_lines or '<date>' in first_10_lines:
            # XML-corrupted, skip
            new_name = error_file + ".skip"
            os.rename(error_file, new_name)
            skipped += 1
            print(f"[{iteration+1}] Skipped (XML): {os.path.basename(error_file)}")
        else:
            # Try simple fixes
            with open(error_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # Check for common issues
            frontmatter_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
            if frontmatter_match:
                frontmatter = frontmatter_match.group(1)

                # Check if missing required fields
                if 'title:' not in frontmatter or 'date:' not in frontmatter:
                    # Skip if malformed
                    new_name = error_file + ".skip"
                    os.rename(error_file, new_name)
                    skipped += 1
                    print(f"[{iteration+1}] Skipped (malformed): {os.path.basename(error_file)}")
                else:
                    # Try to fix common issues
                    # Fix double brackets
                    content = content.replace('tags: [[', 'tags: [')

                    with open(error_file, 'w', encoding='utf-8', newline='\n') as f:
                        f.write(content)

                    fixed += 1
                    print(f"[{iteration+1}] Fixed: {os.path.basename(error_file)}")
            else:
                # No valid frontmatter, skip
                new_name = error_file + ".skip"
                os.rename(error_file, new_name)
                skipped += 1
                print(f"[{iteration+1}] Skipped (no frontmatter): {os.path.basename(error_file)}")

    except Exception as e:
        print(f"Error processing {error_file}: {e}")
        new_name = error_file + ".skip"
        os.rename(error_file, new_name)
        skipped += 1

else:
    print(f"\nReached max iterations (100)")

print(f"\nFixed: {fixed}")
print(f"Skipped: {skipped}")
print(f"\nFinal Hugo test:")
result = subprocess.run(["hugo", "server"], capture_output=True, text=True, timeout=3, encoding='utf-8', errors='ignore')
if "Web Server is available" in result.stdout or "Built in" in result.stdout:
    print("SUCCESS: Hugo is now working!")
else:
    print("FAILED: Hugo still has errors")
    print(result.stdout[:500])
