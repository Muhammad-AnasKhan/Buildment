import { describe, expect, it } from "vitest";
import MESSAGES from "../../../../src/shared/engagement/mascot-messages.en.json" with { type: "json" };
import {
  DEFAULT_MASCOT_ID,
  MASCOT_AREA_MAP,
  MASCOT_ROLE_MAP,
  MASCOTS,
  PAGE_AREAS,
  resolveMascot,
} from "../../../../src/shared/engagement/mascots.js";
import { ENGAGEMENT_RULES } from "../../../../src/shared/engagement/rules.js";

// Guards for the editable data (mascot-messages.en.json, MASCOTS and the casting maps), so a
// wording or casting change that would show a blank bubble, an overflowing line or the wrong pose
// fails here instead.

/** Longest line the speech bubble shows without wrapping past two lines on a phone. */
const MAX_LINE_LENGTH = 60;

describe("mascot messages", () => {
  it("has lines for every rule and no lines for rules that do not exist", () => {
    const ruleIds = ENGAGEMENT_RULES.map((rule) => rule.id);
    expect(new Set(ruleIds).size, "rule ids are unique").toBe(ruleIds.length);
    expect(Object.keys(MESSAGES).sort()).toEqual([...ruleIds].sort());
  });

  it("gives each rule the lines mascot-messages.en.json lists under its id", () => {
    for (const rule of ENGAGEMENT_RULES) expect(rule.messages, rule.id).toEqual(MESSAGES[rule.id as keyof typeof MESSAGES]);
  });

  it("keeps every line short, trimmed and distinct within its rule", () => {
    for (const [id, lines] of Object.entries(MESSAGES)) {
      expect(new Set(lines).size, `${id} repeats a line`).toBe(lines.length);
      for (const line of lines) {
        expect(line.trim(), `${id}: "${line}"`).toBe(line);
        expect(line.length, `${id}: "${line}"`).toBeGreaterThan(0);
        expect(line.length, `${id}: "${line}"`).toBeLessThanOrEqual(MAX_LINE_LENGTH);
      }
    }
  });
});

describe("mascot casting", () => {
  const cast = [
    ...ENGAGEMENT_RULES.flatMap((rule) => (rule.mascot ? [`rule ${rule.id}`, rule.mascot] : [])),
    ...Object.entries(MASCOT_ROLE_MAP).map(([role, id]) => [`role ${role}`, id]),
    ...Object.entries(MASCOT_AREA_MAP).map(([area, id]) => [`area ${area}`, id]),
    ["default", DEFAULT_MASCOT_ID],
  ];

  it("only names registered mascots (a typo would silently fall back)", () => {
    for (const [where, id] of cast) expect(MASCOTS[id!], `${where} names "${id}"`).toBeDefined();
  });

  it("registers each mascot under its own id", () => {
    for (const [key, mascot] of Object.entries(MASCOTS)) expect(mascot.id).toBe(key);
  });

  it("shows every rule's own pose on every page, never the idle fallback", () => {
    for (const rule of ENGAGEMENT_RULES) {
      for (const area of [null, ...PAGE_AREAS]) {
        const resolved = resolveMascot({ role: rule.role, state: rule.state, mascot: rule.mascot, area });
        expect(resolved.state, `${rule.id} in ${area ?? "no area"}`).toBe(rule.state);
      }
    }
  });

  it("keeps each mascot's images in its own folder, with alt text", () => {
    for (const mascot of Object.values(MASCOTS)) {
      for (const [state, asset] of Object.entries(mascot.states)) {
        expect(asset.image, `${mascot.id} ${state}`).toMatch(new RegExp(`^/mascots/${mascot.id}/[\\w-]+\\.(svg|png|webp)$`));
        expect(asset.alt.trim(), `${mascot.id} ${state}`).not.toBe("");
      }
    }
  });
});
