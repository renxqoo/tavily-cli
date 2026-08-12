# Tavily CLI

**English | [简体中文](./README.zh-CN.md)**

[![npm version](https://img.shields.io/npm/v/@renxqoo/tavily-cli?color=blue&logo=npm)](https://www.npmjs.com/package/@renxqoo/tavily-cli)
[![npm license](https://img.shields.io/npm/l/@renxqoo/tavily-cli?color=blue)](./LICENSE)
[![node](https://img.shields.io/node/v/@renxqoo/tavily-cli?color=blue&logo=node.js)](https://nodejs.org)
[![CI](https://github.com/renxqoo/tavily-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/renxqoo/tavily-cli/actions/workflows/ci.yml)
[![bundle size](https://img.shields.io/badge/bundle-~24KB-zero--deps-success)](#tech-stack)

A Tavily AI **search & web-content extraction** CLI, purpose-built for AI agents. Search the web, extract pages, crawl whole sites, map URLs, and launch deep-research tasks — all with unified JSON output that agents can consume directly.

- 🔎 **Search** · 📄 **Extract** · 🕸️ **Crawl** · 🗺️ **Map** · 🔬 **Research**
- 🤖 Ships a bundled **Skill** so AI agents can self-discover and call the right command
- 🔑 API-key auth via env var **or** a local credential store (the key is never echoed)
- 📦 **Zero runtime dependencies** — fully bundled & minified into a single ~24 KB file

## Table of contents

- [Features](#features)
- [Installation](#installation)
- [Authentication](#authentication)
- [Common commands](#common-commands)
- [Output format](#output-format)
- [Command reference](#command-reference)
- [Development](#development)
- [Tech stack](#tech-stack)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Search** (`search`) — natural-language web search with general, news, and finance categories
- **Extract** (`extract`) — extract page content from URLs (markdown or plain text)
- **Crawl** (`crawl`) — graph-traversal site crawl extracting multiple pages
- **Map** (`map`) — generate a site URL map (discovers links only, no content extraction)
- **Research** (`research`) — launch async deep-research tasks producing cited reports
- **Structured output** — unified JSON by default; agents can consume it directly
- **API key auth** — environment variable or local persisted credential store

## Installation

Requires **Node.js >= 20**.

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

For the full set of flags per command, run `tavily <command> --help`, or see the bundled [`skills/tavily/references/`](./skills/tavily/references).

## Development

This project uses [pnpm](https://pnpm.io) (see `pnpm-lock.yaml`). Node.js >= 20 required.

```bash
pnpm install          # install dependencies
pnpm run lint         # oxlint — linter
pnpm run format       # oxfmt — formatter (write)
pnpm run format:check # oxfmt — check formatting without writing
pnpm run typecheck    # tsc --noEmit — type check
pnpm run test         # vitest — runs smoke tests (builds dist/ first via pretest)
pnpm run build        # tsup bundle: single-file dist/index.js (minified, fully bundled, ~24KB)
```

Run the locally built CLI without installing globally:

```bash
node ./dist/index.js --help
TAVILY_API_KEY=tvly-xxxx node ./dist/index.js search "hello" --json
```

Git hooks (via [husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/lint-staged/lint-staged)) run automatically:

- **pre-commit** — lints & formats staged files (`oxlint --fix` + `oxfmt --write`)
- **pre-push** — runs `typecheck` + `test`

## Tech stack

- [Tavily AI API](https://docs.tavily.com) — search & extraction backend
- [@renxqoo/agent-data-cli](https://www.npmjs.com/package/@renxqoo/agent-data-cli) — Agent-native CLI framework (with install wizard, inlined at build time)
- [tsup](https://tsup.gg) — build tool (esbuild wrapper, minify + tree-shaking)

## Contributing

Contributions are welcome! `main` is a protected branch — all changes land via pull request.

See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for setup, project structure, and the release process, and the [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

[MIT](./LICENSE) © [renxqoo](https://github.com/renxqoo)
