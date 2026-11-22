import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

assert.equal(process.argv.length, 3, "Usage: pnpm test:package <package.tgz>");
const tarball = resolve(process.argv[2]);
const { packageManager } = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
const consumer = mkdtempSync(join(tmpdir(), "releaser-consumer-"));

function run(command, args) {
  return execFileSync(command, args, {
    cwd: consumer,
    encoding: "utf8",
  }).trim();
}

function git(...args) {
  return run("git", [
    "-c",
    "user.name=Compatibility Test",
    "-c",
    "user.email=compatibility@example.com",
    "-c",
    "commit.gpgsign=false",
    "-c",
    "tag.gpgsign=false",
    ...args,
  ]);
}

function releaser(...args) {
  return run("pnpm", ["--silent", "exec", "releaser", ...args]);
}

try {
  writeFileSync(
    join(consumer, "package.json"),
    JSON.stringify({
      name: "releaser-consumer",
      private: true,
      packageManager,
    }),
  );
  run("pnpm", ["add", "--prod", "--ignore-scripts", tarball]);

  const help = releaser("--help");
  assert.match(help, /get-version/);
  assert.match(help, /get-release-notes/);
  assert.match(help, /publish/);

  git("init", "--initial-branch=main");
  git(
    "remote",
    "add",
    "origin",
    "https://github.com/example/releaser-consumer.git",
  );
  git("commit", "--allow-empty", "-m", "chore: initial release");
  git("tag", "v1.0.0");
  git("commit", "--allow-empty", "-m", "fix: verify consumer compatibility");

  const version = JSON.parse(releaser("get-version", "--release"));
  assert.equal(version.version, "1.0.1");
  assert.equal(version.isRelease, true);
  assert.equal(version.isNewRelease, true);
  assert.match(releaser("get-release-notes"), /verify consumer compatibility/i);

  console.log(`Packaged CLI passed on Node ${process.versions.node}`);
} finally {
  rmSync(consumer, { recursive: true, force: true });
}
