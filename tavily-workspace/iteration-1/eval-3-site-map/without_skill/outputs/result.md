# docs.anthropic.com 文档站结构探测结果

> 探测时间：2026-08-12
> 探测方式：WebFetch（主页、`/llms.txt`、`/sitemap.xml`、页面直访验证）
> 说明：`docs.anthropic.com` 现已迁移/重定向到 `platform.claude.com/docs`（页面标题为 "Claude Platform Docs"）。`docs.anthropic.com/en/docs/xxx` 与 `platform.claude.com/docs/en/xxx` 是同一文档站的两个入口，均验证可访问。

## 一、站点概况

| 项目 | 说明 |
| --- | --- |
| 目标站点 | https://docs.anthropic.com |
| 实际内容域名 | https://platform.claude.com/docs（docs.anthropic.com 重定向至此） |
| 文档语言 | en / de / es / fr / it / ja / ko / pt-BR / ru / zh-CN / zh-TW / id 等 |
| 内容结构 | 入门指南、构建（Build）、工具与代理（Agents & Tools）、Managed Agents、模型与定价、CLI/SDK、Admin、API 参考、Release Notes 等 |
| 枚举方式 | 主页导航 + `/llms.txt`（完整链接清单）+ `/sitemap.xml`（多语言 sitemap） |

**注意**：站点体量很大（sitemap.xml 含 200+ 英文链接、多语言各有数十个，另含数百个 API 端点页面），本探测无法完整枚举全部链接。以下前 10 个链接取自英文版 sitemap.xml 的顺序，均可访问。

## 二、前 10 个页面链接

| # | 链接（docs.anthropic.com 入口） | 等价链接（platform.claude.com） | 页面 | 验证状态 |
| --- | --- | --- | --- | --- |
| 1 | https://docs.anthropic.com | https://platform.claude.com/docs | Claude Platform Docs 首页 | ✅ 已验证 |
| 2 | https://docs.anthropic.com/en/docs/intro | https://platform.claude.com/docs/en/intro | Intro to Claude | 来自 sitemap/llms.txt |
| 3 | https://docs.anthropic.com/en/docs/get-api-key | https://platform.claude.com/docs/en/get-api-key | 获取 API Key | 来自 sitemap/llms.txt |
| 4 | https://docs.anthropic.com/en/docs/get-started | https://platform.claude.com/docs/en/get-started | 快速入门：发起第一次 API 调用 | ✅ 已验证 |
| 5 | https://docs.anthropic.com/en/docs/manage-claude/authentication | https://platform.claude.com/docs/en/manage-claude/authentication | 认证（API Key / Workload Identity Federation） | 来自 sitemap/llms.txt |
| 6 | https://docs.anthropic.com/en/docs/build-with-claude/overview | https://platform.claude.com/docs/en/build-with-claude/overview | 构建功能总览 | 来自 sitemap/llms.txt |
| 7 | https://docs.anthropic.com/en/docs/build-with-claude/working-with-messages | https://platform.claude.com/docs/en/build-with-claude/working-with-messages | 使用 Messages API（多轮、system prompt、stop reasons） | 来自 sitemap/llms.txt |
| 8 | https://docs.anthropic.com/en/docs/build-with-claude/handling-stop-reasons | https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons | 处理 stop_reason | 来自 sitemap/llms.txt |
| 9 | https://docs.anthropic.com/en/docs/build-with-claude/refusals-and-fallback | https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback | 拒绝响应与回退处理 | 来自 sitemap/llms.txt |
| 10 | https://docs.anthropic.com/en/docs/about-claude/models/overview | https://platform.claude.com/docs/en/about-claude/models/overview | 模型总览 | ✅ 已验证（并提取内容） |

> 链接真实性说明：以上链接均来自真实抓取的主页导航 / `llms.txt` / `sitemap.xml`，未编造。标记"已验证"的页面已实际访问确认；其余来自 sitemap.xml 的原始条目，未逐一访问。
>
> 另外，docs.anthropic.com 的 `/sitemap.xml` 因区域限制返回 "App unavailable in region"，但 `/llms.txt` 与 `platform.claude.com/docs/sitemap.xml` 可用。

## 三、提取的页面内容：Models overview

