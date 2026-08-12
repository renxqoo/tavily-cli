# crawl command reference

`tavily crawl <url> [options]`

Crawls a site with graph traversal and extracts content in parallel — **synchronous mode** (the request stays connected until the crawl finishes, up to `--timeout` seconds).

## Positional arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | yes | Root URL to crawl |

## Optional arguments

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `--instructions` | string | - | Natural-language instructions for the crawler (doubles the cost: 1 → 2 credits/10 pages) |
| `--max_depth` | number | `1` | Maximum crawl depth (1-5) |
| `--max_breadth` | number | `20` | Max links followed per level (1-500) |
| `--limit` | number | `50` | Total URL cap processed before stopping (>=1) |
| `--select_paths` | array | - | Crawl only URLs matching these regex paths, e.g. `/docs/.*` |
| `--select_domains` | array | - | Crawl only domains/subdomains matching regex, e.g. `^docs\.example\.com$` |
| `--exclude_paths` | array | - | Exclude URLs matching these regex paths, e.g. `/private/.*` |
| `--exclude_domains` | array | - | Exclude domains/subdomains matching regex |
| `--allow_external` | boolean | `true` | Include external-domain links in results |
| `--include_images` | boolean | `false` | Include images in crawl results |
| `--extract_depth` | string | `basic` | Extraction depth: `basic` (1 credit/5) / `advanced` (2 credits/5) |
| `--format` | string | `markdown` | Content format: `markdown` / `text` |
| `--include_favicon` | boolean | `false` | Include a favicon for each result |
| `--timeout` | number | `150` | Crawl timeout in seconds (10-150) |
| `--include_usage` | boolean | `false` | Include credit usage in the response |

## Response structure

```json
{
  "base_url": "https://docs.example.com",
  "results": [
    { "url": "https://...", "raw_content": "# markdown content", "favicon": "https://..." }
  ],
  "response_time": 4.5,
  "request_id": "uuid"
}
```
