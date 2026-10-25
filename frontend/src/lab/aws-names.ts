// Optional AWS names for the lab's parts and sizes. This is labelling only: the
// model, the capacities and the illustrative prices are unchanged. A learner can
// switch the board to AWS names to start learning the real ones, and every name
// and size carries a one-line meaning.
//
// One table, easy to review and extend. vCPU and memory are the real figures for
// each instance type. A model size is mapped to the instance type whose vCPU
// count matches (and whose memory matches too, except for the cache, where the
// model's size is a round number and the real cache.r6g types are close). Prices
// stay the model's illustrative ones, not AWS prices.

import type { ComponentKind } from "./catalog";
import { COMPONENT_CATALOG, SIZE_CATALOG } from "./catalog";

export type NameMode = "generic" | "aws";

export interface AwsPart {
  /** The service name shown on the part. */
  name: string;
  /** What it is, in one line. */
  meaning: string;
  /** A short thing to remember. */
  remember: string;
}

export const AWS_PARTS: Partial<Record<ComponentKind, AwsPart>> = {
  client: { name: "Users", meaning: "People or apps sending requests from outside AWS.", remember: "Everything starts as a request from here." },
  dns: { name: "Amazon Route 53", meaning: "AWS's DNS: turns a name into an address, and can send users to healthy places.", remember: "Route 53 = DNS (port 53)." },
  cdn: { name: "Amazon CloudFront", meaning: "A CDN: copies of content at edge locations near users. A hit is answered at the edge.", remember: "CloudFront = CDN. Hits never reach your servers." },
  waf: { name: "AWS WAF", meaning: "A web application firewall: filters requests by rules before they reach your app.", remember: "WAF = firewall for HTTP." },
  "rate-limiter": { name: "AWS WAF rate-based rule", meaning: "A WAF rule that blocks an address sending too many requests in five minutes.", remember: "Rate-based rule = a limit per client address." },
  "load-balancer": { name: "Application Load Balancer (ALB)", meaning: "A layer 7 (HTTP) load balancer that spreads requests across servers in several zones.", remember: "ALB = layer 7, many zones, health checks. It is managed: it scales for you." },
  "api-gateway": { name: "Amazon API Gateway", meaning: "A managed front door for APIs: routing, limits and auth, billed per request.", remember: "API Gateway = managed API front door." },
  "app-server": { name: "Amazon EC2 instances", meaning: "EC2 is a virtual server you rent by the hour. An Auto Scaling group keeps several running.", remember: "EC2 = a rented server. Spread them over zones." },
  worker: { name: "EC2 or Lambda worker", meaning: "Code that takes messages off a queue. EC2 workers run all the time; Lambda runs code per message.", remember: "Workers pull from SQS and do the slow job." },
  cache: { name: "Amazon ElastiCache for Redis", meaning: "Managed Redis, kept in memory. A hit means the database is never asked.", remember: "ElastiCache = managed Redis. Answers in about a millisecond." },
  database: { name: "Amazon RDS for PostgreSQL", meaning: "Managed PostgreSQL. Multi-AZ keeps a standby in another zone with automatic failover. A read replica is an extra copy that serves reads.", remember: "Multi-AZ = survive a zone. Read replica = more reads." },
  nosql: { name: "Amazon DynamoDB", meaning: "A managed key-value database that scales on demand and is billed per request.", remember: "DynamoDB = key-value, no servers to size." },
  search: { name: "Amazon OpenSearch Service", meaning: "Managed search and analytics clusters.", remember: "OpenSearch = managed search index." },
  queue: { name: "Amazon SQS", meaning: "A managed queue. Delivery is at-least-once, and a message is hidden for a visibility timeout while a worker handles it.", remember: "SQS = queue. At-least-once: a click may repeat, never vanish." },
  stream: { name: "Amazon Kinesis Data Streams", meaning: "A managed event stream. Each shard takes about 1,000 events a second.", remember: "Kinesis = stream. Capacity is shards." },
  "object-storage": { name: "Amazon S3", meaning: "Object storage: files and blobs in buckets, very durable, billed per GB and per request.", remember: "S3 = buckets of objects." },
};

export interface AwsInstance {
  type: string;
  vcpu: number;
  memoryGiB: number;
}

type Service = "ec2" | "rds" | "cache" | "search";
const inst = (type: string, vcpu: number, memoryGiB: number): AwsInstance => ({ type, vcpu, memoryGiB });

