# 知识铺总站首页（zshipu-index 根）

## 硬约束

- **不准删除老页面**：已上线 HTML / 历史 JSON / backup / `index-v*` 可继续遗留在根目录。
- 首页主数据源改为下方契约文件；遗留文件仅作兼容回退，不做物理清理。

## 当前契约（定时刷新）

| 文件 | 用途 | 刷新 |
|------|------|------|
| `homepage-featured.json` | 谷歌高点击精选 | 每日自治 `portal_home` / `scripts/update-portal-homepage.py` |
| `homepage-recent.json` | 最新文章 | 同上 |
| `gsc-featured.json` | featured 兼容别名 | 与 featured 同步覆盖写入 |

遗留（保留、不再作为主源）：`site-links-*.json`、`index-v2.html`、`index-v3.html`、各类 `.backup*`。

## 首页区块

1. **谷歌高点击精选** ← `homepage-featured.json`（回退 `gsc-featured.json`）
2. **最新文章** ← `homepage-recent.json`（回退 `site-links-recent.json`）
3. 特色项目 / 侧栏等原有模块保留

## 手动刷新

```powershell
cd webagent
.venv312\Scripts\python.exe scripts\update-portal-homepage.py
.venv312\Scripts\python.exe scripts\update-portal-homepage.py --push
```

配置见 `config/config.yaml` → `portal_homepage`。

## 本地预览

```powershell
cd ..\..\zshipu-index
python -m http.server 8000
# http://127.0.0.1:8000/
```
