import { execFileSync } from "child_process";
import semver from "semver";

export function getReleaseVersionTag(newVersion: string) {
  const normalizedVersion = semver.valid(newVersion);
  if (!normalizedVersion) {
    throw new Error(`Invalid release version: ${newVersion}`);
  }

  return `v${normalizedVersion}`;
}

export function createAndPushGitTag(
  newVersionTag: string,
  execFile: typeof execFileSync = execFileSync,
) {
  execFile("git", ["tag", newVersionTag], { stdio: "inherit" });
  execFile("git", ["push", "origin", newVersionTag], { stdio: "inherit" });
}
