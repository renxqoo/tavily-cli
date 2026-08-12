# 任务摘要

## 任务
探测 https://docs.anthropic.com 文档站结构：列出前 10 个页面链接，并提取其中 1 个页面的内容，整理为 markdown 保存。

## 方法
1. **主页探测**：用 WebFetch 抓取 `https://docs.anthropic.com`，确认站点已迁移/重定向到 `platform.claude.com/docs`，并拿到主页导航中的大量链接。
2. **链接枚举**：
   - `https://docs.anthropic.com/sitemap.xml` 返回 "App unavailable in region"（区域限制），改用其他途径；
   - `https://docs.anthropic.com/llms.txt` 成功返回完整链接清单（含 .md 后缀）；
   - `https://platform.claude.com/docs/sitemap.xml` 成功返回多语言 sitemap（en/de/fr…）。
3. **链接验证**：实际访问 `docs.anthropic.com/en/docs/get-started`、`docs.anthropic.com/en/docs/api/messages/create`、`docs.anthropic.com/en/docs/about-claude/models/overview`，均可达，确认 `docs.anthropic.com/en/docs/xxx` 路径有效。
4. **内容提取**：提取 Models overview 页面的完整正文（模型对比、定价、上下文窗口等），整理进结果文件。

## 结果
- 文档站实际域名为 `platform.claude.com/docs`，`docs.anthropic.com` 为其别名入口，支持 11+ 种语言。
- 按英文版 sitemap.xml 顺序列出前 10 个页面链接，其中 4 个（含站点根）已实际验证可达，其余来自 sitemap/llms.txt 原始条目，未编造。
- 提取的页面为 **Models overview**（模型总览），内容含 Claude Fable 5 / Opus 5 / Sonnet 5 / Haiku 4.5 的对比表、定价、上下文窗口、模型 ID 版本说明等。

## 局限（如实说明）
- 站点体量很大（含数百个 API 端点页），sitemap 抓取时被截断，**无法保证穷举全部链接**。
- `docs.anthropic.com/sitemap.xml` 受区域限制不可用。
- API 参考页为 JS 渲染，静态抓取只能获得标题，未提取其正文。

## 产出文件
- 结果：`outputs/result.md`（站点结构 + 前 10 个链接 + Models overview 页面内容 + 局限说明）
- 本摘要：`outputs/summary.md`
