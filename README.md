# Tavily CLI

**English | [简体中文](https://unpkg.com/@renxqoo/tavily-cli@latest/README.zh-CN.md)**

A Tavily AI search & web-content extraction CLI, purpose-built for AI agents.

## Features

- **Search** (`search`) — natural-language web search with general, news, and finance categories
- **Extract** (`extract`) — extract page content from URLs (markdown or plain text)
- **Crawl** (`crawl`) — graph-traversal site crawl extracting multiple pages
- **Map** (`map`) — generate a site URL map (discovers links only, no content extraction)
- **Research** (`research`) — launch async deep-research tasks producing cited reports
- **Structured output** — unified JSON by default; agents can consume it directly
- **API key auth** — environment variable or local persisted credential store

## Installation

Requires Node.js >= 20.

```bash
npm install -g @renxqoo/tavily-cli
```

Or one-shot install (CLI + Skill + credential setup in a guided wizard):

```bash
npx @renxqoo/tavily-cli install
```

Verify the installation:

```bash
tavily --help
tavily skills list --json
```

> **WorkBuddy users**: the one-shot install syncs skills to generic AI tool directories (`~/.agents`, Claude/Codex/Cursor, etc.), **not** `~/.workbuddy/skills/`. Copy the skill manually if you use WorkBuddy (see the "Installation" section in `skills/tavily/SKILL.md`).

## Publishing to npm

```bash
npm login           # required before first publish (needs an npm account)
npm version patch   # bump version as needed
npm publish         # prepack runs the tsup build automatically; publishes dist/ + skills/
```

> The package name `@renxqoo/tavily-cli` is reserved; `npm publish` ships only `dist/` and `skills/` (see the `files` field in package.json) — no source code or dependencies.

## Authentication

> ⚠️ **Security red line: never hardcode the API key into code or chat logs.**
> Once a key appears in code, conversations, screenshots, or any file that would be committed to Git, consider it leaked.

Tavily API keys start with `tvly-`; get one from the [Tavily dashboard](https://app.tavily.com).

**Option 1: system environment variable (recommended)**

Configure at the OS level so the key never lands in any project file:

```bash
# macOS / Linux: append to ~/.zshrc or ~/.bashrc
echo 'export TAVILY_API_KEY=tvly-xxxx' >> ~/.zshrc
source ~/.zshrc

# Windows: System Properties → Environment Variables → User variables → New
```

> WorkBuddy users: set the key in **Settings → Environment Variables**, or use the system env var above. **Restart WorkBuddy after changing it.**

**Option 2: CLI local credential store**

```bash
TAVILY_API_KEY=tvly-xxxx tavily auth login
# Credential saved to ~/.tavily-cli/credentials/tavily.json (readable by the current user only)
```

Clear the credential:

```bash
tavily auth logout
```

### Safe usage guidelines

| ✅ Do | ❌ Don't |
|-------|---------|
| Keep the key in a system env var or the `auth login` store | Hardcode the key in code, scripts, or config files |
| Check credentials via `auth status` (shows source only, never echoes the key) | Paste the key into chats, screenshots, or documents |
| Check `.gitignore` covers the credential directory before committing | Commit `.env` / `config.json` containing the key |
| Revoke and recreate the key at the Tavily dashboard once leaked | Share one key across many environments without rotation |

> Built-in protection: `auth status` only returns the credential source (e.g. `env:TAVILY_API_KEY`) and type — it **never echoes the key itself**; logs and error messages never print the key value either.

## Common commands

```bash
# Search
tavily search "quantum computing breakthroughs" --json

# Search with an AI-generated answer
tavily search "what is RAG" --include_answer --json

# News search
tavily search "OpenAI" --topic news --json

# Domain-restricted search
tavily search "react hooks" --include_domains github.com --json

# Extract page content
tavily extract https://example.com --json

# Extract multiple URLs
tavily extract https://a.com https://b.com --format markdown --json

# Crawl a whole site (bounded depth and page count)
tavily crawl https://docs.example.com --max_depth 2 --limit 50 --json

# Generate a site URL map
tavily map https://example.com --max_depth 2 --json

# Deep research (auto-waits for the report)
tavily research "AI agent ecosystem in 2026" --model pro --json

# Create a research task only, query it later
tavily research "quantitative strategy comparison" --no-wait --json
tavily research get <request_id> --json
```

Always pass `--json` when calling from an agent or script. Success results go to stdout; errors and logs go to stderr.

## Output format

- `--json` — force unified JSON output (required for agent calls)
- `--no-json` — human-readable text output
- default `auto` — text on a TTY, JSON when piped / in CI

## Command reference

| Command | Description |
|---------|-------------|
| `tavily search <query>` | Search web content |
| `tavily extract <urls>` | Extract web content |
| `tavily crawl <url>` | Crawl a site and extract content (graph traversal) |
| `tavily map <url>` | Generate a site URL map |
| `tavily research <input>` | Launch a deep-research task |
| `tavily research get <id>` | Fetch a research task's result |
| `tavily auth login` | Save the API key locally |
| `tavily auth logout` | Clear the local API key |
| `tavily auth status` | Check credential status |
| `tavily skills list` | List bundled Skills |
| `tavily skills sync` | Sync Skills to AI tool directories |

## Development

```bash
npm install        # install dependencies
npm run typecheck  # type check
npm run build      # tsup bundle: single-file dist/index.js (minified, fully bundled, ~25KB)
npm publish        # publish to npm (prepack runs the build automatically)
```

> Built with [tsup](https://tsup.gg) (an esbuild wrapper): the framework dependency is fully bundled into `dist/index.js` and minified, so the published package has **zero runtime dependencies** (`dependencies` is empty) — users install without pulling a dependency tree. See `tsup.config.ts`.

## Tech stack

- [Tavily AI API](https://docs.tavily.com) — search & extraction backend
- [@renxqoo/agent-data-cli](https://www.npmjs.com/package/@renxqoo/agent-data-cli) — Agent-native CLI framework (with install wizard, inlined at build time)
- [tsup](https://tsup.gg) — build tool (esbuild wrapper, minify + tree-shaking)
