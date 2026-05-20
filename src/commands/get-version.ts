import { execSync } from "child_process";
import { program } from "commander";
import { getConfig, getRawCommits, getLastReleaseVersionTag } from "src/common";
import { getVersionInfo } from "src/version";

program
  .command("get-version")
  .option("-r, --release", "Create a release version")
  .action(async (options) => {
    const lastReleaseVersionTag = getLastReleaseVersionTag();
    const config = await getConfig(lastReleaseVersionTag);
    const commitsSinceLastVersion = await getRawCommits(lastReleaseVersionTag);

    console.log(
      JSON.stringify(
        getVersionInfo({
          branchName: getBranchName(),
          config,
          githubHeadRef: process.env.GITHUB_HEAD_REF,
          isReleaseRequested: !!options.release,
          lastReleaseVersionTag,
          rawCommits: commitsSinceLastVersion,
          sha: getHeadCommitSha(),
        }),
        null,
        2,
      ),
    );
  });

function getHeadCommitSha() {
  return execSync(`git rev-parse --short HEAD`).toString().trim();
}

function getBranchName() {
  return execSync(`git rev-parse --abbrev-ref HEAD`).toString().trim();
}
