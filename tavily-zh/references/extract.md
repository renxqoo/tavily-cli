# extract 命令详解

`tavily extract <urls...> [options]`

## 位置参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `urls` | array | 是 | 要提取内容的 URL 列表（一个或多个） |

## 可选参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `--query` | string | - | 用于重排提取内容的用户意图关键词 |
| `--extract_depth` | string | `basic` | 提取深度。`basic`(1 credit/5 URL)、`advanced`(2 credits/5 URL，提取更多数据含表格) |
| `--include_images` | boolean | `false` | 是否提取页面中的图片 |
| `--format` | string | `markdown` | 内容格式：`markdown` 或 `text` |
| `--timeout` | number | - | 提取超时时间（秒，1-60）。不指定时 basic=10s，advanced=30s |

## extract_depth 枚举

| 值 | credits | 默认超时 | 说明 |
|----|---------|----------|------|
| `basic` | 1/5 URL | 10s | 基础提取 |
| `advanced` | 2/5 URL | 30s | 深度提取，包含表格和嵌入内容 |

## 响应结构

```json
{
  "results": [
    {
      "title": "页面标题",
      "url": "https://...",
      "raw_content": "提取的 markdown 内容",
      "images": ["https://..."],
      "favicon": "https://..."
    }
  ],
  "failed_results": [
    { "url": "https://...", "error": "错误原因" }
  ],
  "response_time": 0.5,
  "request_id": "uuid"
}
```
