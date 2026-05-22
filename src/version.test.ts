import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { RawGitCommit, ResolvedChangelogConfig } from "changelogen";
import {
  determineNewReleaseVersion,
  getVersionInfo,
  sanitizePrereleaseBranchName,
} from "src/version";

const config = {
  types: {
    feat: { title: "Enhancements", semver: "minor" },
    fix: { title: "Fixes", semver: "patch" },
    chore: { title: "Chore" },
  },
  scopeMap: {},
} as unknown as ResolvedChangelogConfig;

describe("getVersionInfo", () => {
  it("returns the current release version when there are no unreleased commits", () => {
    assert.deepEqual(
      getVersionInfo({
        branchName: "feature/example",
        config,
        isReleaseRequested: false,
        lastReleaseVersionTag: "v1.2.3",
        rawCommits: [],
        sha: "abc1234",
      }),
      {
        version: "1.2.3",
        versionWithSha: "1.2.3-abc1234",
        isRelease: true,
        isNewRelease: false,
        releaseVersion: "1.2.3",
        prereleaseTag: null,
        sha: "abc1234",
      },
    );
  });

  it("returns a stable release when release is requested explicitly", () => {
    assert.deepEqual(
      getVersionInfo({
        branchName: "feature/example",
        config,
        isReleaseRequested: true,
        lastReleaseVersionTag: "v1.2.3",
        rawCommits: [commit("fix: handle release")],
        sha: "abc1234",
      }),
      {
        version: "1.2.4",
        versionWithSha: "1.2.4-abc1234",
        isRelease: true,
        isNewRelease: true,
        releaseVersion: "1.2.4",
        prereleaseTag: null,
        sha: "abc1234",
      },
    );
  });

  it("returns a stable release when a commit contains the release marker", () => {
    assert.deepEqual(
      getVersionInfo({
        branchName: "feature/example",
        config,
        isReleaseRequested: false,
        lastReleaseVersionTag: "v1.2.3",
        rawCommits: [commit("chore: prepare release", "ship it\n\n!release")],
        sha: "abc1234",
      }),
      {
        version: "1.2.4",
        versionWithSha: "1.2.4-abc1234",
        isRelease: true,
        isNewRelease: true,
        releaseVersion: "1.2.4",
        prereleaseTag: null,
        sha: "abc1234",
      },
    );
  });

  it("returns a prerelease version when unreleased commits are not release-ready", () => {
    assert.deepEqual(
      getVersionInfo({
        branchName: "feature_release@plan",
        config,
        isReleaseRequested: false,
        lastReleaseVersionTag: "v1.2.3",
        rawCommits: [commit("feat: add release notes")],
        sha: "abc1234",
      }),
      {
        version: "1.3.0-feature-releaseplan.1",
        versionWithSha: "1.3.0-feature-releaseplan.1-abc1234",
        isRelease: false,
        isNewRelease: false,
        releaseVersion: "1.3.0",
        prereleaseTag: "feature-releaseplan.1",
        sha: "abc1234",
      },
    );
  });

  it("uses the GitHub head ref for prerelease tags when it is available", () => {
    const versionInfo = getVersionInfo({
      branchName: "detached-head",
      config,
      githubHeadRef: "pull/request_branch",
      isReleaseRequested: false,
      lastReleaseVersionTag: "v1.2.3",
      rawCommits: [commit("fix: handle release")],
      sha: "abc1234",
    });

    assert.equal(versionInfo.prereleaseTag, "pull-request-branch.1");
    assert.equal(versionInfo.version, "1.2.4-pull-request-branch.1");
  });
});

describe("determineNewReleaseVersion", () => {
  it("uses conventional commits to select the semver bump", () => {
    assert.equal(
      determineNewReleaseVersion(
        [commit("fix: handle patch")],
        "1.2.3",
        config,
      ),
      "1.2.4",
    );
    assert.equal(
      determineNewReleaseVersion(
        [commit("feat: handle minor")],
        "1.2.3",
        config,
      ),
      "1.3.0",
    );
    assert.equal(
      determineNewReleaseVersion(
        [commit("feat!: handle major")],
        "1.2.3",
        config,
      ),
      "2.0.0",
    );
  });

  it("falls back to a patch bump for non-versioned commit types", () => {
    assert.equal(
      determineNewReleaseVersion(
        [commit("chore: update metadata")],
        "1.2.3",
        config,
      ),
      "1.2.4",
    );
  });
});

describe("sanitizePrereleaseBranchName", () => {
  it("keeps prerelease-safe characters and removes unsupported characters", () => {
    assert.equal(
      sanitizePrereleaseBranchName("feature_release@plan"),
      "feature-releaseplan",
    );
  });
});

function commit(message: string, body = ""): RawGitCommit {
  return {
    message,
    body,
    shortHash: "abc1234",
    author: {
      name: "Test Author",
      email: "test@example.com",
    },
  };
}
