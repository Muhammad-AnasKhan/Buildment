import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { isProduction } from "../../config/env.js";
import { AppError, NotFoundError } from "../../utils/errors.js";
import { isMissingObjectError, r2Storage } from "../storage/r2.js";

// Quiz camera stills live in the private R2 bucket under `integrity/`. Without R2
// (local development and tests) they go to a folder in the OS temp directory, so
// the camera flow can be tried end to end. Production without R2 refuses uploads.

export const SNAPSHOT_PREFIX = "integrity/";
const LOCAL_ROOT = path.join(tmpdir(), "buildment-integrity-snapshots");

export type SnapshotStore = {
  put(key: string, bytes: Buffer): Promise<void>;
  get(key: string): Promise<Buffer>;
  remove(keys: string[]): Promise<void>;
  /** Deletes every stored still last written before `cutoff`, including orphans. */
  sweep(cutoff: Date): Promise<number>;
};

function localPath(key: string): string {
  if (!key.startsWith(SNAPSHOT_PREFIX) || key.includes("..")) throw new NotFoundError("Snapshot not found");
  return path.join(LOCAL_ROOT, ...key.split("/"));
}

async function listLocal(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(entries.map((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listLocal(full) : Promise.resolve([full]);
  }));
  return nested.flat();
}

const localStore: SnapshotStore = {
  async put(key, bytes) {
    const file = localPath(key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, bytes);
  },
  async get(key) {
    try {
      return await readFile(localPath(key));
    } catch {
      throw new NotFoundError("Snapshot not found");
    }
  },
  async remove(keys) {
    await Promise.all(keys.map((key) => rm(localPath(key), { force: true })));
  },
  async sweep(cutoff) {
    let removed = 0;
    for (const file of await listLocal(path.join(LOCAL_ROOT, "integrity"))) {
      const info = await stat(file).catch(() => null);
      if (info && info.mtime < cutoff) {
        await rm(file, { force: true });
        removed += 1;
      }
    }
    return removed;
  },
};

function r2Store(r2: NonNullable<ReturnType<typeof r2Storage>>): SnapshotStore {
  const { client, bucket } = r2;
  const removeKeys = async (keys: string[]) => {
    for (let i = 0; i < keys.length; i += 1000) {
      const chunk = keys.slice(i, i + 1000);
      await client.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: chunk.map((Key) => ({ Key })), Quiet: true } }));
    }
  };
  return {
    async put(key, bytes) {
      await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: bytes,
        ContentType: "image/jpeg",
        CacheControl: "private, no-store",
      }));
    },
    async get(key) {
      try {
        const object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        if (!object.Body) throw new NotFoundError("Snapshot not found");
        return Buffer.from(await object.Body.transformToByteArray());
      } catch (error) {
        if (isMissingObjectError(error)) throw new NotFoundError("Snapshot not found");
        throw error;
      }
    },
    remove: removeKeys,
    async sweep(cutoff) {
      let removed = 0;
      let token: string | undefined;
      do {
        const page = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: SNAPSHOT_PREFIX, ContinuationToken: token }));
        const stale = (page.Contents ?? [])
          .filter((object) => object.Key && object.LastModified && object.LastModified < cutoff)
          .map((object) => object.Key!);
        if (stale.length) await removeKeys(stale);
        removed += stale.length;
        token = page.IsTruncated ? page.NextContinuationToken : undefined;
      } while (token);
      return removed;
    },
  };
}

export function snapshotStore(): SnapshotStore {
  const r2 = r2Storage();
  if (r2) return r2Store(r2);
  if (isProduction) throw new AppError("Snapshot storage is not configured.", 503, "SNAPSHOT_STORAGE_UNAVAILABLE");
  return localStore;
}

/** True when stills can be stored at all, so the quiz can skip the camera step otherwise. */
export function snapshotStorageAvailable(): boolean {
  return Boolean(r2Storage()) || !isProduction;
}
