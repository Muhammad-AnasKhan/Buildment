import { describe, expect, it } from "vitest";
import {
  COMPONENT_CATALOG,
  SIZE_CATALOG,
  canConnect,
  isComponentKind,
} from "@/lab/catalog";

describe("component catalog", () => {
  it("gives every component at least one port and every property a default and unit", () => {
    for (const def of Object.values(COMPONENT_CATALOG)) {
      expect(def.ports.length).toBeGreaterThan(0);
      for (const property of def.properties) {
        expect(property.default).toBeDefined();
        expect(property.unit.length).toBeGreaterThan(0);
        if (property.type === "count" || property.type === "ratio") {
          expect(typeof property.min).toBe("number");
          expect(typeof property.max).toBe("number");
        }
      }
    }
  });

  it("names only real component kinds in every port's accepts list", () => {
    for (const def of Object.values(COMPONENT_CATALOG)) {
      for (const port of def.ports) {
        for (const kind of port.accepts) {
          expect(isComponentKind(kind)).toBe(true);
        }
      }
    }
  });

  it("has well-formed size tiers", () => {
    expect(SIZE_CATALOG.length).toBeGreaterThan(0);
    for (const tier of SIZE_CATALOG) {
      expect(tier.vcpu).toBeGreaterThan(0);
      expect(tier.pricePerHour).toBeGreaterThan(0);
      expect(tier.capacityRule.length).toBeGreaterThan(0);
    }
  });

  it("lets a request path connect through ports but refuses an illegal link", () => {
    expect(canConnect("app-server", "database")).toBe(true);
    expect(canConnect("database", "client")).toBe(false);
  });
});
