# minybear 的个人博客

> 个人博客站点，AI 工具集是博客的第一块内容。

## 关于

这是 [minybear](https://github.com/minybear) 的个人博客仓库。目前站内首发内容是一个**纯前端的 AI 工具集**：所有计算都在浏览器里跑，数据不出本地，免费、离线可用。

更多文章/工具会陆续添加。

## 站点内容

### AI 工具集（`index.html`）

一组免费、纯前端的在线工具：

- **图表转高清图片** — 浏览器内一键导出
- **Markdown 转 PDF** — 无需后端
- 更多工具持续集成中…

特点：

- ✅ 纯前端，**数据不出浏览器**
- ✅ 暗色 / 亮色主题
- ✅ 响应式，移动端可用
- ✅ 零依赖部署（GitHub Pages 友好）

## 本地预览

直接用浏览器打开 `index.html` 即可，或起一个本地静态服务：

```bash
# 任选一种
python -m http.server 8000
npx serve .
```

然后访问 http://localhost:8000

## 部署

本仓库已配置为可由 [GitHub Pages](https://pages.github.com/) 直接部署。
启用方式：仓库 → **Settings** → **Pages** → **Source**: `Deploy from a branch` → **Branch**: `main` / `(root)`。

部署后访问：https://minybear.github.io/ai-blog/

## 目录结构

```
.
├── index.html              # 博客 / AI 工具集首页
├── photo/
│   ├── diagram-converter.html   # 图表转图片工具
│   └── md2PdfV2/                # Markdown → PDF 工具
└── README.md
```

## License

MIT
