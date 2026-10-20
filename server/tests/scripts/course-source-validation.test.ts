import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { expect, it } from "vitest";

it("source validation accepts activity-only quizzes and reports mixed quiz content", async () => {
  const temporary = await mkdtemp(path.join(tmpdir(), "quiz-validation-"));
  try {
    const module = path.join(temporary, "01-introduction");
    await mkdir(module);
    const quiz = '```quiz\ntype: mcq\nquestion: Pick one\noptions: [One, Two]\ncorrect: 0\n```';
    await writeFile(path.join(module, "01.01-quiz.md"), quiz);
    await writeFile(path.join(module, "01.02-quiz.md"), `Read this explanation first.\n\n${quiz}`);
    await expect(promisify(execFile)(process.execPath, ["--import", "tsx", "scripts/validate-course-source.ts"], {
      env: { ...process.env, COURSE_IMPORT_SOURCE: temporary }, timeout: 15000,
    })).rejects.toMatchObject({ stdout: expect.stringContaining("Validated 2 chapters: 1 OK, 1 failed") });
  } finally { await rm(temporary, { recursive: true, force: true }); }
}, 20000);
