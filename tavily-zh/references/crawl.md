# crawl 命令详解

`tavily crawl <url> [options]`

基于图遍历并行爬取站点并提取内容，**同步模式**（请求保持连接直到爬取完成，最长 `--timeout` 秒）。

## 位置参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `url` | string | 是 | 爬取的根 URL |

## 可选参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `--instructions` | string | - | 爬虫的自然语言指令（启用后费用翻倍 1→2 credits/10 页） |
| `--max_depth` | number | `1` | 最大爬取深度 (1-5) |
| `--max_breadth` | number | `20` | 每层最多跟随的链接数 (1-500) |
| `--limit` | number | `50` | 停止前处理的总链接数上限 (>=1) |
| `--select_paths` | array | - | 仅爬取匹配正则路径的 URL，如 `/docs/.*` |
| `--select_domains` | array | - | 仅爬取匹配正则的域名/子域名，如 `^docs\.example\.com$` |
| `--exclude_paths` | array | - | 排除匹配正则路径的 URL，如 `/private/.*` |
| `--exclude_domains` | array | - | 排除匹配正则的域名/子域名 |
| `--allow_external` | boolean | `true` | 是否在结果中包含外部域名链接 |
| `--include_images` | boolean | `false` | 是否在爬取结果中包含图片 |
| `--extract_depth` | string | `basic` | 提取深度：`basic`(1 credit/5 次) / `advanced`(2 credits/5 次) |
| `--format` | string | `markdown` | 内容格式：`markdown` / `text` |
| `--include_favicon` | boolean | `false` | 是否为每个结果包含 favicon |
| `--timeout` | number | `150` | 爬取超时时间（秒，10-150） |
| `--include_usage` | boolean | `false` | 是否在响应中包含 credit 用量 |

## 响应结构

```json
{
  "base_url": "https://docs.example.com",
  "results": [
    { "url": "https://...", "raw_content": "# markdown 内容", "favicon": "https://..." }
  ],
  "response_time": 4.5,
  "request_id": "uuid"
}
```
