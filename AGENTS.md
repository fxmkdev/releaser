# AGENTS.md

Guidance for coding agents and contributors working in this repository.

## Repository Guidelines

- Use `pnpm` as the package manager.
- Target Node 24 for runtime and CI-related changes.
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
pnpm format:check
pnpm build
```

## Quality Checklist

- Run `pnpm format:check` before finishing changes that touch formatted files.
- Run `pnpm build` before finishing code changes.
- Update `README.md` or other relevant docs when behavior or usage changes.
