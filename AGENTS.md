# AGENTS.md

Guidance for coding agents and contributors working in this repository.

## Repository Guidelines

- Before starting any new work, run `git fetch origin` and base new branches and
  worktrees on the freshly fetched `origin/main`, rather than local `main`. New
  work means starting a new task or branch, not every resumed agent turn. If
  fetching fails, report the failure before proceeding from an unverified base.
  When continuing an existing PR, stay on its branch; this rule does not require
  resetting that branch or discarding local changes.
- Use `pnpm` as the package manager.
- Keep Node 24 as the minimum supported runtime, development default, and
  release-build runtime. Test consumer compatibility on Node 24 and 26, and keep
  `@types/node` on major 24.
- Keep changes focused and minimal; avoid unrelated refactors.
- Keep docs in sync when introducing new behavior, patterns, or conventions.
- Pull request titles should follow Conventional Commits because squash merges
  commonly use the PR title as the commit on `main`.
  - Format: `<type>(optional-scope): <description>`
  - Example: `fix(releaser): handle prerelease branch names`
- When the current Codex/chat thread already has an open pull request, push any
  newly applied changes to that PR branch unless explicitly instructed
  otherwise.
- After addressing a pull request review comment, resolve that conversation in
  the PR.

## Project Structure

- `src/index.ts` is the CLI entrypoint.
- `src/commands/` contains command implementations.
- `src/common.ts` contains shared release-note and versioning helpers.
- `dist/` is generated build output and should not be edited directly.

## Development Commands

```bash
pnpm install
pnpm lint:actions
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm pack --out /tmp/releaser.tgz
pnpm test:package /tmp/releaser.tgz
```

## Quality Checklist

- Run `pnpm format:check` before finishing changes that touch formatted files.
- Run `pnpm typecheck` before finishing TypeScript changes.
- Run `pnpm build` before finishing code changes.
- Run `pnpm test:package <package.tgz>` against a freshly built and packed
  package when changing consumer compatibility checks or packaging.
- Update `README.md` or other relevant docs when behavior or usage changes.
