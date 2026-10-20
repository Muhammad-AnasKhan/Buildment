import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock("../../src/db/prisma.js", () => ({ prisma: { user: db } }));
import { requireZipImport } from "../../src/middlewares/require-zip-import.js";
const req = { user: { id: "instructor-1" } } as Request;
describe("per-user ZIP import access", () => {
  beforeEach(() => vi.clearAllMocks());
  it("rejects accounts without access", async () => {
    db.findUnique.mockResolvedValue({ zipImportEnabled: false });
    const next = vi.fn();
    await requireZipImport(req, {} as Response, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403, code: "ZIP_IMPORT_DISABLED" }));
  });
  it("allows enabled accounts and checks the current user", async () => {
    db.findUnique.mockResolvedValue({ zipImportEnabled: true });
    const next = vi.fn();
    await requireZipImport(req, {} as Response, next);
    expect(db.findUnique).toHaveBeenCalledWith({ where: { id: "instructor-1" }, select: { zipImportEnabled: true } });
    expect(next).toHaveBeenCalledExactlyOnceWith();
  });
  it("fails closed for deleted accounts", async () => {
    db.findUnique.mockResolvedValue(null);
    const next = vi.fn();
    await requireZipImport(req, {} as Response, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });
});
