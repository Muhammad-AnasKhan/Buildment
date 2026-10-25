import { describe, expect, it } from "vitest";
import {
  COMPONENT_CATALOG,
  FAMILIES,
  SIZE_CATALOG,
  canConnect,
  isComponentKind,
  sizesFor,
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

  it("gives every component a family and a role", () => {
    for (const def of Object.values(COMPONENT_CATALOG)) {
      expect(FAMILIES).toContain(def.family);
      expect(def.role.length).toBeGreaterThan(0);
    }
  });

  it("has an AWS family with real-style parts", () => {
    const aws = Object.values(COMPONENT_CATALOG).filter((d) => d.family === "aws").map((d) => d.kind);
    for (const kind of ["aws-alb", "aws-ec2-asg", "aws-lambda", "aws-rds", "aws-elasticache", "aws-sqs", "aws-s3", "aws-cloudfront", "aws-dynamodb"]) {
      expect(aws).toContain(kind);
    }
  });

  it("feeds every size picker from a size set that has tiers, and every dropdown default is an option", () => {
    for (const def of Object.values(COMPONENT_CATALOG)) {
      for (const p of def.properties) {
        if (p.type === "size") {
          const tiers = sizesFor(p.sizeSet ?? "generic");
          expect(tiers.length).toBeGreaterThan(0);
          expect(tiers.map((t) => t.id)).toContain(p.default);
        }
        if (p.type === "enum") expect(p.options).toContain(p.default);
        if (p.type === "toggle") expect([0, 1]).toContain(p.default);
      }
    }
  });

  it("has enough parts in every course to build a client to database request path", () => {
    for (const family of FAMILIES) {
      const roles = Object.values(COMPONENT_CATALOG).filter((d) => d.family === family).map((d) => d.role);
      expect(roles).toContain("balancer");
      expect(roles).toContain("compute");
      expect(roles).toContain("database");
    }
  });

  it("links AWS parts along the request flow", () => {
    expect(canConnect("aws-alb", "aws-ec2-asg")).toBe(true);
    expect(canConnect("aws-sqs", "aws-lambda")).toBe(true);
    expect(canConnect("aws-rds", "aws-alb")).toBe(false);
  });
});
