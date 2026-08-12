# map command reference

`tavily map <url> [options]`

Traverses a website like a graph but **discovers URLs only — no content extraction** (use extract or crawl for content). Cheaper than crawl; ideal for probing a site's structure first.

## Positional arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | yes | Root URL to map |

## Optional arguments

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `--instructions` | string | - | Natural-language instructions for the crawler (doubles the cost) |
| `--max_depth` | number | `1` | Maximum map depth (1-5) |
| `--max_breadth` | number | `20` | Max links followed per level (1-500) |
| `--limit` | number | `50` | Total URL cap processed before stopping (>=1) |
| `--select_paths` / `--select_domains` | array | - | Regex filters for included paths/domains |
| `--exclude_paths` / `--exclude_domains` | array | - | Regex filters for excluded paths/domains |
| `--allow_external` | boolean | `true` | Include external-domain links in results |
| `--timeout` | number | `150` | Map timeout in seconds (10-150) |
| `--include_usage` | boolean | `false` | Include credit usage in the response |

## Response structure

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
