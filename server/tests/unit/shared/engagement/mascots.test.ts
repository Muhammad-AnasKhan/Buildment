import { describe, expect, it } from "vitest";
import {
  MASCOT_AREA_MAP,
  MASCOT_ROLE_MAP,
  MASCOT_ROLES,
  MASCOT_STATES,
  MASCOTS,
  resolveMascot,
  type MascotDefinition,
} from "../../../../src/shared/engagement/mascots.js";

const asset = (name: string) => ({ image: `/mascots/${name}.svg`, alt: name });

const registry: Record<string, MascotDefinition> = {
  bimo: { id: "bimo", name: "Bimo", states: { idle: asset("bimo-idle"), celebrate: asset("bimo-celebrate"), help: asset("bimo-help") } },
  luma: { id: "luma", name: "Luma", states: { idle: asset("luma-idle"), celebrate: asset("luma-celebrate") } },
};
const roleMap = { guide: "bimo", celebrator: "luma", helper: "luma", supporter: "ghost", messenger: "ghost" } as const;
const casting = { registry, roleMap, areaMap: {}, defaultMascotId: "bimo" };

describe("mascot registry", () => {
  it("casts one mascot per role, with no area overrides, and bimo (the default) has every state", () => {
    expect(MASCOT_ROLE_MAP).toEqual({ guide: "bimo", celebrator: "zip", helper: "pip", supporter: "mossy", messenger: "dot" });
    expect(new Set(MASCOT_ROLES.map((role) => MASCOT_ROLE_MAP[role])).size).toBe(MASCOT_ROLES.length);
    expect(MASCOT_AREA_MAP).toEqual({});
    for (const state of MASCOT_STATES) expect(MASCOTS.bimo!.states[state]?.image).toBe(`/mascots/bimo/${state}.svg`);
  });

  it("gives every pose of every mascot a live expression and its own rig", () => {
    for (const mascot of Object.values(MASCOTS)) {
      expect(mascot.rig, mascot.id).toBe(mascot.id);
      for (const [state, asset] of Object.entries(mascot.states)) expect(asset.expression, `${mascot.id} ${state}`).toBeDefined();
    }
  });

  it("only gives the letter prop to poses that hold it", () => {
    for (const mascot of Object.values(MASCOTS)) {
      for (const [state, asset] of Object.entries(mascot.states)) {
        if (asset.expression?.prop === "letter") expect(asset.expression.arms, `${mascot.id} ${state}`).toBe("hold");
      }
    }
  });

  it("uses the mascot the role map names", () => {
    expect(resolveMascot({ role: "celebrator", state: "celebrate" }, casting)).toMatchObject({
      mascot: { id: "luma" },
      state: "celebrate",
      asset: { image: "/mascots/luma-celebrate.svg" },
    });
  });

  it("falls back to the default mascot when the cast mascot lacks the state", () => {
    expect(resolveMascot({ role: "helper", state: "help" }, casting)).toMatchObject({ mascot: { id: "bimo" }, state: "help" });
  });

  it("falls back to the default mascot when the role names an unknown mascot", () => {
    expect(resolveMascot({ role: "supporter", state: "celebrate" }, casting)).toMatchObject({ mascot: { id: "bimo" }, state: "celebrate" });
  });

  it("ends at the default mascot's idle pose when nobody has the state", () => {
    expect(resolveMascot({ role: "guide", state: "graduation" }, casting)).toMatchObject({
      mascot: { id: "bimo" },
      state: "idle",
      asset: { image: "/mascots/bimo-idle.svg" },
    });
  });

  it("casts the rule's own mascot ahead of the area and the role", () => {
    const withArea = { ...casting, areaMap: { chapter: "bimo" } };
    expect(resolveMascot({ role: "guide", state: "celebrate", mascot: "luma", area: "chapter" }, withArea)).toMatchObject({
      mascot: { id: "luma" },
    });
  });

  it("casts the area's mascot ahead of the role", () => {
    const withArea = { ...casting, areaMap: { checkout: "luma" } };
    expect(resolveMascot({ role: "guide", state: "celebrate", area: "checkout" }, withArea)).toMatchObject({ mascot: { id: "luma" } });
    expect(resolveMascot({ role: "guide", state: "celebrate", area: "chapter" }, withArea)).toMatchObject({ mascot: { id: "bimo" } });
    expect(resolveMascot({ role: "guide", state: "celebrate", area: null }, withArea)).toMatchObject({ mascot: { id: "bimo" } });
  });

  it("skips an override that is unknown or lacks the state and tries the next one", () => {
    const withArea = { ...casting, areaMap: { checkout: "luma" } };
    expect(resolveMascot({ role: "celebrator", state: "celebrate", mascot: "ghost" }, casting)).toMatchObject({ mascot: { id: "luma" } });
    expect(resolveMascot({ role: "guide", state: "help", mascot: "luma", area: "checkout" }, withArea)).toMatchObject({
      mascot: { id: "bimo" },
      state: "help",
    });
  });

  it("uses the real registry and maps when no casting is passed", () => {
    expect(resolveMascot({ role: "celebrator", state: "graduation" })).toMatchObject({
      mascot: { id: "zip" },
      state: "graduation",
      asset: { image: "/mascots/zip/graduation.svg" },
    });
    expect(resolveMascot({ role: "messenger", state: "message" })).toMatchObject({ mascot: { id: "dot" } });
  });
});
