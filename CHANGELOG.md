# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.1] - 2026-08-12

### Added

- Open-source scaffolding: `LICENSE` (MIT), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, issue/PR templates.
- Tooling: [oxlint](https://oxc.rs) (lint), [oxfmt](https://oxc.rs) (format), [vitest](https://vitest.dev) (tests), and [husky](https://typicode.github.io/husky) + [lint-staged](https://github.com/lint-staged/lint-staged) git hooks.
- CLI smoke tests under `tests/`.
- GitHub Actions CI: lint → format check → typecheck → test → build on Node 20 & 22.

### Changed

- Standardized on **pnpm** (`pnpm-lock.yaml`); removed the stale `package-lock.json`.
- `package.json`: added `license`, `author`, `repository`, `homepage`, `bugs`, `keywords`, `packageManager`, and dev scripts.
- README (EN/中文) rewritten with badges, table of contents, and dev/contributing sections.

### Removed

- Dead code: unused `existsSync` import and unreferenced `DEFAULT_WAIT_TIMEOUT_MS` constant.

## [1.0.0] - 2026-08-12

### Added

- `search` — natural-language web search with `general`, `news`, and `finance` topics.
- `extract` — extract page content from URLs as markdown or plain text.
- `crawl` — bounded graph-traversal site crawl.
- `map` — generate a site URL map (link discovery only).
- `research` — async deep-research tasks with cited reports (`--no-wait` + `research get`).
- `auth` subcommands: `login`, `logout`, `status` (credential source only, never echoes the key).
- `skills` subcommands: `list`, `sync` — ship a bundled Skill and sync it to AI tool directories.
- One-shot `tavily install` wizard for CLI + Skill + credential setup.
- Unified JSON output (`--json`) by default for agent consumption; `auto` detects TTY/CI.

[Unreleased]: https://github.com/renxqoo/tavily-cli/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/renxqoo/tavily-cli/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/renxqoo/tavily-cli/releases/tag/v1.0.0
