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

it("source validation accepts placeholders in prose and refuses them in headings, titles and answer keys", async () => {
  const temporary = await mkdtemp(path.join(tmpdir(), "token-validation-"));
  try {
    const module = path.join(temporary, "01-introduction");
    await mkdir(module);
    await writeFile(path.join(module, "01.01-prose.md"), "Open your %%product.name%% dashboard.\n");
    await writeFile(path.join(module, "01.02-heading.md"), "## Inside %%product.name%%\n\nText.\n");
    await writeFile(path.join(module, "01.03-title.md"), "---\ntitle: Build %%product.name%%\n---\n\nText.\n");
    await writeFile(path.join(module, "01.04-unknown.md"), "Hello %%project.slug%%.\n");
    const quiz = "```quiz\ntype: mcq\nquestion: Pick one\noptions: [One, Two]\ncorrect: 0\nexplanation: Fine in %%product.name%%\n```";
    await writeFile(path.join(module, "01.05-quiz.md"), quiz);
    const run = promisify(execFile)(process.execPath, ["--import", "tsx", "scripts/validate-course-source.ts"], {
      env: { ...process.env, COURSE_IMPORT_SOURCE: temporary }, timeout: 15000,
    });
    await expect(run).rejects.toMatchObject({ stdout: expect.stringContaining("Validated 5 chapters: 2 OK, 3 failed") });
    const { stdout } = await run.catch((error: { stdout: string }) => error);
    expect(stdout).toMatch(/01\.02-heading\.md: .*not allowed in headings/);
    expect(stdout).toMatch(/01\.03-title\.md: .*chapter title/);
    expect(stdout).toMatch(/01\.04-unknown\.md: Unknown placeholder %%project\.slug%%/);
  } finally { await rm(temporary, { recursive: true, force: true }); }
}, 20000);
