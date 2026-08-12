# Tavily CLI

**[English](./README.md) | 简体中文**

[![npm version](https://img.shields.io/npm/v/@renxqoo/tavily-cli?color=blue&logo=npm)](https://www.npmjs.com/package/@renxqoo/tavily-cli)
[![npm license](https://img.shields.io/npm/l/@renxqoo/tavily-cli?color=blue)](./LICENSE)
[![node](https://img.shields.io/node/v/@renxqoo/tavily-cli?color=blue&logo=node.js)](https://nodejs.org)
[![CI](https://github.com/renxqoo/tavily-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/renxqoo/tavily-cli/actions/workflows/ci.yml)
[![bundle size](https://img.shields.io/badge/bundle-~24KB-zero--deps-success)](#技术栈)

Tavily AI **搜索与网页内容提取** 命令行工具,专为 AI Agent 设计。搜索网络、提取页面、爬取整站、生成站点地图、发起深度研究——全部以统一的 JSON 输出,Agent 可直接消费。

- 🔎 **搜索** · 📄 **提取** · 🕸️ **爬取** · 🗺️ **地图** · 🔬 **研究**
- 🤖 内置 **Skill**,AI Agent 可自服务发现并调用正确命令
- 🔑 支持环境变量或本地凭证库鉴权(永不回显 Key)
- 📦 **零运行时依赖**——全量打包压缩为单个约 24KB 文件

## 目录

- [功能](#功能)
- [安装](#安装)
- [鉴权](#鉴权)
- [常用命令](#常用命令)
- [输出格式](#输出格式)
- [命令一览](#命令一览)
- [开发](#开发)
- [技术栈](#技术栈)
- [贡献](#贡献)
- [许可证](#许可证)

## 功能

- **搜索** (`search`) — 用自然语言搜索网络,支持通用、新闻、金融三大类别
- **提取** (`extract`) — 从指定 URL 提取网页正文内容(markdown 或纯文本)
- **爬取** (`crawl`) — 基于图遍历爬取整个站点,提取多个页面内容
- **地图** (`map`) — 生成站点 URL 地图(只发现链接,不提取内容)
- **研究** (`research`) — 发起异步深度研究任务,生成带引用的研究报告
- **结构化输出** — 默认 JSON 统一输出,Agent 可直接消费
- **API Key 鉴权** — 支持环境变量和本地持久化两种方式

## 安装

需要 **Node.js >= 20**。

```bash
npm install -g @renxqoo/tavily-cli
```

或一键安装(自动完成 CLI + Skill + 凭证引导):

```bash
npx @renxqoo/tavily-cli install
```

验证安装:

```bash
tavily --help
tavily skills list --json
```

> **WorkBuddy 用户**:一键安装的 skills 同步目标是通用 AI 工具目录(`~/.agents`、Claude/Codex/Cursor 等),**不含 `~/.workbuddy/skills/`**。需手动把 skill 拷入(详见 `skills/tavily/SKILL.md` 的「安装」章节)。

## 鉴权

> ⚠️ **安全红线:绝对不要将 API Key 硬编码到代码或聊天记录中。**
> 一旦 Key 出现在代码、对话、截图或会提交到 Git 的文件里,即视为已泄露。

Tavily API Key 以 `tvly-` 开头,可在 [Tavily 控制台](https://app.tavily.com) 获取。

**方式一:系统环境变量(推荐)**

在操作系统层面配置,Key 不落盘到任何项目文件:

```bash
# macOS / Linux:写入 ~/.zshrc 或 ~/.bashrc
echo 'export TAVILY_API_KEY=tvly-xxxx' >> ~/.zshrc
source ~/.zshrc

# Windows:系统属性 → 环境变量 → 用户变量 → 新建
```

> 在 WorkBuddy 中使用:可先在 **设置 → 环境变量(Environment Variables)** 页面填写键值对;或使用上述系统环境变量。**修改后需重启 WorkBuddy 才能读到。**

**方式二:CLI 本地凭证库**

```bash
TAVILY_API_KEY=tvly-xxxx tavily auth login
# 凭证保存到 ~/.tavily-cli/credentials/tavily.json(仅当前用户可读)
```

清除凭证:

```bash
tavily auth logout
```

### 安全使用规范

| ✅ 应该 | ❌ 禁止 |
|---------|--------|
| Key 存系统环境变量或 `auth login` 凭证库 | 把 Key 硬编码进代码、脚本或配置文件中 |
| 通过 `auth status` 检查凭证(只显示来源,不回显 Key) | 把 Key 粘贴到聊天记录、截图或文档里 |
| 项目提交 Git 前检查 `.gitignore` 覆盖凭证目录 | 把含 Key 的 `.env` / `config.json` 提交到仓库 |
| Key 泄露后立即到 Tavily 控制台吊销重建 | 用同一 Key 在多个环境长期共用不轮换 |

> CLI 内置防护:`auth status` 仅返回凭证来源(如 `env:TAVILY_API_KEY`)和类型,**永不回显 Key 本身**;日志与错误信息同样不会输出 Key 值。

## 常用命令

```bash
# 搜索
tavily search "量子计算最新进展" --json

# 搜索并获取 AI 回答
tavily search "什么是 RAG" --include_answer --json

# 新闻搜索
tavily search "OpenAI" --topic news --json

# 限定域名搜索
tavily search "react hooks" --include_domains github.com --json

# 提取网页内容
tavily extract https://example.com --json

# 提取多个 URL
tavily extract https://a.com https://b.com --format markdown --json

# 爬取整个站点(限制深度和页数)
tavily crawl https://docs.example.com --max_depth 2 --limit 50 --json

# 生成站点 URL 地图
tavily map https://example.com --max_depth 2 --json

# 深度研究(自动等待报告生成)
tavily research "2026 年 AI Agent 生态格局" --model pro --json

# 只创建研究任务,稍后查询
tavily research "量化策略比较" --no-wait --json
tavily research get <request_id> --json
```

Agent 或脚本调用时显式加 `--json`。成功结果写 stdout,错误和日志写 stderr。

## 输出格式

- `--json` — 强制 JSON 统一输出(Agent 调用必须使用)
- `--no-json` — 人类可读文本输出
- 默认 `auto` — TTY 终端输出文本,管道/CI 输出 JSON

## 命令一览

| 命令 | 说明 |
|------|------|
| `tavily search <query>` | 搜索网络内容 |
| `tavily extract <urls>` | 提取网页内容 |
| `tavily crawl <url>` | 爬取站点并提取内容(图遍历) |
| `tavily map <url>` | 生成站点 URL 地图 |
| `tavily research <input>` | 发起深度研究任务 |
| `tavily research get <id>` | 查询研究任务结果 |
| `tavily auth login` | 保存 API Key 到本地 |
| `tavily auth logout` | 清除本地 API Key |
| `tavily auth status` | 检查凭证状态 |
| `tavily skills list` | 列出内置 Skill |
| `tavily skills sync` | 同步 Skill 到 AI 工具目录 |

每个命令的完整参数请运行 `tavily <命令> --help`,或查阅内置的 [`skills/tavily/references/`](./skills/tavily/references)。

## 开发

本项目使用 [pnpm](https://pnpm.io)(见 `pnpm-lock.yaml`),需要 Node.js >= 20。

```bash
pnpm install          # 安装依赖
pnpm run lint         # oxlint —— 代码检查
pnpm run format       # oxfmt —— 格式化(写入)
pnpm run format:check # oxfmt —— 仅检查格式不写入
pnpm run typecheck    # tsc --noEmit —— 类型检查
pnpm run test         # vitest —— 运行冒烟测试(经 pretest 先构建 dist/)
pnpm run build        # tsup 打包:单文件 dist/index.js(minify + 全量 bundle,约 24KB)
```

无需全局安装即可运行本地构建产物:

```bash
node ./dist/index.js --help
TAVILY_API_KEY=tvly-xxxx node ./dist/index.js search "hello" --json
```

Git 钩子(由 [husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/lint-staged/lint-staged) 驱动)会自动执行:

- **pre-commit** —— 对暂存文件执行 `oxlint --fix` + `oxfmt --write`
- **pre-push** —— 运行 `typecheck` + `test`

## 技术栈

- [Tavily AI API](https://docs.tavily.com) — 搜索与内容提取后端
- [@renxqoo/agent-data-cli](https://www.npmjs.com/package/@renxqoo/agent-data-cli) — Agent-native CLI 框架(含 install 向导,打包时内联)
- [tsup](https://tsup.gg) — 构建工具(esbuild 封装,minify + tree-shaking)

## 贡献

欢迎贡献!`main` 为保护分支,所有改动通过 Pull Request 合入。

详见 **[CONTRIBUTING.md](./CONTRIBUTING.md)**(环境搭建、项目结构、发布流程)与[行为准则](./CODE_OF_CONDUCT.md)。

## 许可证

[MIT](./LICENSE) © [renxqoo](https://github.com/renxqoo)
