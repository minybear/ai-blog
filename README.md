# 阿伟 · AI 应用开发与落地

> 面向中文用户的个人品牌主页，同时保留一组可直接使用的 AI 小工具。

## 关于

首页介绍 AI 项目开发、企业 AI 内训和一对一 AI 应用陪跑服务，并展示阿伟的开发、技术管理、项目与授课经历。联系入口优先展示个人微信二维码，同时保留邮箱 `ww1150434308@gmail.com` 作为备选；内容分享入口为 [X @aweiai2035](https://x.com/aweiai2035)。

更多文章/工具会陆续添加。

## 站点内容

### 个人主页（`index.html`）

主页提供服务介绍、流程说明、个人经历、内容分享和免费工具入口。联系按钮会打开个人微信二维码弹窗，并保留邮箱联系和复制邮箱操作；公众号区域展示“阿伟AI说”二维码，同时保留公众号名称搜索和复制备选。

### AI 工具集（`tools.html`）

一组免费、纯前端的在线工具，按用途分类：

**📝 文档类**
- **Markdown 转 PDF / HTML** — 在线编辑、实时预览、代码高亮、一键导出

**🖼️ 图片类**
- **图表转高清图片** — Mermaid / Graphviz / PlantUML → 2×–4× 高清 PNG / SVG
- **PDF 转图片** — 浏览器内逐页渲染，按页/范围导出，文件不上传

更多工具持续集成中…

工具页特点：

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
├── index.html                   # 阿伟个人品牌主页
├── tools.html                   # 独立 AI 工具箱（保留原有工具入口）
├── assets/
│   ├── awei-avatar.jpg          # 用户提供的阿伟头像原图
│   ├── wechat-personal.jpg      # 用户提供的个人微信二维码原图
│   ├── wechat-official.jpg      # 用户提供的公众号二维码原图
│   ├── home.css                 # 主页样式
│   └── home.js                  # 主页弹窗和工具嵌入交互
├── md2pdf/                      # Markdown → PDF / HTML
│   ├── index.html
│   └── libs/
├── photo/                       # 图片类工具
│   ├── diagram-converter.html       # 图表转高清图片
│   └── pdf2imageV2.html             # PDF → 图片
└── README.md
```

## 联系方式

- 个人微信二维码：`assets/wechat-personal.jpg`，联系弹窗中点击图片可查看原图
- 公众号二维码：`assets/wechat-official.jpg`
- 邮箱：`ww1150434308@gmail.com`
- X：[@aweiai2035](https://x.com/aweiai2035)

头像和两张二维码均来自用户提供的原图，按原比例接入页面；微信和公众号二维码支持点击查看原图。邮箱使用 `mailto:` 链接打开本地邮件客户端，公众号名称支持复制后在微信中搜索。

## License

MIT
