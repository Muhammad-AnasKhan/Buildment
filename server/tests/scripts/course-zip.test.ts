import { describe, expect, it } from "vitest";
import { strToU8, zipSync } from "fflate";
import { readCourseZip } from "../../src/services/teach/course-import.js";

const zip = (files: Record<string, Uint8Array>) => Buffer.from(zipSync(files));

describe("course ZIP boundaries", () => {
  it("accepts a root course and a single wrapper folder", () => {
    for (const prefix of ["", "my-course/"]) {
      const files = readCourseZip(zip({ [`${prefix}course.yaml`]: strToU8("slug: example"), [`${prefix}01-start/01.01-set-the-scene.md`]: strToU8("Hello") }));
      expect(Object.keys(files)).toEqual(["course.yaml", "01-start/01.01-set-the-scene.md"]);
    }
  });
  it.each(["../escape.md", "/absolute.md", "C:/drive.md", "folder\\escape.md"])("rejects unsafe path %s", name => {
    expect(() => readCourseZip(zip({ "course.yaml": strToU8("slug: example"), [name]: strToU8("bad") }))).toThrow(/unsafe path/);
  });
  it("rejects invalid archives, missing metadata, multiple courses and unsupported files", () => {
    expect(() => readCourseZip(Buffer.from("not a zip"))).toThrow();
    expect(() => readCourseZip(zip({ "README.md": strToU8("x") }))).toThrow(/exactly one/);
    expect(() => readCourseZip(zip({ "a/course.yaml": strToU8("x"), "b/course.yaml": strToU8("x") }))).toThrow(/exactly one/);
    expect(() => readCourseZip(zip({ "course.yaml": strToU8("x"), "run.js": strToU8("x") }))).toThrow(/Unsupported/);
  });
  it("rejects compression bombs before extraction", () => {
    expect(() => readCourseZip(zip({ "course.yaml": new Uint8Array(21 * 1024 * 1024) }))).toThrow(/20 MB/);
  });
});
