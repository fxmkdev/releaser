import {
  determineSemverChange,
  RawGitCommit,
  ResolvedChangelogConfig,
} from "changelogen";
import semver from "semver";
import { filterConventionalCommits } from "src/common";

export type VersionInfo = {
  version: string;
  versionWithSha: string;
  isRelease: boolean;
  isNewRelease: boolean;
  releaseVersion: string;
  prereleaseTag: string | null;
  sha: string;
};

export function getVersionInfo({
  branchName,
  config,
  githubHeadRef,
  isReleaseRequested,
  lastReleaseVersionTag,
  rawCommits,
  sha,
}: {
  branchName: string;
  config: ResolvedChangelogConfig;
  githubHeadRef?: string;
  isReleaseRequested: boolean;
  lastReleaseVersionTag: string;
  rawCommits: RawGitCommit[];
  sha: string;
}): VersionInfo {
  const lastReleaseVersion = getReleaseVersionFromGitTag(lastReleaseVersionTag);
  const hasUnreleasedChanges = rawCommits.length > 0;
  const shouldCreateRelease =
    hasReleaseKeyword(rawCommits) || isReleaseRequested;

  const [newReleaseVersion, prereleaseTag] = getNewVersion(
    hasUnreleasedChanges,
    shouldCreateRelease,
    rawCommits,
    lastReleaseVersion,
    config,
    githubHeadRef || branchName,
  );
  const version = `${newReleaseVersion}${prereleaseTag ? `-${prereleaseTag}` : ""}`;

  return {
    version,
    versionWithSha: `${version}-${sha}`,
    isRelease: !prereleaseTag,
    isNewRelease: hasUnreleasedChanges && shouldCreateRelease,
    releaseVersion: newReleaseVersion,
    prereleaseTag,
    sha,
  };
}

export function getReleaseVersionFromGitTag(tag: string) {
  return tag.substring(1);
}

export function hasReleaseKeyword(rawCommits: RawGitCommit[]) {
  return rawCommits.some((c) => c.body.includes("!release"));
}

export function getNewVersion(
  hasUnreleasedChanges: boolean,
  isReleaseRequested: boolean,
  rawCommits: RawGitCommit[],
  lastReleaseVersion: string,
  config: ResolvedChangelogConfig,
  branchName: string,
) {
  if (!hasUnreleasedChanges) return [lastReleaseVersion, null] as const;

  const newReleaseVersion = determineNewReleaseVersion(
    rawCommits,
    lastReleaseVersion,
    config,
  );
  if (isReleaseRequested) return [newReleaseVersion, null] as const;

  return [
    newReleaseVersion,
    `${sanitizePrereleaseBranchName(branchName)}.${rawCommits.length}`,
  ] as const;
}

export function sanitizePrereleaseBranchName(branchName: string) {
  return branchName
    .replace("/", "-")
    .replace("_", "-")
    .replace(/[^a-zA-Z0-9.-]/g, "");
}

export function determineNewReleaseVersion(
  rawCommits: RawGitCommit[],
  lastVersion: string,
  config: ResolvedChangelogConfig,
) {
  const conventionalCommits = filterConventionalCommits(rawCommits, config);

  // At least the patch version will increase if there are any new commits
  const bumpType =
    determineSemverChange(conventionalCommits, config) ?? "patch";
  const bumpedVersion = semver.inc(lastVersion, bumpType);
  if (!bumpedVersion) {
    throw new Error("New version could not be determined");
  }

  return bumpedVersion;
}
