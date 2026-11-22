# @fxmk/releaser

Release tooling for Felix Mokross packages.

Requires Node 24 or newer. Consumer compatibility is tested on Node 24 and 26.

## Usage

Install the package in a repository that uses Git tags for releases:

```sh
pnpm add -D @fxmk/releaser
```

Then run the CLI:

```sh
pnpm releaser get-version
pnpm releaser get-release-notes
pnpm releaser publish 0.5.1
```

## Commands

`get-version` prints JSON describing the next version based on commits since the
latest `v*` Git tag. Pass `--release` to force a stable release version. Commits
with `!release` in the body also request a stable release.

`get-release-notes` prints generated release notes for commits since the latest
release tag.

`publish <newVersion>` creates and pushes a `v<newVersion>` Git tag, then
creates a published GitHub release. Pass `--draft` to create the release as a
draft.

## Environment

`publish` expects these environment variables:

- `GITHUB_TOKEN`: token with permission to create releases and push tags.
- `GITHUB_REPOSITORY`: repository in `owner/name` form.

The GitHub Actions release workflow publishes to npm with Trusted Publishing, so
it does not require an `NPM_TOKEN` repository secret. It creates a release on
`main` when `get-version` detects a `!release` commit marker. For manual
workflow runs, enable the `force_release` input to force a release even without
that marker.

`get-version` also reads `GITHUB_HEAD_REF` when available to derive prerelease
tags for pull request builds.

## Development

Use Node 24 and the pnpm 12 version pinned in `package.json` for development and
release builds. Keep `@types/node` on major 24 to match the minimum runtime.

The lockfile includes pnpm's version and platform binaries alongside the project
dependencies. Build permissions and dependency overrides remain configured in
`pnpm-workspace.yaml`, with esbuild's install scripts disabled.

```sh
pnpm install --frozen-lockfile
pnpm lint:actions
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm pack --out /tmp/releaser.tgz
pnpm test:package /tmp/releaser.tgz
```

The package is built with `pkgroll` and published as the `releaser` binary.

CI runs workflow lint, formatting, typecheck, and builds on Node 24.
Compatibility jobs run unit tests on Node 24 and 26 and install the same
Node-24-built tarball into temporary consumer projects with production
dependencies only. They check CLI help, version calculation, and release-note
generation against local Git fixtures. Both compatibility jobs must pass before
the Node 24 release job runs.
