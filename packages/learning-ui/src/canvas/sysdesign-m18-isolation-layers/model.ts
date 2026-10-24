// 18.2 beat 2: a container is an ordinary process with a limited view
// (namespaces) and limited resources (cgroups). Four namespace switches change
// what the process sees; a memory limit below what the service needs kills it;
// a CPU limit below one CPU only slows it. The 212 host processes are made up;
// 200 ms of CPU a request is the course's round figure (the challenge run
// measured 213 ms with one CPU and 406 ms with half a CPU).

export const HOST_PROCESSES = 212;
export const MEM_NEED_MB = 150;
export const CPU_WORK_MS = 200;
export const CONTAINER_ID = "a1b2c3d4e5f6";
export const HOST_NAME = "ops-server";

export type SwitchId = "pid" | "net" | "mnt" | "host";
export type Switches = Record<SwitchId, boolean>;

export const SWITCHES: readonly { id: SwitchId; short: string; full: string }[] = [
  { id: "pid", short: "PID", full: "Process IDs" },
  { id: "net", short: "Network", full: "Network" },
  { id: "mnt", short: "Mount", full: "Mounted files" },
  { id: "host", short: "Host name", full: "Host name" },
];
export const ALL_ON: Switches = { pid: true, net: true, mnt: true, host: true };

export const MEM_MIN = 64;
export const MEM_MAX = 512;
export const MEM_STEP = 16;
export const MEM_LADDER: readonly number[] = Array.from({ length: (MEM_MAX - MEM_MIN) / MEM_STEP + 1 }, (_, i) => MEM_MIN + i * MEM_STEP);
export const CPU_LADDER: readonly number[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
export const DEFAULT_MEM = 256;
export const DEFAULT_CPU = 1;

const clamp01 = (f: number) => Math.max(0, Math.min(1, Number.isFinite(f) ? f : 0));

/** A 0 to 1 rail position to a memory limit in MB, on 16 MB steps (128 and 256 are steps). */
export function memFromFraction(f: number): number {
  const raw = MEM_MIN + clamp01(f) * (MEM_MAX - MEM_MIN);
  return Math.max(MEM_MIN, Math.min(MEM_MAX, Math.round(raw / MEM_STEP) * MEM_STEP));
}
export const memFraction = (mb: number) => clamp01((mb - MEM_MIN) / (MEM_MAX - MEM_MIN));

/** A 0 to 1 rail position to a CPU limit on quarter-CPU steps (0.5 and 1 are steps). */
export function cpuFromFraction(f: number): number {
  const lo = CPU_LADDER[0];
  const hi = CPU_LADDER[CPU_LADDER.length - 1];
  return Math.max(lo, Math.min(hi, Math.round((lo + clamp01(f) * (hi - lo)) * 4) / 4));
}
export const cpuFraction = (cpu: number) => clamp01((cpu - CPU_LADDER[0]) / (CPU_LADDER[CPU_LADDER.length - 1] - CPU_LADDER[0]));

export const formatCpu = (cpu: number) => (cpu <= 1 ? `${cpu} CPU` : `${cpu} CPUs`);

/** Killed (exit 137) when the limit is below what the service needs. */
export const isKilled = (memMb: number) => memMb < MEM_NEED_MB;

/** Request time in ms: 200 divided by min(CPUs, 1). A limit above one CPU does not help a single thread. */
export const requestMs = (cpu: number) => Math.round(CPU_WORK_MS / Math.min(cpu, 1));

/** MB in use: the service climbs to what it needs, and no higher than its limit. */
export const memoryUsed = (memMb: number) => Math.min(MEM_NEED_MB, memMb);

export type View = { processes: number; portFree: boolean; files: "image" | "host"; name: string };

/** What the process sees, from the four switches. */
export function viewFor(sw: Switches): View {
  return {
    processes: sw.pid ? 1 : HOST_PROCESSES,
    portFree: sw.net,
    files: sw.mnt ? "image" : "host",
    name: sw.host ? CONTAINER_ID : HOST_NAME,
  };
}

export type Verdict = { text: string; tone: "good" | "warn" | "bad" | "accent" };

/** Most severe first: killed, then the first switch that is off, then a CPU limit, then all clear. */
export function verdictFor(sw: Switches, memMb: number, cpu: number): Verdict {
  if (isKilled(memMb)) return { text: "Over the memory limit: killed", tone: "bad" };
  if (!sw.pid) return { text: "It can see and signal host processes", tone: "warn" };
  if (!sw.net) return { text: "Port 3000 clashes with the host", tone: "bad" };
  if (!sw.mnt) return { text: "It can read the host's files", tone: "warn" };
  if (!sw.host) return { text: "It sees the host's name", tone: "warn" };
  if (cpu < 1) return { text: "CPU limit: slower, never killed", tone: "accent" };
  return { text: "Isolated: it sees only itself", tone: "good" };
}
