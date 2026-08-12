# search command reference

`tavily search <query> [options]`

## Positional arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `query` | string | yes | Search query |

## Optional arguments

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `--search_depth` | string | `basic` | Search depth. `basic` (1 credit) balances speed & relevance; `advanced` (2 credits) maximizes relevance but is slower; `fast` low latency; `ultra-fast` lowest latency |
| `--max_results` | number | `5` | Max number of results to return (0-20) |
| `--topic` | string | `general` | Search category: `general`, `news`, `finance` |
| `--time_range` | string | - | Time range: `day`/`week`/`month`/`year` (abbreviations `d`/`w`/`m`/`y` also work) |
| `--start_date` | string | - | Start date, format YYYY-MM-DD |
| `--end_date` | string | - | End date, format YYYY-MM-DD |
| `--include_answer` | boolean | `false` | Include an AI-generated answer (consumes extra credits) |
| `--include_raw_content` | boolean | `false` | Include raw page content (markdown) |
| `--include_images` | boolean | `false` | Include relevant images |
| `--include_domains` | array | - | Include only these domains (max 300) |
| `--exclude_domains` | array | - | Exclude these domains (max 150) |
| `--country` | string | - | Prioritize content from a specific country (only valid for `topic=general`) |

## search_depth enum

| Value | credits | Description |
|-------|---------|-------------|
| `basic` | 1 | Balances speed & relevance (default) |
| `advanced` | 2 | Maximum relevance, returns multiple semantic chunks |
| `fast` | 1 | Low latency, keeps good relevance |
| `ultra-fast` | 1 | Lowest latency, one NLP summary per URL |

## topic enum

| Value | Description |
|-------|-------------|
| `general` | General search (default) |
| `news` | News search; good for current events, politics, sports |
| `finance` | Finance search |

## Response structure

```json
{
  "query": "search query",
  "answer": "AI-generated answer (only with --include_answer)",
  "results": [
    {
      "title": "page title",
      "url": "https://...",
      "content": "page content summary",
      "score": 0.95,
      "raw_content": "full content (only with --include_raw_content)"
    }
  ],
  "images": [{ "url": "https://...", "description": "..." }],
  "response_time": 1.67,
  "request_id": "uuid"
}
```
