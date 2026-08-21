import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

import { buildEyeBreakReminderRelease } from "../scripts/build-eye-break-reminder-release.mjs";

function digest(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

test("Windows portable archive is deterministic and contains only the user executable", async () => {
  await mkdir(join(process.cwd(), "outputs"), { recursive: true });
  const root = await mkdtemp(join(process.cwd(), "outputs", ".eye-break-test-"));
  const packageRoot = join(root, "packages", "eye-break-reminder");
  const executablePath = join(root, "fixture.exe");
  const executable = Buffer.from("synthetic-windows-executable", "utf8");
  try {
    await mkdir(join(packageRoot, "source"), { recursive: true });
    await writeFile(join(packageRoot, "source", "package.json"), JSON.stringify({ version: "0.1.0-candidate.6" }), "utf8");
    await writeFile(executablePath, executable);
    await writeFile(join(packageRoot, "release-manifest.json"), `${JSON.stringify({
      schemaVersion: 1,
      status: "public-candidate",
      release: {
        slug: "eye-break-reminder",
        name: "护眼提醒",
        type: "Tool",
        packageMode: "Standalone",
        version: "v0.1.0-candidate.6",
        archiveName: "eye-break-reminder-v0.1.0-candidate.6.zip",
        source: "source",
        userExecutableName: "护眼提醒.exe",
        executable: {
          file: "eye-break-reminder-0.1.0-candidate.6-x64.exe",
          bytes: executable.length,
          sha256: digest(executable),
        },
        artifact: { bytes: 0, sha256: "pending" },
      },
    }, null, 2)}\n`, "utf8");

    const first = await buildEyeBreakReminderRelease({
      repositoryRoot: root,
      executablePath,
      outputDirectory: "outputs/first",
      verifyRecordedArtifact: false,
    });
    const second = await buildEyeBreakReminderRelease({
      repositoryRoot: root,
      executablePath,
      outputDirectory: "outputs/second",
      verifyRecordedArtifact: false,
    });
    assert.deepEqual(first.artifacts, second.artifacts);
    const firstArchive = await readFile(join(first.outputDirectory, first.artifacts[0].file));
    const secondArchive = await readFile(join(second.outputDirectory, second.artifacts[0].file));
    assert.deepEqual(firstArchive, secondArchive);
    assert.ok(firstArchive.includes(executable));
    assert.ok(firstArchive.includes(Buffer.from("护眼提醒.exe")));
    assert.ok(!firstArchive.includes(Buffer.from("source/package.json")));
    assert.ok(!firstArchive.includes(Buffer.from("README.md")));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
