import { describe, expect, it } from "vitest";
import {
  PENDING_ENGAGEMENT_COOKIE,
  formatPendingEnrollment,
  isReadingPath,
  pageAreaFor,
  parsePendingEngagement,
  readPendingEngagementCookie,
} from "@/lib/engagement/pending-event";

describe("pending engagement cookie", () => {
  it("round-trips an enrollment", () => {
    const value = formatPendingEnrollment("cmh1abc23");
    expect(value).toBe("enrolled.cmh1abc23");
    expect(parsePendingEngagement(value)).toEqual({ type: "enrolled", courseId: "cmh1abc23" });
  });

  it("refuses ids and values it did not write", () => {
    expect(formatPendingEnrollment("x;y=z")).toBeNull();
    expect(parsePendingEngagement("course_completed.abc")).toBeNull();
    expect(parsePendingEngagement("enrolled.abc.extra")).toBeNull();
    expect(parsePendingEngagement("enrolled.")).toBeNull();
    expect(parsePendingEngagement(undefined)).toBeNull();
  });

  it("finds the cookie among others in document.cookie", () => {
    const header = `theme=dark; ${PENDING_ENGAGEMENT_COOKIE}=enrolled.course42; other=1`;
    expect(readPendingEngagementCookie(header)).toEqual({ type: "enrolled", courseId: "course42" });
    expect(readPendingEngagementCookie("theme=dark")).toBeNull();
  });
});

describe("isReadingPath", () => {
  it("is true on chapter reader pages only", () => {
    expect(isReadingPath("/courses/rust/ownership")).toBe(true);
    expect(isReadingPath("/courses/rust/ownership/")).toBe(true);
    expect(isReadingPath("/courses/rust")).toBe(false);
    expect(isReadingPath("/courses/rust/checkout")).toBe(false);
    expect(isReadingPath("/dashboard")).toBe(false);
    expect(isReadingPath("/catalog/rust")).toBe(false);
  });
});

describe("pageAreaFor", () => {
  it("names the area of each learn page", () => {
    expect(pageAreaFor("/courses/rust/ownership")).toBe("chapter");
    expect(pageAreaFor("/courses/rust/ownership/")).toBe("chapter");
    expect(pageAreaFor("/courses/rust")).toBe("course");
    expect(pageAreaFor("/courses/rust/variant")).toBe("course");
    expect(pageAreaFor("/courses/rust/checkout")).toBe("checkout");
    expect(pageAreaFor("/catalog")).toBe("catalog");
    expect(pageAreaFor("/catalog/rust")).toBe("catalog");
    expect(pageAreaFor("/dashboard")).toBe("dashboard");
    expect(pageAreaFor("/my-questions/abc")).toBe("my-questions");
    expect(pageAreaFor("/settings/profile")).toBe("settings");
  });

  it("is null for anything else", () => {
    expect(pageAreaFor("/")).toBeNull();
    expect(pageAreaFor("/courses")).toBeNull();
    expect(pageAreaFor("/courses/rust/ownership/extra")).toBeNull();
    expect(pageAreaFor("/admin")).toBeNull();
    expect(pageAreaFor("/toString")).toBeNull();
  });
});
