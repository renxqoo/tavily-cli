# search 命令详解

`tavily search <query> [options]`

## 位置参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | string | 是 | 搜索查询词 |

## 可选参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `--search_depth` | string | `basic` | 搜索深度。`basic`(1 credit)平衡速度与相关性；`advanced`(2 credits)最高相关性但更慢；`fast`低延迟；`ultra-fast`最低延迟 |
| `--max_results` | number | `5` | 返回结果数量上限 (0-20) |
| `--topic` | string | `general` | 搜索类别：`general`(通用)、`news`(新闻)、`finance`(金融) |
| `--time_range` | string | - | 时间范围：`day`/`week`/`month`/`year`（也可用缩写 `d`/`w`/`m`/`y`） |
| `--start_date` | string | - | 起始日期，格式 YYYY-MM-DD |
| `--end_date` | string | - | 截止日期，格式 YYYY-MM-DD |
| `--include_answer` | boolean | `false` | 是否包含 AI 生成的回答（启用时消耗额外 credits） |
| `--include_raw_content` | boolean | `false` | 是否包含原始网页内容（markdown 格式） |
| `--include_images` | boolean | `false` | 是否包含相关图片 |
| `--include_domains` | array | - | 仅包含的域名列表（最多 300 个） |
| `--exclude_domains` | array | - | 排除的域名列表（最多 150 个） |
| `--country` | string | - | 优先展示指定国家的内容（仅 `topic=general` 时有效） |

## search_depth 枚举

| 值 | credits | 说明 |
|----|---------|------|
| `basic` | 1 | 平衡速度与相关性（默认） |
| `advanced` | 2 | 最高相关性，返回多个语义片段 |
| `fast` | 1 | 低延迟，保持较好相关性 |
| `ultra-fast` | 1 | 最低延迟，每 URL 返回一个 NLP 摘要 |

## topic 枚举

| 值 | 说明 |
|----|------|
| `general` | 通用搜索（默认） |
| `news` | 新闻搜索，适合时事、政治、体育等 |
| `finance` | 金融搜索 |

## 响应结构

```json
{
  "query": "搜索词",
  "answer": "AI 生成的回答（仅 --include_answer 时）",
  "results": [
    {
      "title": "页面标题",
      "url": "https://...",
      "content": "页面内容摘要",
      "score": 0.95,
      "raw_content": "完整内容（仅 --include_raw_content 时）"
    }
  ],
  "images": [{ "url": "https://...", "description": "..." }],
  "response_time": 1.67,
  "request_id": "uuid"
}
```
