# Contributing to Tavily CLI

Thanks for your interest in contributing! 🎉 This document covers the basics.

## Requirements

- Node.js **>= 20**
- [pnpm](https://pnpm.io) (the project's package manager — see `pnpm-lock.yaml`)
- A Tavily API key (`tvly-...`) from <https://app.tavily.com> for live testing

## Setup

```bash
git clone https://github.com/renxqoo/tavily-cli.git
cd tavily-cli
pnpm install
pnpm run build         # produces dist/index.js via tsup
```

Run the locally built CLI without installing it globally:

```bash
node ./dist/index.js --help
TAVILY_API_KEY=tvly-xxxx node ./dist/index.js search "hello" --json
```

## Development workflow

1. **Branch off `main`** — `main` is protected and only updated via pull request.
   ```bash
   git checkout -b feat/your-feature
   ```
2. **Make your changes.** Keep the style consistent with the surrounding code
   (TypeScript, ESM, no default exports unless already used).
3. **Check before pushing** (git hooks already do most of this automatically):
   ```bash
   pnpm run lint         # oxlint — must be clean
   pnpm run format:check # oxfmt — must be clean (run `pnpm run format` to fix)
   pnpm run typecheck    # tsc --noEmit — must pass with no errors
   pnpm run test         # vitest — builds dist/ then runs smoke tests
   ```
4. **Commit.** Use clear, conventional-style messages, e.g.
   `feat(research): support max_tokens`, `fix(auth): ...`, `docs: ...`.
5. **Open a pull request** against `main`. Fill in the PR template and link any
   relevant issue.

> **Git hooks** (husky + lint-staged): pre-commit lints/formats staged files;
> pre-push runs `typecheck` + `test`. To bypass a hook in an emergency, use
> `git push --no-verify` (use sparingly).
>
> **CI** runs `lint`, `format:check`, `typecheck`, and `test` on Node 20 & 22 —
> all must be green before merge.

## Project structure

```
src/
  index.ts            # CLI entry: command/namespace registration
  auth.ts             # API-key auth plugin (env + file credential store)
  commands/           # one file per top-level command (search, extract, …)
  types.ts            # shared types
skills/tavily/        # bundled Skill (SKILL.md + references/) shipped in the npm package
tsup.config.ts        # single-file, minified, zero-runtime-dep bundle
```

## Adding or changing a command

Commands are registered through the `@renxqoo/agent-data-cli` framework. Each
file in `src/commands/` exports a command definition. When you change a command's
flags or behavior, **also update the matching `skills/tavily/references/*.md`**
so the bundled Skill stays accurate for agents.

## Releasing (maintainers)

Releases are published to npm under the scoped package `@renxqoo/tavily-cli`.

```bash
pnpm run typecheck && pnpm run build   # both must pass
pnpm version patch                     # or minor / major (semver)
pnpm publish                           # prepack runs the tsup build automatically
```

Tag the release on GitHub and add an entry to [CHANGELOG.md](./CHANGELOG.md).

## Reporting bugs & proposing features

- **Bug**: open an issue using the *Bug report* template — include the command,
  expected vs. actual output, Node version, and OS.
- **Feature**: open an issue using the *Feature request* template and describe the
  use case before opening a PR.
- **Security**: do **not** open a public issue. Email **wangrenren611@gmail.com**.

## Code of Conduct

By participating you agree to abide by the [Code of Conduct](./CODE_OF_CONDUCT.md).
Be kind.
