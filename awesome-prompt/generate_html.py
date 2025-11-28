
from pathlib import Path

img_txt_path = Path("img.txt")
html_path = Path("img.html")

if img_txt_path.exists():
    urls = [line.strip() for line in img_txt_path.read_text(encoding="utf-8").splitlines() if line.strip()]
    
    html_content = ["<!DOCTYPE html>", "<html lang=\"en\">", "<head>", 
                    "    <meta charset=\"UTF-8\">", 
                    "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",
                    "    <title>Image Links</title>",
                    "    <style>",
                    "        body { font-family: sans-serif; padding: 20px; }",
                    "        a { display: block; margin: 5px 0; text-decoration: none; color: #007bff; }",
                    "        a:hover { text-decoration: underline; }",
                    "    </style>",
                    "</head>", "<body>", "    <h1>Image Links</h1>"]
    
    for url in urls:
        html_content.append(f'    <a href="{url}" target="_blank">{url}</a>')
    
    html_content.append("</body>")
    html_content.append("</html>")
    
    html_path.write_text("\n".join(html_content), encoding="utf-8")
    print(f"Generated img.html with {len(urls)} links.")
else:
    print("img.txt not found.")
