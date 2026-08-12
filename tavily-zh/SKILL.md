---
name: tavily-cli
description: Tavily AI 搜索与网页内容提取。当用户要搜索网络信息、查新闻、查金融数据，
  从指定 URL 提取网页正文、爬取整个站点、生成站点 URL 地图，或发起深度研究
  报告任务时使用。不支持图片搜索、视频搜索或本地文件检索。
metadata:
  category: search
---

# Tavily AI 搜索与内容提取

> 本 skill 为英文版 `tavily` 的中文版本。命令、参数、响应结构完全一致，仅文档语言不同。

## 安装

先确认 `tavily` 命令是否可用：

```bash
which tavily && tavily --version
```

```bash
npx @renxqoo/tavily-cli install
```

## 鉴权

> ⚠️ **安全红线：绝对不要将 API Key 硬编码到代码或聊天记录中。**
> 禁止把 `TAVILY_API_KEY` 的值写入任何文件、命令回显或对话；只引用变量本身。

使用前需要配置 Tavily API Key：

```bash
# 方式一：系统环境变量（推荐，Key 不落盘到项目文件）
export TAVILY_API_KEY=tvly-xxxx   # 可写入 ~/.zshrc 持久化，改后重启 WorkBuddy

# 方式二：保存到本地凭证库（~/.tavily-cli/credentials/，仅当前用户可读）
TAVILY_API_KEY=tvly-xxxx tavily auth login

# 检查状态（只显示来源，不回显 Key）
tavily auth status --json
```

