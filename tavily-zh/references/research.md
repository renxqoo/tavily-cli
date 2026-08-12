# research 命令详解

`tavily research <input> [options]`

发起**异步**深度研究任务：执行多次搜索、分析来源、生成带引用的研究报告。

## 位置参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | string | 是 | 研究任务或问题 |

## 可选参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `--model` | string | `auto` | 研究模型：`mini`(快速高效，适合窄问题) / `pro`(全面多角度，适合复杂话题) / `auto`(自动) |
| `--citation_format` | string | `numbered` | 引用格式：`numbered` / `mla` / `apa` / `chicago` |
| `--output_length` | string | - | 报告长度：`short` / `standard` / `long` |
| `--include_domains` | array | - | 优先使用的来源域名（最多 20 个，host 匹配含子域） |
| `--exclude_domains` | array | - | 排除的来源域名（最多 20 个，只向下匹配子域） |
| `--wait` | boolean | `true` | 是否自动轮询直到任务完成；`--no-wait` 仅创建任务 |
| `--wait_timeout` | number | `300` | 最大等待秒数，超时返回 `request_id` 供后续查询 |

## research get 子命令

```bash
tavily research get <request_id> [--json]
```

查询已创建任务的状态与结果。状态取值：`pending` → `in_progress` → `completed` / `failed`。

## 响应结构

创建任务（`--no-wait`）：

```json
{
  "request_id": "uuid",
  "status": "pending",
  "input": "研究问题",
  "model": "mini",
  "created_at": "2026-01-15T10:30:00Z"
}
```

任务完成（实测字段，2026-08，两次独立实测）：

```json
{
  "request_id": "uuid",
  "status": "completed",
  "content": "# 研究报告 markdown 内容...",
  "sources": [{ "url": "https://...", "title": "来源标题", "favicon": "https://..." }],
  "created_at": "2026-01-15T10:30:00Z"
}
```

> ⚠️ **实测注意**（两次独立实测结论）：
> - `data.sources` 数组**存在**（每项含 `url` / `title` / `favicon`），条数与顶层 `meta.sources_count` 一致
> - 但 **`sources_count = 0` 时 `sources` 字段可能被省略**（首次实测即为该情形）。因此：有来源就交付 `data.sources`；`meta.sources_count = 0` 或字段缺失时，如实告知用户"本次报告未返回结构化来源列表"，不要编造来源
> - `data` 中**没有** `completed_at`；`sources_count` 只在 `meta` 中，不在 `data` 内

> `content` 在指定 `output_schema` 时是结构化 JSON 对象，否则是 markdown 文本。
> `--output_schema` 参数暂未在 CLI 暴露（需通过 SDK 使用结构化输出）。
