# research command reference

`tavily research <input> [options]`

Launches an **async** deep-research task: runs multiple searches, analyzes sources, and generates a cited research report.

## Positional arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `input` | string | yes | Research task or question |

## Optional arguments

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `--model` | string | `auto` | Research model: `mini` (fast & efficient, narrow questions) / `pro` (thorough, multi-angle, complex topics) / `auto` |
| `--citation_format` | string | `numbered` | Citation format: `numbered` / `mla` / `apa` / `chicago` |
| `--output_length` | string | - | Report length: `short` / `standard` / `long` |
| `--include_domains` | array | - | Preferred source domains (max 20; host match includes subdomains) |
| `--exclude_domains` | array | - | Excluded source domains (max 20; matches subdomains downward only) |
| `--wait` | boolean | `true` | Auto-poll until the task completes; `--no-wait` only creates the task |
| `--wait_timeout` | number | `300` | Max wait in seconds; on timeout returns a `request_id` for later queries |

## research get subcommand

```bash
tavily research get <request_id> [--json]
```

Query the status and result of a created task. Status values: `pending` → `in_progress` → `completed` / `failed`.

## Response structure

Task creation (`--no-wait`):

```json
{
  "request_id": "uuid",
  "status": "pending",
  "input": "research question",
  "model": "mini",
  "created_at": "2026-01-15T10:30:00Z"
}
```

Task completed (fields verified in two independent live tests, 2026-08):

```json
{
  "request_id": "uuid",
  "status": "completed",
  "content": "# research report markdown content...",
  "sources": [{ "url": "https://...", "title": "source title", "favicon": "https://..." }],
  "created_at": "2026-01-15T10:30:00Z"
}
```

> ⚠️ **Verified notes** (conclusions from two independent live tests):
> - The `data.sources` array **does exist** (each item has `url` / `title` / `favicon`), and its length matches the top-level `meta.sources_count`
> - However, **when `sources_count = 0` the `sources` field may be omitted** (that was the first test's case). So: deliver `data.sources` when sources exist; when `meta.sources_count = 0` or the field is missing, honestly tell the user "this report returned no structured source list" — do NOT fabricate sources
> - `data` has **no** `completed_at`; `sources_count` lives in `meta` only, not in `data`

> `content` is a structured JSON object when an `output_schema` is specified, otherwise markdown text.
> `--output_schema` is not yet exposed via the CLI (structured output requires the SDK).
