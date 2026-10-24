// The shared component catalog for the lab platform.
//
// One place describes every block a lab can use: its ports (which blocks may
// legally connect to which), its configurable properties (with range, default
// and unit), and the illustrative instance-size catalog. The lab runtime, the
// scoring model and the authoring validator all read this file. Adding a new
// family later (k8s, AWS) means adding entries here, not changing runtime code.
//
// Prices and capacities are illustrative and dated. Use them to compare the
// shapes of designs, not to quote a real bill.

export type ComponentKind =
  | "client"
  | "dns"
  | "cdn"
  | "load-balancer"
  | "api-gateway"
  | "app-server"
  | "cache"
  | "database"
  | "queue"
  | "worker"
  | "object-storage";

export type PortDir = "in" | "out";

export interface PortDef {
  id: string;
  dir: PortDir;
  accepts: ComponentKind[];
}

export interface PropertyDef {
  id: string;
  label: string;
  type: "size" | "count" | "ratio" | "enum";
  min?: number;
  max?: number;
  step?: number;
  default: number | string;
  unit: string;
  options?: string[];
}

export interface ComponentDef {
  kind: ComponentKind;
  label: string;
  icon: string;
  ports: PortDef[];
  properties: PropertyDef[];
}

export interface SizeTier {
  id: string;
  family: "general" | "compute" | "memory";
  vcpu: number;
  memoryGb: number;
  capacityRule: string;
  pricePerHour: number;
}

const COMPONENT_KINDS: readonly ComponentKind[] = [
  "client",
  "dns",
  "cdn",
  "load-balancer",
  "api-gateway",
  "app-server",
  "cache",
  "database",
  "queue",
  "worker",
  "object-storage",
];

const KIND_SET = new Set<string>(COMPONENT_KINDS);

export function isComponentKind(value: string): value is ComponentKind {
  return KIND_SET.has(value);
}

const sizeProp = (defaultId: string): PropertyDef => ({
  id: "size",
  label: "Instance size",
  type: "size",
  default: defaultId,
  unit: "tier",
});

const countProp = (
  id: string,
  label: string,
  unit: string,
  def: number,
  min: number,
  max: number,
): PropertyDef => ({ id, label, type: "count", min, max, step: 1, default: def, unit });

const ratioProp = (id: string, label: string, def: number): PropertyDef => ({
  id,
  label,
  type: "ratio",
  min: 0,
  max: 1,
  step: 0.05,
  default: def,
  unit: "fraction",
});

