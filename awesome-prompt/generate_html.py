
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
                    "        #status { margin-top: 10px; color: #666; font-weight: bold; }",
                    "        .controls { position: sticky; top: 0; background: white; padding: 10px 0; border-bottom: 1px solid #ddd; }",
                    "    </style>",
                    "</head>", 
                    "<body>", 
                    "    <div class=\"controls\">",
                    "        <h1>Image Links</h1>",
                    "        <div style=\"background: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 15px;\">",
                    "            <p style=\"margin: 0 0 10px 0;\"><strong>📂 下载位置提示：</strong> 图片将保存到您浏览器的<strong>【默认下载文件夹】</strong>（通常是 \"Downloads\" 或 \"下载\"）。</p>",
                    "            <p style=\"margin: 0; color: #dc3545;\"><strong>⚠️ 注意：</strong> 如果点击按钮后没有反应或报错，说明受到浏览器安全限制（CORS）。请改用目录下的 <code>python download_robust.py</code> 脚本进行下载。</p>",
                    "        </div>",
                    "        <button onclick=\"downloadAll()\" style=\"padding: 10px 20px; font-size: 16px; background: #28a745; color: white; border: none; cursor: pointer;\">批量下载所有图片 (Download All)</button>",
                    "        <div id=\"status\"></div>",
                    "    </div>",
                    "    <script>",
                    "        async function downloadAll() {",
                    "            const links = document.querySelectorAll('a');",
                    "            const status = document.getElementById('status');",
                    "            let success = 0;",
                    "            let fail = 0;",
                    "            ",
                    "            if (!confirm(`准备下载 ${links.length} 张图片。\\n\\n文件将保存到浏览器的【默认下载文件夹】。\\n\\n是否继续？`)) return;",
                    "",
                    "            for (let i = 0; i < links.length; i++) {",
                    "                const link = links[i];",
                    "                const url = link.href;",
                    "                const filename = url.substring(url.lastIndexOf('/') + 1);",
                    "                ",
                    "                status.innerText = `正在处理 (${i + 1}/${links.length}): ${filename} | 成功: ${success} | 失败: ${fail}`;",
                    "",
                    "                try {",
                    "                    const response = await fetch(url);",
                    "                    if (!response.ok) throw new Error('Network response was not ok');",
                    "                    const blob = await response.blob();",
                    "                    const a = document.createElement('a');",
                    "                    a.href = URL.createObjectURL(blob);",
                    "                    a.download = filename;",
                    "                    document.body.appendChild(a);",
                    "                    a.click();",
                    "                    document.body.removeChild(a);",
                    "                    URL.revokeObjectURL(a.href);",
                    "                    success++;",
                    "                } catch (error) {",
                    "                    console.error('Download failed:', url, error);",
                    "                    fail++;",
                    "                    // 如果 fetch 失败（可能是 CORS），尝试直接点击（可能会打开新标签页，所以这里仅作为最后的手段，或者干脆只记录失败）",
                    "                    // link.click(); // 取消注释这行可以尝试强制打开",
                    "                }",
                    "                ",
                    "                // 延时防止浏览器卡死",
                    "                await new Promise(r => setTimeout(r, 800));",
                    "            }",
                    "            status.innerText = `完成！成功: ${success}, 失败: ${fail}`;",
                    "            alert(`下载完成！\\n成功: ${success}\\n失败: ${fail}`);",
                    "        }",
                    "    </script>"]
    
    for url in urls:
        html_content.append(f'    <a href="{url}" target="_blank">{url}</a>')
    
    html_content.append("</body>")
    html_content.append("</html>")
    
    html_path.write_text("\n".join(html_content), encoding="utf-8")
    print(f"Generated img.html with {len(urls)} links.")
else:
    print("img.txt not found.")
