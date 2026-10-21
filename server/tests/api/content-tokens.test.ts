import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
import { createSession } from "../../src/services/auth/session.js";
import { createCourseFixture, QUIZ_CONFIG } from "../helpers/fixtures.js";

// %%product.name%% placeholders: each learner reads their variant's product,
// storage keeps the token, and publish refuses tokens where they cannot vary.

const app = createApp();
let fx: Awaited<ReturnType<typeof createCourseFixture>>;
let mentorToken = "";
const SNAPSHOT = "# A\n\nOpen your %%product.name%% vendor dashboard.";

beforeAll(async () => {
  fx = await createCourseFixture();
  await prisma.course.update({ where: { id: fx.course.id }, data: { familySlug: "multi-vendor-marketplace" } });
  await prisma.chapter.update({ where: { id: fx.chapterA.id }, data: { compiled: SNAPSHOT } });
  await prisma.block.update({
    where: { id: fx.quizBlock.id },
    data: { config: { ...QUIZ_CONFIG, prompt: "Which %%product.name%% table holds stock?", explanation: "%%product.name%% keeps stock per shop." } },
  });
  mentorToken = (await createSession(fx.mentor.id)).sessionToken;
});
afterAll(() => fx.cleanup());

const learner = () => ({ Authorization: `Bearer ${fx.learnerToken}` });
const mentor = () => ({ Authorization: `Bearer ${mentorToken}` });
const readChapterA = () => request(app).get(`/api/v1/courses/${fx.course.slug}/chapters/chapter-a`).set(learner());
const blockState = (auth?: Record<string, string>) => {
  const req = request(app).get(`/api/v1/blocks/${fx.quizBlock.id}/state`);
  return auth ? req.set(auth) : req;
};
const chooseVariant = (variantSlug: string) =>
  request(app).put(`/api/v1/courses/${fx.course.slug}/track/variant`).set(learner()).send({ variantSlug });

describe("placeholders in the chapter reader", () => {
  it("uses the family default product until the learner picks a variant", async () => {
    const res = await readChapterA();
    expect(res.status).toBe(200);
    expect(res.body.data.content.source).toBe("# A\n\nOpen your FreshMarket vendor dashboard.");
  });

  it("follows the chosen variant and leaves the stored snapshot untouched", async () => {
    expect((await chooseVariant("books")).status).toBe(200);
    const res = await readChapterA();
    expect(res.body.data.content.source).toBe("# A\n\nOpen your Hamesh vendor dashboard.");

    const stored = await prisma.chapter.findUniqueOrThrow({ where: { id: fx.chapterA.id } });
    expect(stored.compiled).toBe(SNAPSHOT);
  });

  it("falls back to FreshMarket for a course outside any family", async () => {
    await prisma.course.update({ where: { id: fx.course.id }, data: { familySlug: null } });
    try {
      const res = await readChapterA();
      expect(res.body.data.content.source).toBe("# A\n\nOpen your FreshMarket vendor dashboard.");
    } finally {
      await prisma.course.update({ where: { id: fx.course.id }, data: { familySlug: "multi-vendor-marketplace" } });
    }
  });
});

describe("placeholders in block state", () => {
  it("resolves the prompt for the learner's variant and the fallback for anonymous previews", async () => {
    const mine = await blockState(learner());
    expect(mine.status).toBe(200);
    expect(mine.body.data.config.prompt).toBe("Which Hamesh table holds stock?");
    expect(mine.body.data.config.correctOptionIds).toBeUndefined();

    const anon = await blockState();
    expect(anon.body.data.config.prompt).toBe("Which FreshMarket table holds stock?");
  });

  it("resolves the explanation on answer and on reload", async () => {
    const answer = await request(app).post(`/api/v1/blocks/${fx.quizBlock.id}/respond`).set(learner()).send({ selected: ["a"] });
    expect(answer.status).toBe(200);
    expect(answer.body.data.explanation).toBe("Hamesh keeps stock per shop.");

    const reload = await blockState(learner());
    expect(reload.body.data.initialState.explanation).toBe("Hamesh keeps stock per shop.");
  });
});

describe("publishing placeholders", () => {
  const saveAndPublish = async (source: string) => {
    expect((await request(app).put(`/api/v1/teach/chapters/${fx.chapterA.id}/draft`).set(mentor()).send({ source })).status).toBe(200);
    return request(app).post(`/api/v1/teach/chapters/${fx.chapterA.id}/publish`).set(mentor());
  };
  const reasons = (res: request.Response) => res.body.errors.map((e: { message: string }) => e.message).join("\n");

  it("refuses tokens in headings and unknown tokens", async () => {
    const res = await saveAndPublish("## Inside %%product.name%%\n\nHello %%project.slug%%.");
    expect(res.status).toBe(422);
    expect(reasons(res)).toMatch(/not allowed in headings/);
    expect(reasons(res)).toMatch(/Unknown placeholder %%project.slug%%/);
  });

  it("refuses tokens in answer keys", async () => {
    const res = await saveAndPublish('<Quiz id="q-tok" prompt="Pick %%product.name%%" options={[{"id":"a","label":"A"},{"id":"b","label":"B"}]} correctOptionIds={["%%product.name%%"]} />');
    expect(res.status).toBe(422);
    expect(reasons(res)).toMatch(/q-tok" uses a placeholder in "correctOptionIds"/);
  });

  it("refuses tokens in chapter titles and summaries", async () => {
    const res = await request(app)
      .patch(`/api/v1/teach/chapters/${fx.chapterA.id}/settings`)
      .set(mentor())
      .send({ title: "Build %%product.name%%", summary: null, estimatedMinutes: 10, readerMode: "DEFAULT", isMilestone: false });
    expect(res.status).toBe(422);
    expect(res.body.message).toMatch(/chapter title/);
  });

  it("publishes tokens in prose and block prompts", async () => {
    const res = await saveAndPublish("Open your %%product.name%% dashboard.");
    expect(res.status).toBe(204);
  });
});
