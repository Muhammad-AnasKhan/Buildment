import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { expect, it } from "vitest";

/** Writes one chapter per fence into a temporary course and returns the audit output. */
async function auditFences(fences: string[]): Promise<string> {
  const temporary = await mkdtemp(path.join(tmpdir(), "course-audit-"));
  try {
    const module = path.join(temporary, "04-positions");
    await mkdir(module);
    await Promise.all(
      fences.map((fence, index) =>
        writeFile(path.join(module, `04.${String(index + 1).padStart(2, "0")}-chapter.md`), `Text.\n\n${fence}\n`)
      )
    );
    const run = promisify(execFile)(process.execPath, ["--import", "tsx", "scripts/audit-course-structure.ts"], {
      env: { ...process.env, COURSE_IMPORT_SOURCE: temporary },
      timeout: 15000,
    });
    // Other structural findings may set a non-zero exit; only the output matters here.
    const { stdout } = await run.catch((error: { stdout: string }) => error);
    return stdout;
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

function predict(correct: "a" | "b"): string {
  return `\`\`\`predict\nprompt: Which one?\noptions:\n  - id: a\n    label: Option one\n  - id: b\n    label: Option two\ncorrectOptionId: ${correct}\n\`\`\``;
}

function quiz(correct: number): string {
  return `\`\`\`quiz\ntype: mcq\nquestion: Pick one\noptions: [Red, Blue, Gold]\ncorrect: ${correct}\nexplanations: [One, Two, Six]\n\`\`\``;
}

it("warns when the correct prediction sits in one position across the course", async () => {
  const stdout = await auditFences(["a", "a", "a", "a", "a", "b"].map((id) => predict(id as "a" | "b")));
  expect(stdout).toContain("WARN [course]: Correct prediction option is option 1 in 5/6 prediction questions");
}, 20000);

it("does not warn on a fair spread or on too few predictions", async () => {
  const spread = await auditFences(["a", "a", "a", "a", "b", "b"].map((id) => predict(id as "a" | "b")));
  expect(spread).not.toContain("Correct prediction option is option");
  const few = await auditFences(["a", "a", "a", "a", "a"].map((id) => predict(id as "a" | "b")));
  expect(few).not.toContain("Correct prediction option is option");
}, 40000);

it("warns when the correct quiz answer sits in one position across the course", async () => {
  const skewed = await auditFences([2, 2, 2, 2, 2, 0].map(quiz));
  expect(skewed).toContain("WARN [course]: Correct quiz option is option 3 in 5/6 quiz questions");
  const spread = await auditFences([0, 1, 2, 0, 1, 2].map(quiz));
  expect(spread).not.toContain("Correct quiz option is option");
}, 40000);