API Key 以 `tvly-` 开头，可在 [Tavily 控制台](https://app.tavily.com) 获取。

**Agent 安全约定：**
- 需要 Key 时读取环境变量或 `~/.tavily-cli/credentials/`，不要询问用户粘贴 Key 到对话中
- 鉴权失败时提示用户检查环境变量或运行 `tavily auth login`，不要打印或保存 Key 值
- Key 疑似泄露时建议用户到 Tavily 控制台吊销重建

## 命令

| 操作 | 命令 |
|------|------|
| 使用 Tavily AI 搜索网络内容 | `tavily search <query> [--search_depth <string>] [--max_results <number>] [--topic <string>] [--time_range <string>] [--start_date <string>] [--end_date <string>] [--include_answer] [--include_raw_content] [--include_images] [--include_domains <string>...] [--exclude_domains <string>...] [--country <string>]` |
| 从指定 URL 提取网页内容 | `tavily extract <urls> [--query <string>] [--extract_depth <string>] [--include_images] [--format <string>] [--timeout <number>]` |
| 爬取站点并提取多个页面的内容（图遍历） | `tavily crawl <url> [--instructions <string>] [--max_depth <number>] [--max_breadth <number>] [--limit <number>] [--select_paths <string>...] [--select_domains <string>...] [--exclude_paths <string>...] [--exclude_domains <string>...] [--allow_external] [--include_images] [--extract_depth <string>] [--format <string>] [--include_favicon] [--timeout <number>] [--include_usage]` |
| 生成站点 URL 地图（发现链接，不提取内容） | `tavily map <url> [--instructions <string>] [--max_depth <number>] [--max_breadth <number>] [--limit <number>] [--select_paths <string>...] [--select_domains <string>...] [--exclude_paths <string>...] [--exclude_domains <string>...] [--allow_external] [--timeout <number>] [--include_usage]` |
| 发起深度研究任务并等待报告生成（异步） | `tavily research <input> [--model <string>] [--citation_format <string>] [--output_length <string>] [--include_domains <string>...] [--exclude_domains <string>...] [--wait] [--wait_timeout <number>]` |
| 从环境变量 TAVILY_API_KEY 保存 API Key 到本地 | `tavily auth login` |
| 清除本地保存的 Tavily API Key | `tavily auth logout` |
| 检查当前凭证配置状态 | `tavily auth status` |
| 查询研究任务的状态与结果 | `tavily research get <request_id>` |

> **命令详解**（参数范围、枚举值、响应结构、成本，按需查阅）：[search](references/search.md) · [extract](references/extract.md) · [crawl](references/crawl.md) · [map](references/map.md) · [research](references/research.md) · [auth](references/auth.md)

### 搜索 + 提取组合

```bash
# 1. 搜索找到相关页面
tavily search "Rust 异步编程" --max_results 3 --include_answer --json

# 2. 从搜索结果中提取感兴趣页面的完整内容
tavily extract https://blog.example.com/rust-async --format markdown --json
```

### 带过滤的新闻搜索

```bash
# 搜索最近一周的 AI 新闻，排除某些域名
tavily search "OpenAI" --topic news --time_range week --exclude_domains ads.com spam.com --json
```

### 金融搜索与域名过滤

```bash
# 查金融/行情类信息（topic=finance；注意：是金融新闻搜索，非实时行情或专业金融数据源）
tavily search "苹果股价" --topic finance --json

# 结果限定在指定域名内
tavily search "react hooks" --include_domains github.com --json
```

### 站点探索：map → extract 组合

```bash
# 1. 先用 map 低成本发现站点结构（只消耗少量 credits）
tavily map https://docs.example.com --max_depth 2 --json

# 2. 对感兴趣的页面用 extract 提取正文
tavily extract https://docs.example.com/api --json
```

> 当站点结构未知时，推荐 map 先行而非直接 crawl，成本更低。

### 深度研究（异步任务）

```bash
# 方式一：自动轮询直到报告生成（默认行为）
tavily research "2026 年 AI Agent 生态格局" --model pro --json

# 方式二：只创建任务，稍后查询（适合长任务，不阻塞）
tavily research "量化交易策略比较" --model mini --no-wait --json
tavily research get <request_id> --json
```

> `research` 任务创建后异步执行：`mini` 模型最快（约 1-2 分钟），`pro` 更全面但更慢。
> 默认自动轮询（`--wait`），可用 `--wait_timeout <秒>` 控制最大等待，超时返回 `request_id` 供后续查询。

## 前置条件

- 已配置 API Key: `tavily auth status --json`
- 网络可访问 `https://api.tavily.com`

## 错误处理

**判断方式：命令失败时输出 `{"ok":false,"error":{...}}`，依据 `error.type` / `error.subtype` 判断错误类别**（注意：进程 exit code 恒为 0，不要用 exit code 判断错误）：

| error.type | error.subtype | 处理 |
|------------|---------------|------|
| `authentication` | `no_credentials` | 设置 `TAVILY_API_KEY` 环境变量或运行 `tavily auth login` |
| `authentication` | `no_token` | API Key 无效或已过期，检查 Key 是否正确 |
| `api` | `rate_limited` | 请求过于频繁，**等待后重试（最多 3 次，间隔递增）** |
| `api` | `server_error` | Tavily 服务端临时故障，**稍后重试（最多 3 次）**，仍失败则告知用户服务不可用 |
| `validation` | `invalid_argument` | 参数错误，检查命令的 `--help` 输出 |
| `network` | 任意 | 网络连接问题，检查网络后重试（最多 3 次） |

**部分失败降级（不要整体报错，保留已成功的部分）：**
- `extract` 多 URL 时部分失败：返回 `results`（成功项）+ `failed_results`（失败项及原因），只报告失败的 URL，成功内容照常交付
- `research` 自动轮询超时（`--wait_timeout`）：返回 `request_id`，用 `tavily research get <request_id> --json` 后续查询，不要重复创建任务
- `crawl` 超时或部分页面失败：已爬取页面的结果照常返回，缺失页面不重爬（重爬会重复计费）

**恢复动作必须有限且确定**：所有重试不超过 3 次；重试仍失败后停止，如实向用户报告错误信息（`error.message`），不要无限重试。

## 注意事项

- `--json` 是 agent 调用时必须使用的参数，确保输出为结构化 JSON
- **stderr 噪音**：命令每次运行都会在 stderr 输出一行 Node TLS 警告（`NODE_TLS_REJECT_UNAUTHORIZED`），属正常噪音可忽略。保存/解析输出时**只用 stdout**：不要 `2>&1` 合并重定向到文件（警告会混进 JSON 导致解析失败），用 `> file` 或直接捕获 stdout
- `advanced` 搜索/提取深度消耗 2 credits（其他模式 1 credit），成本敏感时用默认深度
- 站点结构未知时优先 `map`（低成本发现），再对选中页面 `extract`，避免直接 `crawl` 的高成本
