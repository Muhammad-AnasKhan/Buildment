import { S3Client } from "@aws-sdk/client-s3";
import { env } from "../../config/env.js";

// The private Cloudflare R2 bucket shared by course images and quiz integrity
// snapshots. Nothing in it is public: every read goes through the API.

let client: S3Client | undefined;

/** The R2 client and bucket, or null when the bucket is not configured. */
export function r2Storage(): { client: S3Client; bucket: string } | null {
  if (!env.R2_ENDPOINT || !env.R2_BUCKET || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) return null;
  client ??= new S3Client({
    region: "auto",
    endpoint: env.R2_ENDPOINT,
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
    credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
  });
  return { client, bucket: env.R2_BUCKET };
}

export function isMissingObjectError(error: unknown): boolean {
  return error instanceof Error && ["NoSuchKey", "NotFound"].includes(error.name);
}
