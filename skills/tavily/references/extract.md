# extract command reference

`tavily extract <urls...> [options]`

## Positional arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `urls` | array | yes | URLs to extract content from (one or more) |

## Optional arguments

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `--query` | string | - | User intent keywords used to re-rank extracted content |
| `--extract_depth` | string | `basic` | Extraction depth. `basic` (1 credit/5 URLs), `advanced` (2 credits/5 URLs, extracts more data including tables) |
| `--include_images` | boolean | `false` | Extract images from the pages |
| `--format` | string | `markdown` | Content format: `markdown` or `text` |
| `--timeout` | number | - | Extraction timeout in seconds (1-60). Defaults: basic=10s, advanced=30s when not set |

## extract_depth enum

| Value | credits | Default timeout | Description |
|-------|---------|-----------------|-------------|
| `basic` | 1/5 URLs | 10s | Basic extraction |
| `advanced` | 2/5 URLs | 30s | Deep extraction, includes tables and embedded content |

## Response structure

```json
{
  "results": [
    {
      "title": "page title",
      "url": "https://...",
      "raw_content": "extracted markdown content",
      "images": ["https://..."],
      "favicon": "https://..."
    }
  ],
  "failed_results": [
    { "url": "https://...", "error": "failure reason" }
  ],
  "response_time": 0.5,
  "request_id": "uuid"
}
```
