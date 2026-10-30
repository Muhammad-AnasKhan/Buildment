// Replace the local database with a copy of production, so local matches what learners see.
// Usage (from server/): pnpm db:pull-production
//
// Production is only read: the URL comes from `heroku config:get` and pg_dump runs against it.
// Nothing is written on Heroku (no backup capture, no config change).
// Needs the Heroku CLI (logged in, with access to the app) and Docker. pg_dump and psql run in a
// postgres:18 container, so they are never older than the production server.
//
// Env:
//   HEROKU_APP                 Heroku app to read from (default "buildment")
//   PRODUCTION_DATABASE_URL    skip Heroku and dump this URL instead
//   LOCAL_DATABASE_URL         target (default DATABASE_URL from server/.env); must be local
//
// The current local database is saved first to a .dump file in the OS temp folder; restore it with
// pg_restore --clean if you need it back.
import { spawn, spawnSync } from "node:child_process";
import { createWriteStream, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { Transform } from "node:stream";

const PG_IMAGE = "postgres:18-alpine";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]", "postgres", "host.docker.internal"]);

if (existsSync(".env")) process.loadEnvFile(".env");

const localUrl = process.env.LOCAL_DATABASE_URL ?? process.env.DATABASE_URL;
if (!localUrl) fail("Set LOCAL_DATABASE_URL or DATABASE_URL in server/.env.");
const local = new URL(localUrl);
if (!LOCAL_HOSTS.has(local.hostname)) fail(`Refusing to overwrite ${local.hostname}: the target must be a local database.`);

const app = process.env.HEROKU_APP ?? "buildment";
const productionUrl = process.env.PRODUCTION_DATABASE_URL ?? herokuDatabaseUrl(app);
if (new URL(productionUrl).host === local.host) fail("Production and local URLs point at the same server.");

// Containers reach the host's Postgres through host.docker.internal, not localhost. Prisma adds
// ?schema=, which libpq does not understand.
const target = new URL(localUrl);
if (["localhost", "127.0.0.1", "::1", "[::1]"].includes(target.hostname)) target.hostname = "host.docker.internal";
target.search = "";
const targetUrl = target.toString();

const backup = path.join(os.tmpdir(), `buildment-local-${new Date().toISOString().replace(/[:.]/g, "-")}.dump`);
console.log(`Saving the current local database to ${backup}`);
await run(["pg_dump", "--format=custom", targetUrl], createWriteStream(backup));

console.log("Clearing the local public schema");
await run(["psql", "-v", "ON_ERROR_STOP=1", "-q", targetUrl, "-c", "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"]);

console.log(`Copying production (${app}) into ${local.host}${local.pathname}`);
const dump = docker(["pg_dump", "--no-owner", "--no-privileges", "--exclude-schema=_heroku", "--exclude-extension=pg_stat_statements", productionUrl]);
const load = docker(["psql", "-v", "ON_ERROR_STOP=1", "-q", targetUrl], ["pipe", "ignore", "inherit"]);
// Drop what a local server cannot run: settings newer than it, and Heroku's own event triggers,
// whose functions live in the excluded _heroku schema.
dump.stdout!.pipe(dropHerokuOnlyLines()).pipe(load.stdin!);
await Promise.all([exited(dump, "pg_dump"), exited(load, "psql")]);

const counts = spawnSync("docker", dockerArgs(["psql", "-tA", targetUrl, "-c", 'select (select count(*) from "User") || \' users, \' || (select count(*) from _prisma_migrations) || \' migrations\'']), { encoding: "utf8" });
console.log(`Done: local now has ${counts.stdout.trim()}.`);

function herokuDatabaseUrl(appName: string): string {
  const result = spawnSync("heroku", ["config:get", "DATABASE_URL", "-a", appName], { encoding: "utf8", shell: process.platform === "win32" });
  const url = result.stdout?.trim();
  if (result.status !== 0 || !url) fail(`Could not read DATABASE_URL from Heroku app ${appName}. Is the Heroku CLI logged in?`);
  return url;
}

function dockerArgs(command: string[]): string[] {
  return ["run", "--rm", "-i", "--add-host=host.docker.internal:host-gateway", PG_IMAGE, ...command];
}

function docker(command: string[], stdio: ("pipe" | "ignore" | "inherit")[] = ["ignore", "pipe", "inherit"]) {
  return spawn("docker", dockerArgs(command), { stdio });
}

async function run(command: string[], out?: NodeJS.WritableStream) {
  const child = docker(command, ["ignore", out ? "pipe" : "inherit", "inherit"]);
  if (out) child.stdout!.pipe(out);
  await exited(child, command[0]);
}

function exited(child: ReturnType<typeof spawn>, name: string) {
  return new Promise<void>((resolve, reject) => {
    child.on("error", reject);
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${name} exited with ${code}`))));
  });
}

function dropHerokuOnlyLines() {
  let rest = "";
  let inEventTrigger = false;
  const keep = (line: string) => {
    if (/^(CREATE|ALTER) EVENT TRIGGER\b/.test(line)) inEventTrigger = true;
    if (inEventTrigger) {
      if (line.trimEnd().endsWith(";")) inEventTrigger = false;
      return false;
    }
    return !/^SET transaction_timeout\b/.test(line);
  };
  return new Transform({
    transform(chunk, _enc, done) {
      const lines = (rest + chunk.toString("utf8")).split("\n");
      rest = lines.pop() ?? "";
      done(null, lines.filter(keep).map((l) => l + "\n").join(""));
    },
    flush(done) {
      done(null, keep(rest) ? rest : "");
    },
  });
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}
