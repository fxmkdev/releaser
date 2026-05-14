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
latest `v*` Git tag. Pass `--release` to force a stable release version.

`get-release-notes` prints generated release notes for commits since the latest
release tag.

`publish <newVersion>` creates and pushes a `v<newVersion>` Git tag, then
creates a GitHub release. Pass `--draft` to create the release as a draft.

## Environment

`publish` expects these environment variables:

- `GITHUB_TOKEN`: token with permission to create releases and push tags.
- `GITHUB_REPOSITORY`: repository in `owner/name` form.

The GitHub Actions release workflow also expects an `NPM_TOKEN` repository
secret with permission to publish the package to npm.

`get-version` also reads `GITHUB_HEAD_REF` when available to derive prerelease
tags for pull request builds.

## Development

Use Node 24 or newer.

```sh
pnpm install
pnpm format:check
pnpm build
```

The package is built with `pkgroll` and published as the `releaser` binary.