export const COMPONENT_CATALOG: Record<ComponentKind, ComponentDef> = {
  client: {
    kind: "client",
    label: "Client",
    icon: "client",
    ports: [{ id: "out", dir: "out", accepts: ["dns", "cdn", "load-balancer", "api-gateway"] }],
    properties: [countProp("load", "Offered load", "req/s", 1000, 1, 10_000_000)],
  },
  dns: {
    kind: "dns",
    label: "DNS",
    icon: "dns",
    ports: [{ id: "in", dir: "in", accepts: ["client"] }],
    properties: [countProp("ttl", "Record TTL", "seconds", 300, 1, 86_400)],
  },
  cdn: {
    kind: "cdn",
    label: "CDN",
    icon: "cdn",
    ports: [
      { id: "in", dir: "in", accepts: ["client"] },
      { id: "out", dir: "out", accepts: ["load-balancer", "object-storage"] },
    ],
    properties: [ratioProp("hitRate", "Edge hit rate", 0.8)],
  },
  "load-balancer": {
    kind: "load-balancer",
    label: "Load balancer",
    icon: "load-balancer",
    ports: [
      { id: "in", dir: "in", accepts: ["client", "cdn", "api-gateway"] },
      { id: "out", dir: "out", accepts: ["app-server"] },
    ],
    properties: [sizeProp("general-small"), countProp("zones", "Zones", "zones", 1, 1, 3)],
  },
  "api-gateway": {
    kind: "api-gateway",
    label: "API gateway",
    icon: "api-gateway",
    ports: [
      { id: "in", dir: "in", accepts: ["client", "load-balancer"] },
      { id: "out", dir: "out", accepts: ["app-server", "load-balancer"] },
    ],
    properties: [sizeProp("general-small"), countProp("count", "Instances", "instances", 2, 1, 50)],
  },
  "app-server": {
    kind: "app-server",
    label: "App server",
    icon: "app-server",
    ports: [
      { id: "in", dir: "in", accepts: ["load-balancer", "api-gateway"] },
      { id: "out", dir: "out", accepts: ["cache", "database", "queue", "object-storage"] },
    ],
    properties: [
      sizeProp("compute-small"),
      countProp("count", "Instances", "instances", 2, 1, 50),
    ],
  },
  cache: {
    kind: "cache",
    label: "Cache",
    icon: "cache",
    ports: [{ id: "in", dir: "in", accepts: ["app-server", "worker"] }],
    properties: [sizeProp("memory-small"), ratioProp("hitRate", "Hit rate", 0.85)],
  },
  database: {
    kind: "database",
    label: "Database",
    icon: "database",
    ports: [{ id: "in", dir: "in", accepts: ["app-server", "worker"] }],
    properties: [
      sizeProp("memory-medium"),
      countProp("replicas", "Read replicas", "replicas", 1, 1, 9),
    ],
  },
  queue: {
    kind: "queue",
    label: "Queue",
    icon: "queue",
    ports: [
      { id: "in", dir: "in", accepts: ["app-server"] },
      { id: "out", dir: "out", accepts: ["worker"] },
    ],
    properties: [countProp("maxInFlight", "Max in flight", "messages", 1000, 1, 1_000_000)],
  },
  worker: {
    kind: "worker",
    label: "Worker",
    icon: "worker",
    ports: [
      { id: "in", dir: "in", accepts: ["queue"] },
      { id: "out", dir: "out", accepts: ["cache", "database", "object-storage"] },
    ],
    properties: [
      sizeProp("compute-small"),
      countProp("count", "Workers", "workers", 2, 1, 100),
    ],
  },
  "object-storage": {
    kind: "object-storage",
    label: "Object storage",
    icon: "object-storage",
    ports: [{ id: "in", dir: "in", accepts: ["cdn", "app-server", "worker"] }],
    properties: [countProp("capacityGb", "Capacity", "GB", 100, 1, 1_000_000)],
  },
};

export const SIZE_CATALOG: SizeTier[] = [
  { id: "general-small", family: "general", vcpu: 2, memoryGb: 8, capacityRule: "~800 req/s/vCPU at a light mix", pricePerHour: 0.1 },
  { id: "general-medium", family: "general", vcpu: 4, memoryGb: 16, capacityRule: "~800 req/s/vCPU at a light mix", pricePerHour: 0.2 },
  { id: "general-large", family: "general", vcpu: 8, memoryGb: 32, capacityRule: "~800 req/s/vCPU at a light mix", pricePerHour: 0.4 },
  { id: "general-xlarge", family: "general", vcpu: 16, memoryGb: 64, capacityRule: "~800 req/s/vCPU at a light mix", pricePerHour: 0.8 },
  { id: "compute-small", family: "compute", vcpu: 2, memoryGb: 4, capacityRule: "~1200 req/s/vCPU at a CPU-bound mix", pricePerHour: 0.12 },
  { id: "compute-medium", family: "compute", vcpu: 4, memoryGb: 8, capacityRule: "~1200 req/s/vCPU at a CPU-bound mix", pricePerHour: 0.24 },
  { id: "compute-large", family: "compute", vcpu: 8, memoryGb: 16, capacityRule: "~1200 req/s/vCPU at a CPU-bound mix", pricePerHour: 0.48 },
  { id: "compute-xlarge", family: "compute", vcpu: 16, memoryGb: 32, capacityRule: "~1200 req/s/vCPU at a CPU-bound mix", pricePerHour: 0.96 },
  { id: "memory-small", family: "memory", vcpu: 2, memoryGb: 16, capacityRule: "holds ~12 GB working set", pricePerHour: 0.15 },
  { id: "memory-medium", family: "memory", vcpu: 4, memoryGb: 32, capacityRule: "holds ~26 GB working set", pricePerHour: 0.3 },
  { id: "memory-large", family: "memory", vcpu: 8, memoryGb: 64, capacityRule: "holds ~54 GB working set", pricePerHour: 0.6 },
  { id: "memory-xlarge", family: "memory", vcpu: 16, memoryGb: 128, capacityRule: "holds ~110 GB working set", pricePerHour: 1.2 },
];

export function canConnect(from: ComponentKind, to: ComponentKind): boolean {
  const def = COMPONENT_CATALOG[from];
  return def.ports.some((port) => port.dir === "out" && port.accepts.includes(to));
}
