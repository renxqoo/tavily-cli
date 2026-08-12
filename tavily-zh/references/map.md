# map 命令详解

`tavily map <url> [options]`

像图一样遍历网站，**只发现 URL，不提取内容**（提取请用 extract 或 crawl）。成本低于 crawl，适合先探测站点结构。

## 位置参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `url` | string | 是 | 映射的根 URL |

## 可选参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `--instructions` | string | - | 爬虫的自然语言指令（启用后费用翻倍） |
| `--max_depth` | number | `1` | 最大映射深度 (1-5) |
| `--max_breadth` | number | `20` | 每层最多跟随的链接数 (1-500) |
| `--limit` | number | `50` | 停止前处理的总链接数上限 (>=1) |
| `--select_paths` / `--select_domains` | array | - | 正则筛选包含的路径/域名 |
| `--exclude_paths` / `--exclude_domains` | array | - | 正则排除的路径/域名 |
| `--allow_external` | boolean | `true` | 是否在结果中包含外部域名链接 |
| `--timeout` | number | `150` | 映射超时时间（秒，10-150） |
| `--include_usage` | boolean | `false` | 是否在响应中包含 credit 用量 |

## 响应结构

```json
{
  "base_url": "docs.example.com",
  "results": [
    "https://docs.example.com/welcome",
    "https://docs.example.com/api"
  ],
  "response_time": 1.23,
  "request_id": "uuid"
}
```
