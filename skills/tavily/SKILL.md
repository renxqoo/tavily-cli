---
name: tavily-cli
description: Tavily AI search and web content extraction. Use when the user wants to search the web, look up news or financial data, extract page content from a URL, crawl a site, generate a site URL map, or launch a deep research report task. Does not support image search, video search, or local file retrieval.
metadata:
  category: search
---

# Tavily AI Search & Content Extraction

## Installation

First check whether the `tavily` command is available:

```bash
which tavily && tavily --version
```

```bash
npx @renxqoo/tavily-cli install
```

## Authentication

> ⚠️ **Security red line: never hardcode the API key into code or chat logs.**
> Never write the value of `TAVILY_API_KEY` into any file, command echo, or conversation; only reference the variable itself.

A Tavily API key must be configured before use:

```bash
# Option 1: system environment variable (recommended; key never lands in project files)
export TAVILY_API_KEY=tvly-xxxx   # persist by appending to ~/.zshrc; restart WorkBuddy after changes

# Option 2: save to the local credential store (~/.tavily-cli/credentials/, readable by the current user only)
TAVILY_API_KEY=tvly-xxxx tavily auth login

# Check status (shows source only, never echoes the key)
tavily auth status --json
```

API keys start with `tvly-`; get one from the [Tavily dashboard](https://app.tavily.com).

**Agent security conventions:**
- When a key is needed, read the environment variable or `~/.tavily-cli/credentials/`; do not ask the user to paste the key into the conversation
- On auth failure, tell the user to check the env var or run `tavily auth login`; never print or store the key value
- If a key may be leaked, advise the user to revoke and recreate it at the Tavily dashboard

## Commands

| Operation | Command |
|-----------|---------|
| Search the web with Tavily AI | `tavily search <query> [--search_depth <string>] [--max_results <number>] [--topic <string>] [--time_range <string>] [--start_date <string>] [--end_date <string>] [--include_answer] [--include_raw_content] [--include_images] [--include_domains <string>...] [--exclude_domains <string>...] [--country <string>]` |
| Extract web content from URLs | `tavily extract <urls> [--query <string>] [--extract_depth <string>] [--include_images] [--format <string>] [--timeout <number>]` |
| Crawl a site and extract content from multiple pages (graph traversal) | `tavily crawl <url> [--instructions <string>] [--max_depth <number>] [--max_breadth <number>] [--limit <number>] [--select_paths <string>...] [--select_domains <string>...] [--exclude_paths <string>...] [--exclude_domains <string>...] [--allow_external] [--include_images] [--extract_depth <string>] [--format <string>] [--include_favicon] [--timeout <number>] [--include_usage]` |
| Generate a site URL map (discovers links, no content extraction) | `tavily map <url> [--instructions <string>] [--max_depth <number>] [--max_breadth <number>] [--limit <number>] [--select_paths <string>...] [--select_domains <string>...] [--exclude_paths <string>...] [--exclude_domains <string>...] [--allow_external] [--timeout <number>] [--include_usage]` |
| Launch a deep research task and wait for the report (async) | `tavily research <input> [--model <string>] [--citation_format <string>] [--output_length <string>] [--include_domains <string>...] [--exclude_domains <string>...] [--wait] [--wait_timeout <number>]` |
| Save the API key from env var TAVILY_API_KEY locally | `tavily auth login` |
| Clear the locally saved Tavily API key | `tavily auth logout` |
| Check the current credential status | `tavily auth status` |
| Query a research task's status and result | `tavily research get <request_id>` |

> **Command details** (parameter ranges, enums, response structures, cost — read on demand): [search](references/search.md) · [extract](references/extract.md) · [crawl](references/crawl.md) · [map](references/map.md) · [research](references/research.md) · [auth](references/auth.md)

### Search + extract combo

```bash
# 1. Search to find relevant pages
tavily search "Rust async programming" --max_results 3 --include_answer --json

# 2. Extract the full content of the page you are interested in
tavily extract https://blog.example.com/rust-async --format markdown --json
```

### Filtered news search

```bash
# AI news from the last week, excluding some domains
tavily search "OpenAI" --topic news --time_range week --exclude_domains ads.com spam.com --json
```

### Finance search & domain filtering

```bash
# Finance/market info (topic=finance; note: financial news search, NOT real-time quotes or a professional financial data source)
tavily search "Apple stock price" --topic finance --json

# Restrict results to given domains
tavily search "react hooks" --include_domains github.com --json
```

### Site exploration: map → extract combo

```bash
# 1. Discover the site structure cheaply with map first (few credits)
tavily map https://docs.example.com --max_depth 2 --json

# 2. Extract the body of the pages you care about
tavily extract https://docs.example.com/api --json
```

> When the site structure is unknown, prefer `map` before `crawl` — it costs less.

### Deep research (async task)

```bash
# Option 1: auto-poll until the report is ready (default behavior)
tavily research "AI agent ecosystem in 2026" --model pro --json

# Option 2: create the task only, query it later (good for long tasks, non-blocking)
tavily research "quantitative trading strategy comparison" --model mini --no-wait --json
tavily research get <request_id> --json
```

> Research tasks run asynchronously after creation: `mini` is the fastest model (~1-2 min), `pro` is more thorough but slower.
> Auto-polling is the default (`--wait`); use `--wait_timeout <seconds>` to cap the wait — on timeout it returns a `request_id` for later queries.

## Prerequisites

- API key configured: `tavily auth status --json`
- Network access to `https://api.tavily.com`

## Error handling

**How to detect errors: on failure the command prints `{"ok":false,"error":{...}}` — classify by `error.type` / `error.subtype`** (note: the process exit code is ALWAYS 0; do not use exit codes to detect errors):

| error.type | error.subtype | Handling |
|------------|---------------|----------|
| `authentication` | `no_credentials` | Set the `TAVILY_API_KEY` env var or run `tavily auth login` |
| `authentication` | `no_token` | API key invalid or expired; check the key |
| `api` | `rate_limited` | Too many requests — **wait and retry (max 3 times, increasing intervals)** |
| `api` | `server_error` | Temporary Tavily server failure — **retry later (max 3 times)**; if still failing, tell the user the service is unavailable |
| `validation` | `invalid_argument` | Bad argument; check `--help` for the command |
| `network` | any | Network issue; check the connection and retry (max 3 times) |

**Partial-failure degradation (do not fail wholesale; keep the parts that succeeded):**
- `extract` with multiple URLs partially failing: returns `results` (successful items) + `failed_results` (failed items with reasons); report only the failed URLs and deliver the successful content normally
- `research` auto-poll timeout (`--wait_timeout`): returns a `request_id`; query it later with `tavily research get <request_id> --json` — do NOT re-create the task
- `crawl` timeout or partial page failures: return the pages already crawled; do NOT re-crawl missing pages (re-crawling charges credits again)

**Recovery actions must be bounded and deterministic**: never retry more than 3 times; after that, stop and honestly report the error (`error.message`) to the user — no infinite retries.

## Notes

- `--json` is mandatory for agent calls — it guarantees structured JSON output
- `advanced` search/extract depth costs 2 credits (other modes cost 1); use the default depth when cost-sensitive
- When the site structure is unknown, prefer `map` (cheap discovery) then `extract` the chosen pages — avoid the higher cost of direct `crawl`
