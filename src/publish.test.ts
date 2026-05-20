import assert from "node:assert/strict";
import { execFileSync } from "child_process";
import { describe, it } from "node:test";
import { createAndPushGitTag, getReleaseVersionTag } from "src/publish";

describe("getReleaseVersionTag", () => {
  it("normalizes valid semver input into a release tag", () => {
    assert.equal(getReleaseVersionTag("1.2.3"), "v1.2.3");
    assert.equal(getReleaseVersionTag("v1.2.3"), "v1.2.3");
  });

  it("rejects invalid and injection-shaped version input", () => {
    assert.throws(
      () => getReleaseVersionTag("1.2.3; git push origin main"),
      /Invalid release version/,
    );
  });
});

describe("createAndPushGitTag", () => {
  it("runs git tag and push using argument arrays", () => {
    const calls: Array<{ file: string; args: string[] }> = [];
    const execFile = ((file: string, args?: readonly string[]) => {
      calls.push({ file, args: [...(args ?? [])] });
      return Buffer.from("");
    }) as typeof execFileSync;

    createAndPushGitTag("v1.2.3", execFile);

    assert.deepEqual(calls, [
      { file: "git", args: ["tag", "v1.2.3"] },
      { file: "git", args: ["push", "origin", "v1.2.3"] },
    ]);
  });
});
