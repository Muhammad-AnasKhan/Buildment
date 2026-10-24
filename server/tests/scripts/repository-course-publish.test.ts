import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { unzipSync } from "fflate";
import { load as loadYaml } from "js-yaml";
import { courseSourceHash, packageZip, publishingSettings, selectedPackages } from "../../scripts/repository-course-publish.js";
import { coursesRootForServer } from "../../scripts/course-source.js";

const temporary: string[] = [];
afterEach(() => { for (const dir of temporary.splice(0)) fs.rmSync(dir, { recursive: true, force: true }); });

function course(root: string, slug: string, extra = "") {
  const dir = path.join(root, slug);
  const moduleDir = path.join(dir, "01-foundations");
  fs.mkdirSync(moduleDir, { recursive: true });
  fs.writeFileSync(path.join(dir, "course.yaml"), `slug: ${slug}\ntitle: Example\ndescription: Example course\nprojectGoal: Learn a skill\ndifficulty: Beginner\nestimatedHours: 2\n${extra}modules:\n  - dir: 01-foundations\n    title: Foundations\n    lessons:\n      - file: 01.01-start.md\n        title: Start\n        goal: Explain the start\n`);
  fs.writeFileSync(path.join(moduleDir, "01.01-start.md"), "---\ntitle: Start\n---\nA lesson.\n");
  return dir;
}

describe("repository course publishing selection", () => {
  it("finds courses beside server and in an APP_BASE release slug", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "buildment-course-layout-"));
    temporary.push(root);
    const server = path.join(root, "server");
    const courses = path.join(root, "courses");
    fs.mkdirSync(server);
    fs.mkdirSync(courses);
    fs.writeFileSync(path.join(courses, "publishing.yaml"), "instructorEmail: devweekends@gmail.com\n");
    expect(coursesRootForServer(server)).toBe(courses);
    expect(coursesRootForServer(root)).toBe(courses);
  });

  it("selects only opted-in packages and builds the ZIP expected by the import services", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "buildment-course-test-"));
    temporary.push(root);
    fs.writeFileSync(path.join(root, "publishing.yaml"), "instructorEmail: devweekends@gmail.com\n");
    course(root, "draft");
    course(root, "ready", "repositoryPublish: true\n");
    expect(publishingSettings(root).instructorEmail).toBe("devweekends@gmail.com");
    const packages = selectedPackages(root);
    expect(packages.map(pkg => pkg.slug)).toEqual(["ready"]);
    const files = unzipSync(packageZip(packages[0]!, "update", "devweekends@gmail.com"));
    expect(Object.keys(files).sort()).toEqual(["01-foundations/01.01-start.md", "course.yaml"]);
    const manifest = loadYaml(Buffer.from(files["course.yaml"]!).toString("utf8")) as Record<string, unknown>;
    expect(manifest.publication).toBe("update");
    expect(manifest.repositoryPublish).toBe(true);
    expect(manifest.creatorEmail).toBe("devweekends@gmail.com");
    const before = courseSourceHash(packages[0]!);
    fs.appendFileSync(path.join(root, "ready", "01-foundations", "01.01-start.md"), "Another paragraph.\n");
    expect(courseSourceHash(packages[0]!)).not.toBe(before);
  });

  it("rejects a mismatched slug and refuses extra files", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "buildment-course-test-"));
    temporary.push(root);
    const dir = course(root, "ready", "repositoryPublish: true\n");
    fs.writeFileSync(path.join(dir, "course.yaml"), fs.readFileSync(path.join(dir, "course.yaml"), "utf8").replace("slug: ready", "slug: other"));
    expect(() => selectedPackages(root)).toThrow(/slug must match/);
    fs.writeFileSync(path.join(dir, "course.yaml"), fs.readFileSync(path.join(dir, "course.yaml"), "utf8").replace("slug: other", "slug: ready"));
    fs.writeFileSync(path.join(dir, "notes.txt"), "extra");
    expect(() => packageZip(selectedPackages(root)[0]!, "create", "devweekends@gmail.com")).toThrow(/Unsupported course package file/);
  });
});
