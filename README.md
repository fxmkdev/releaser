# @fxmk/releaser

Release tooling for Felix Mokross packages.

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

Use Node 24 or newer.

```sh
pnpm install
pnpm lint:actions
pnpm format:check
pnpm build
```

The package is built with `pkgroll` and published as the `releaser` binary.
