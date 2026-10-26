import { describe, expect, it } from "vitest";
import { COMPONENT_CATALOG, SIZE_CATALOG, kindsInFamily, type ComponentKind } from "@buildment/learning-ui/labs/catalog";
import { AWS_PARTS, AWS_PROPS, awsInstance, instanceMeaning, localize, partName, sizeLabel } from "@buildment/learning-ui/labs/aws-names";
import { labRegistry } from "@buildment/learning-ui/labs/registry";
import { LAB_SLUGS } from "@/shared/lab/slugs";

const SIZED: ComponentKind[] = ["app-server", "worker", "database", "cache", "search"];
const generic = SIZE_CATALOG.filter((t) => t.set === "generic");

describe("AWS names: parts", () => {
  it("every generic part has a name, a meaning and a remember line, and no new parts were added", () => {
    for (const kind of kindsInFamily("hld")) {
      const part = AWS_PARTS[kind];
      expect(part, kind).toBeDefined();
      expect(part!.name.length).toBeGreaterThan(3);
      expect(part!.meaning.length).toBeGreaterThan(20);
      expect(part!.remember.length).toBeGreaterThan(10);
    }
    expect(Object.keys(AWS_PARTS).sort()).toEqual(kindsInFamily("hld").sort());
  });

  it("keeps the model's own labels in generic mode and uses the service name in AWS mode", () => {
    expect(partName("cache", "generic")).toBe(COMPONENT_CATALOG.cache.label);
    expect(partName("cache", "aws")).toBe("Amazon ElastiCache for Redis");
    expect(partName("load-balancer", "aws")).toMatch(/Application Load Balancer/);
    expect(partName("queue", "aws")).toBe("Amazon SQS");
    expect(partName("aws-alb", "aws")).toBe(COMPONENT_CATALOG["aws-alb"].label);
  });

  it("renames only settings the catalog really has", () => {
    for (const [kind, props] of Object.entries(AWS_PROPS)) {
      for (const id of Object.keys(props!)) {
        expect(COMPONENT_CATALOG[kind as ComponentKind].properties.some((p) => p.id === id), `${kind}.${id}`).toBe(true);
      }
    }
  });

  it("never uses an em or en dash", () => {
    expect(JSON.stringify(AWS_PARTS) + JSON.stringify(AWS_PROPS)).not.toMatch(new RegExp(`${String.fromCharCode(0x2014)}|${String.fromCharCode(0x2013)}`));
  });
});

describe("AWS names: sizes", () => {
  it("every generic size resolves to a real instance with the same vCPU count, for every sized part", () => {
    for (const kind of SIZED) {
      for (const tier of generic) {
        const i = awsInstance(kind, tier.id);
        expect(i, `${kind} ${tier.id}`).not.toBeNull();
        expect(i!.vcpu).toBe(tier.vcpu);
        expect(i!.memoryGiB).toBeGreaterThan(0);
      }
    }
  });

  it("uses the real vCPU and memory of well-known instance types", () => {
    expect(awsInstance("app-server", "compute-small")).toEqual({ type: "c6i.large", vcpu: 2, memoryGiB: 4 });
    expect(awsInstance("app-server", "general-medium")).toEqual({ type: "m6i.xlarge", vcpu: 4, memoryGiB: 16 });
    expect(awsInstance("database", "memory-medium")).toEqual({ type: "db.r6g.xlarge", vcpu: 4, memoryGiB: 32 });
    expect(awsInstance("database", "general-small")).toEqual({ type: "db.m6g.large", vcpu: 2, memoryGiB: 8 });
    expect(awsInstance("cache", "memory-small")).toEqual({ type: "cache.r6g.large", vcpu: 2, memoryGiB: 13.07 });
  });

  it("memory matches the model's size exactly for server and database sizes", () => {
    for (const kind of ["app-server", "database"] as ComponentKind[]) {
      for (const tier of generic) {
        if (kind === "database" && tier.family === "compute") continue; // RDS has no compute class: it uses the general one
        expect(awsInstance(kind, tier.id)!.memoryGiB, `${kind} ${tier.id}`).toBe(tier.memoryGb);
      }
    }
  });

  it("leaves managed parts without an instance and says why", () => {
    expect(awsInstance("load-balancer", "general-small")).toBeNull();
    expect(sizeLabel("load-balancer", "general-small", "aws").detail).toMatch(/AWS manages this part/);
  });

  it("passes the AWS family's own sizes through with their real figures", () => {
    const tier = SIZE_CATALOG.find((t) => t.id === "t3.medium")!;
    expect(awsInstance("app-server", "t3.medium")).toEqual({ type: "t3.medium", vcpu: tier.vcpu, memoryGiB: tier.memoryGb });
  });

  it("gives every size a label and a detail in both modes", () => {
    for (const kind of SIZED) {
      for (const tier of SIZE_CATALOG) {
        for (const mode of ["generic", "aws"] as const) {
          const l = sizeLabel(kind, tier.id, mode);
          expect(l.label.length).toBeGreaterThan(0);
          expect(l.detail.length).toBeGreaterThan(0);
        }
      }
    }
    expect(sizeLabel("app-server", "compute-small", "aws").label).toBe("c6i.large");
    expect(sizeLabel("app-server", "compute-small", "aws").detail).toMatch(/Prices here are illustrative/);
  });
});