以下内容提取自第 10 个链接对应的页面：https://docs.anthropic.com/en/docs/about-claude/models/overview （Claude Platform Docs - "Models overview"）

### 3.1 模型选择建议

- 不确定用哪个模型时，建议从 **Claude Opus 5** 开始，适合复杂的 agentic 编码和企业级工作负载。
- 需要最高能力时使用 **Claude Fable 5**。
- 所有当前 Claude 模型均支持文本与图像输入、文本输出、多语言能力与视觉（vision）。
- 模型可通过 Claude API、Amazon Bedrock、Claude Platform on AWS、Google Cloud (Vertex AI)、Microsoft Foundry 使用。

### 3.2 最新模型对比（节选）

| 特性 | Claude Fable 5 | Claude Opus 5 | Claude Sonnet 5 | Claude Haiku 4.5 |
| --- | --- | --- | --- | --- |
| 定位 | 面向长时运行 agent 的新一代智能 | 复杂 agentic 编码与企业工作 | 速度与智能的最佳平衡 | 最快、接近前沿智能 |
| Claude API ID | claude-fable-5 | claude-opus-5 | claude-sonnet-5 | claude-haiku-4-5-20251001 |
| Claude API 别名 | claude-fable-5 | claude-opus-5 | claude-sonnet-5 | claude-haiku-4-5 |
| 定价 | $10/百万输入 token，$50/百万输出 token | $5/百万输入 token，$25/百万输出 token | $2/百万输入 token，$10/百万输出 token | $1/百万输入 token，$5/百万输出 token |
| 扩展思考（thinking.type:"enabled"） | 否 | 否 | 否 | 是 |
| 自适应思考（adaptive thinking） | 是（始终开启） | 是 | 是 | 否 |
| 相对延迟 | 较慢 | 中等 | 快 | 最快 |
| 上下文窗口 | 1M tokens | 1M tokens | 1M tokens | 200k tokens |
| 最大输出 | 128k tokens | 128k tokens | 128k tokens | 64k tokens |
| 可靠知识截止 | 2026-01 | 2026-05 | 2026-01 | 2025-02 |

### 3.3 其他要点

- **Claude Mythos 5 / Mythos Preview**：与 Fable 5 规格与定价相同，属于邀请制的 Project Glasswing，用于防御性网络安全工作流，无自助注册渠道。
- **模型 ID 版本**：每个 Claude 模型 ID 都是固定的快照；从 Claude 4.6 代开始使用无日期格式，同样是固定快照而非长期指针。4.6 之前的模型，API 别名列指向带日期版本的模型 ID。
- **Bedrock / Google Cloud 端点**：Claude Sonnet 4.5 及之后模型在 Bedrock 提供全局端点（动态路由）与区域端点；Google Cloud 提供全局、多区域、区域三类端点。
- **API 可查询能力**：可通过 Models API（`GET /v1/models`）编程查询各模型的输入/输出 token 上限与 capabilities。
- **effort 参数**：Opus 4.8 默认 high；Opus 5 与 Sonnet 5 在 Claude API 与 Claude Code 上默认 high，需显式设置以调整。
- **Batch 扩展输出**：Message Batches API 配合 `output-300k-2026-03-24` beta header，Opus 5/4.8/4.7/4.6、Sonnet 5/4.6 最高支持 300k 输出 token。
- **迁移**：从 Opus 4.8 或更早版本迁移，参考 "Migrating to Claude Opus 5" 迁移指南。

## 四、探测局限

1. **无法完整枚举全部链接**：文档站规模大（数百个页面，含大量 JS 渲染的 API 参考页），且 sitemap.xml 输出在长文本抓取时被截断，无法保证穷举。
2. **docs.anthropic.com/sitemap.xml 区域受限**：直接访问被拒，改用 `/llms.txt` 与 `platform.claude.com/docs/sitemap.xml` 获取链接。
3. **API 参考页面为 JS 渲染**：如 `api/messages/create` 页面静态抓取只能拿到标题（"Create a Message - Claude API Reference"），正文需浏览器渲染，本次未提取。
4. 部分链接的"页面"列是根据 URL slug 与站点导航推断的标题，未逐一打开确认。
