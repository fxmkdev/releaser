import { execFileSync } from "child_process";
import semver from "semver";

export function getReleaseVersionTag(newVersion: string) {
  const parsedVersion = semver.parse(newVersion);
  if (!parsedVersion) {
    throw new Error(`Invalid release version: ${newVersion}`);
  }

  const buildMetadata =
    parsedVersion.build.length > 0 ? `+${parsedVersion.build.join(".")}` : "";

  return `v${parsedVersion.version}${buildMetadata}`;
}

export function createAndPushGitTag(
  newVersionTag: string,
  execFile: typeof execFileSync = execFileSync,
) {
  execFile("git", ["tag", newVersionTag], { stdio: "inherit" });
  execFile("git", ["push", "origin", newVersionTag], { stdio: "inherit" });
}
