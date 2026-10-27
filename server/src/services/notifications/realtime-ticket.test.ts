import { describe, expect, it } from "vitest";
import { signRealtimeTicket, verifyRealtimeTicket } from "./realtime-ticket.js";

describe("realtime tickets", () => {
  const claims = { sid: "session-1", uid: "user-1", exp: Date.now() + 60_000 };

  it("round-trips a valid ticket", () => {
    expect(verifyRealtimeTicket(signRealtimeTicket(claims))).toEqual(claims);
  });

  it("rejects expired, tampered and malformed tickets", () => {
    expect(verifyRealtimeTicket(signRealtimeTicket({ ...claims, exp: Date.now() - 1 }))).toBeNull();

    const [payload, signature] = signRealtimeTicket(claims).split(".");
    const forged = Buffer.from(JSON.stringify({ ...claims, uid: "someone-else" })).toString("base64url");
    expect(verifyRealtimeTicket(`${forged}.${signature}`)).toBeNull();
    expect(verifyRealtimeTicket(`${payload}.${signature}x`)).toBeNull();
    expect(verifyRealtimeTicket(`${payload}`)).toBeNull();
    expect(verifyRealtimeTicket("a.b.c")).toBeNull();
  });
});
