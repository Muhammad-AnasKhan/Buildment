import { beforeEach, describe, expect, it, vi } from "vitest";

const redirect = vi.fn((target: string) => {
  throw new Error(`NEXT_REDIRECT:${target}`);
});
const serverApiFetch = vi.fn();

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/api-server", () => ({ serverApiFetch }));

const { ApiError } = await import("@/lib/api-client");
const { chooseCourseVariantAction } = await import("@/server/actions/course-track");

function form(variantSlug: string) {
  const data = new FormData();
  data.set("courseSlug", "ai-interview");
  data.set("variantSlug", variantSlug);
  return data;
}

describe("chooseCourseVariantAction", () => {
  beforeEach(() => {
    redirect.mockClear();
    serverApiFetch.mockReset();
  });

  it("goes to the course after a successful pick", async () => {
    serverApiFetch.mockResolvedValue({ courseSlug: "ai-interview" });
    await expect(chooseCourseVariantAction(form("field-reports"))).rejects.toThrow("NEXT_REDIRECT:/courses/ai-interview");
  });

  it("goes to the course instead of an error page when the variant is already fixed", async () => {
    serverApiFetch.mockRejectedValue(new ApiError("The variant is fixed once you start a chapter.", 409, "VARIANT_LOCKED_AFTER_START"));
    await expect(chooseCourseVariantAction(form("field-reports"))).rejects.toThrow("NEXT_REDIRECT:/courses/ai-interview");
  });

  it("still raises other failures", async () => {
    serverApiFetch.mockRejectedValue(new ApiError("Server error", 500, "INTERNAL"));
    await expect(chooseCourseVariantAction(form("field-reports"))).rejects.toThrow("Server error");
  });
});