/** Real instance types, by service, family and vCPU count. */
const LADDER: Record<Service, Record<string, Record<number, AwsInstance>>> = {
  ec2: {
    compute: { 2: inst("c6i.large", 2, 4), 4: inst("c6i.xlarge", 4, 8), 8: inst("c6i.2xlarge", 8, 16), 16: inst("c6i.4xlarge", 16, 32) },
    general: { 2: inst("m6i.large", 2, 8), 4: inst("m6i.xlarge", 4, 16), 8: inst("m6i.2xlarge", 8, 32), 16: inst("m6i.4xlarge", 16, 64) },
    memory: { 2: inst("r6i.large", 2, 16), 4: inst("r6i.xlarge", 4, 32), 8: inst("r6i.2xlarge", 8, 64), 16: inst("r6i.4xlarge", 16, 128) },
  },
  rds: {
    // RDS for PostgreSQL has no compute-optimised class, so compute sizes use the general one.
    compute: { 2: inst("db.m6g.large", 2, 8), 4: inst("db.m6g.xlarge", 4, 16), 8: inst("db.m6g.2xlarge", 8, 32), 16: inst("db.m6g.4xlarge", 16, 64) },
    general: { 2: inst("db.m6g.large", 2, 8), 4: inst("db.m6g.xlarge", 4, 16), 8: inst("db.m6g.2xlarge", 8, 32), 16: inst("db.m6g.4xlarge", 16, 64) },
    memory: { 2: inst("db.r6g.large", 2, 16), 4: inst("db.r6g.xlarge", 4, 32), 8: inst("db.r6g.2xlarge", 8, 64), 16: inst("db.r6g.4xlarge", 16, 128) },
  },
  cache: {
    // ElastiCache nodes are memory-optimised whatever the model's family says.
    all: { 2: inst("cache.r6g.large", 2, 13.07), 4: inst("cache.r6g.xlarge", 4, 26.32), 8: inst("cache.r6g.2xlarge", 8, 52.82), 16: inst("cache.r6g.4xlarge", 16, 105.81) },
  },
  search: {
    general: { 2: inst("m6g.large.search", 2, 8), 4: inst("m6g.xlarge.search", 4, 16), 8: inst("m6g.2xlarge.search", 8, 32), 16: inst("m6g.4xlarge.search", 16, 64) },
    memory: { 2: inst("r6g.large.search", 2, 16), 4: inst("r6g.xlarge.search", 4, 32), 8: inst("r6g.2xlarge.search", 8, 64), 16: inst("r6g.4xlarge.search", 16, 128) },
  },
};

function serviceOf(kind: ComponentKind): Service | null {
  switch (kind) {
    case "app-server":
    case "worker":
      return "ec2";
    case "database":
      return "rds";
    case "cache":
      return "cache";
    case "search":
      return "search";
    default:
      return null;
  }
}

/** The real AWS instance for a model size, or null where AWS has no instance to choose (managed parts). */
export function awsInstance(kind: ComponentKind, sizeId: string): AwsInstance | null {
  const service = serviceOf(kind);
  const tier = SIZE_CATALOG.find((t) => t.id === sizeId);
  if (!service || !tier) return null;
  if (tier.set !== "generic") {
    // An AWS instance size of the right service keeps its own name; Fargate, pod and host sizes are not EC2-style instances.
    const own: Record<string, Service> = { ec2: "ec2", rds: "rds", elasticache: "cache", opensearch: "search" };
    return own[tier.set] === service ? { type: tier.id, vcpu: tier.vcpu, memoryGiB: tier.memoryGb } : null;
  }
  const byFamily = LADDER[service];
  const rung = (byFamily[tier.family] ?? byFamily.all ?? byFamily.general ?? Object.values(byFamily)[0])?.[tier.vcpu];
  return rung ?? null;
}

const FAMILY_MEANING: Record<string, string> = {
  t: "t = burstable: a baseline of CPU with credits for bursts",
  m: "m = general purpose: a balance of CPU and memory",
  c: "c = compute optimised: more CPU for its memory",
  r: "r = memory optimised: more memory for its CPU",
  i: "i = storage optimised: fast local disks",
};
const SIZE_MEANING: Record<string, string> = {
  micro: "micro", small: "small", medium: "medium", large: "large", xlarge: "xlarge (2x large)", "2xlarge": "2xlarge (4x large)", "4xlarge": "4xlarge (8x large)",
};

/** One line on what an instance type name tells you: family letter, generation and size. */
export function instanceMeaning(type: string): string {
  const m = type.match(/^(?:db\.|cache\.)?([a-z]+)(\d+)([a-z]*)\.([a-z0-9]+)/);
  if (!m) return "A size from the model's own ladder.";
  const [, letters, generation, suffix, size] = m;
  const family = FAMILY_MEANING[letters!.charAt(0)] ?? `${letters} family`;
  const extra = suffix === "g" ? ", Graviton (Arm) processor" : suffix === "i" ? ", Intel processor" : suffix === "a" ? ", AMD processor" : "";
  return `${family}. Generation ${generation}${extra}. Size ${SIZE_MEANING[size!] ?? size}.`;
}