describe("AWS names: what a name means", () => {
  it("explains the family letter, the generation and the size", () => {
    expect(instanceMeaning("c6i.large")).toMatch(/compute optimised.*Generation 6.*Intel.*Size large/);
    expect(instanceMeaning("db.r6g.xlarge")).toMatch(/memory optimised.*Generation 6.*Graviton.*xlarge/);
    expect(instanceMeaning("t3.medium")).toMatch(/burstable.*credits.*Generation 3/);
    expect(instanceMeaning("m6i.2xlarge")).toMatch(/general purpose.*2xlarge/);
    expect(instanceMeaning("i3.large")).toMatch(/storage optimised/);
    expect(instanceMeaning("cache.r6g.large")).toMatch(/memory optimised/);
  });

  it("has a meaning for every instance type the table can show", () => {
    const types = new Set<string>();
    for (const kind of SIZED) for (const tier of SIZE_CATALOG) { const i = awsInstance(kind, tier.id); if (i) types.add(i.type); }
    for (const t of types) expect(instanceMeaning(t), t).not.toMatch(/model's own ladder/);
  });

  it("explains Multi-AZ, read replicas, ALB and SQS in plain words", () => {
    expect(AWS_PARTS.database!.meaning).toMatch(/Multi-AZ.*standby.*automatic failover/);
    expect(AWS_PARTS.database!.meaning).toMatch(/read replica.*serves reads/);
    expect(AWS_PARTS["load-balancer"]!.meaning).toMatch(/layer 7/);
    expect(AWS_PARTS.queue!.meaning).toMatch(/at-least-once.*visibility timeout/);
  });
});

describe("AWS names: sentences", () => {
  it("leaves a sentence alone in generic mode", () => {
    expect(localize("The app server reads the database", "generic")).toBe("The app server reads the database");
  });

  it("uses the same names in checks, reasons and the solution, with the right articles", () => {
    expect(localize("Everyone is still served when an app server dies", "aws")).toBe("Everyone is still served when an EC2 instance dies");
    expect(localize("A cache hit means the database is never asked.", "aws")).toBe("An ElastiCache hit means the RDS database is never asked.");
    expect(localize("Put a queue between the app server and the worker.", "aws")).toBe("Put an SQS queue between the EC2 instance and the worker.");
  });

  it("never doubles a name, across every solution text of every lab", () => {
    for (const slug of LAB_SLUGS) {
      const spec = labRegistry[slug];
      if (spec.family !== "hld" || !spec.solution) continue;
      const text = [spec.solution.summary, ...Object.values(spec.solution.parts).flatMap((p) => [p.why, p.without])].join(" ");
      const out = localize(text, "aws");
      expect(out).not.toMatch(/\b(ElastiCache|RDS|SQS|EC2|ALB)\s+\1\b/);
      expect(out).not.toMatch(/\b[Aa] (ElastiCache|ALB|EC2|SQS|RDS)\b/);
    }
  });
});