/** What to show for a size: the AWS instance with its real vCPU and memory, or the model's size name. */
export function sizeLabel(kind: ComponentKind, sizeId: string, mode: NameMode): { label: string; detail: string } {
  const tier = SIZE_CATALOG.find((t) => t.id === sizeId);
  const plain = sizeId.replace(/^(compute|memory|general)-/, "");
  if (mode === "generic" || !tier) {
    return { label: plain, detail: tier ? `${tier.vcpu} vCPU, ${tier.memoryGb} GB (model size)` : "" };
  }
  const aws = awsInstance(kind, sizeId);
  if (!aws && tier.set !== "generic") return { label: plain, detail: `${tier.vcpu} vCPU, ${tier.memoryGb} GB (model size)` };
  if (!aws) {
    return { label: plain, detail: `${COMPONENT_CATALOG[kind].label}: AWS manages this part, so this size is the model's capacity setting, not an AWS choice` };
  }
  const mem = Number.isInteger(aws.memoryGiB) ? String(aws.memoryGiB) : aws.memoryGiB.toFixed(2);
  return { label: aws.type, detail: `${aws.vcpu} vCPU, ${mem} GiB. ${instanceMeaning(aws.type)} Prices here are illustrative.` };
}

/** Names the board shows for a part, in the learner's chosen mode. Parts already from the AWS family keep their own names. */
export function partName(kind: ComponentKind, mode: NameMode): string {
  if (mode === "aws") return AWS_PARTS[kind]?.name ?? COMPONENT_CATALOG[kind].label;
  return COMPONENT_CATALOG[kind].label;
}

/** Settings whose names change in AWS mode, with what they mean. */
export const AWS_PROPS: Partial<Record<ComponentKind, Record<string, { label: string; meaning: string }>>> = {
  database: {
    multiAz: { label: "Multi-AZ standby", meaning: "A standby copy in another zone with automatic failover." },
    replicas: { label: "Read replicas", meaning: "Extra copies that serve reads. Writes still go to the primary." },
  },
  "load-balancer": { zones: { label: "Availability Zones", meaning: "How many zones the ALB spreads over." } },
  "app-server": { azs: { label: "Availability Zones", meaning: "How many zones the instances are spread over." } },
  cache: { azs: { label: "Availability Zones", meaning: "How many zones the cache nodes are spread over." } },
};

/** Plain-term replacements so checks, reasons and the solution use the same names as the board. */
const TERMS: [RegExp, string][] = [
  // Articles first, so "a cache" becomes "an ElastiCache" and not "a ElastiCache".
  [/\bA cache\b/g, "An ElastiCache"], [/\ba cache\b/g, "an ElastiCache"],
  [/\bA database\b/g, "An RDS database"], [/\ba database\b/g, "an RDS database"],
  [/\bA queue\b/g, "An SQS queue"], [/\ba queue\b/g, "an SQS queue"],
  [/\bA load balancer\b/g, "An ALB"], [/\ba load balancer\b/g, "an ALB"],
  [/\ba read replica\b/g, "an RDS read replica"],
  [/\bload balancers\b/g, "ALBs"], [/\bLoad balancers\b/g, "ALBs"], [/\bload balancer\b/g, "ALB"], [/\bLoad balancer\b/g, "ALB"],
  [/\bapp servers\b/g, "EC2 instances"], [/\bApp servers\b/g, "EC2 instances"], [/\bapp server\b/g, "EC2 instance"], [/\bApp server\b/g, "EC2 instance"],
  [/\bcache\b/g, "ElastiCache"], [/\bCache\b/g, "ElastiCache"],
  [/\bqueue\b/g, "SQS queue"], [/\bQueue\b/g, "SQS queue"],
  [/\bread replicas\b/g, "RDS read replicas"], [/\bread replica\b/g, "RDS read replica"],
  [/\bstandby\b/g, "Multi-AZ standby"],
  [/\bdatabase\b/g, "RDS database"], [/\bDatabase\b/g, "RDS database"],
];

/** The same sentence with AWS names, or unchanged in generic mode. Already-AWS words are left alone. */
export function localize(text: string, mode: NameMode): string {
  if (mode === "generic") return text;
  let out = text;
  for (const [re, to] of TERMS) out = out.replace(re, to);
  // Undo doubled-up names the replacements can create.
  return out.replace(/ElastiCache ElastiCache/g, "ElastiCache").replace(/SQS SQS/g, "SQS").replace(/RDS RDS/g, "RDS").replace(/EC2 EC2/g, "EC2");
}

// ---- remembering the choice -----------------------------------------------------

const KEY = "lab-names";
const listeners = new Set<() => void>();
export function readNameMode(): NameMode {
  try {
    return window.localStorage.getItem(KEY) === "aws" ? "aws" : "generic";
  } catch {
    return "generic";
  }
}
export function writeNameMode(mode: NameMode): void {
  try {
    window.localStorage.setItem(KEY, mode);
  } catch {
    // Private windows can refuse storage; the choice then lasts until the page closes.
    memory = mode;
  }
  listeners.forEach((l) => l());
}
let memory: NameMode | null = null;
export function subscribeNameMode(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}
export const currentNameMode = (): NameMode => memory ?? readNameMode();
