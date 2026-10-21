import "dotenv/config";
import { z } from "zod";

// Every environment variable the API reads is declared here and validated once at
// boot. Modules import `env`, never `process.env`, so a missing or malformed value
// fails fast with a readable message instead of surfacing deep inside a request.

const commaList = z
  .string()
  .default("")
  .transform((value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  );

const optionalString = z
  .string()
  .optional()
  .transform((value) => (value && value.trim() ? value.trim() : undefined));

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  /** Public URL of the web app — redirects and email links point here. */
  APP_URL: z.string().url().default("http://localhost:3000"),
  /** Browser origins allowed to call the API directly. */
  CORS_ORIGINS: commaList,

  AUTH_RESEND_KEY: optionalString,
  EMAIL_FROM: z.string().default("buildment <onboarding@resend.dev>"),
  ADMIN_NOTIFY_EMAIL: commaList,

  /** Shared secret an external scheduler presents to the jobs endpoints. */
  CRON_SECRET: optionalString,
  /** In-process daily jobs (inactivity nudges). Turn off when another replica or an external cron owns them. */
  JOBS_ENABLED: z
    .string()
    .optional()
    .transform((value) => value !== "false"),
  INACTIVITY_NUDGE_HOUR_UTC: z.coerce.number().int().min(0).max(23).default(9),
  WEEKLY_GOAL_REMINDER_HOUR_UTC: z.coerce.number().int().min(0).max(23).default(9),
  /** Daily job that deletes quiz camera stills older than 30 days. */
  INTEGRITY_RETENTION_HOUR_UTC: z.coerce.number().int().min(0).max(23).default(3),

  /** OpenRouter access for AI review drafts; drafting is disabled without a key. */
  OPENROUTER_API_KEY: optionalString,
  OPENROUTER_REVIEW_MODEL: optionalString,

  /** Private Cloudflare R2 bucket used for instructor-uploaded course images. */
  R2_ENDPOINT: optionalString,
  R2_BUCKET: optionalString,
  R2_ACCESS_KEY_ID: optionalString,
  R2_SECRET_ACCESS_KEY: optionalString,
  /**
   * Signs the short-lived links mentors use to view quiz snapshots. Set it when more
   * than one API replica runs; otherwise each process makes its own at boot.
   */
  INTEGRITY_MEDIA_SECRET: optionalString,

  /** Local testing only: e2e suites sign up repeatedly from one IP. Never set in production. */
  DISABLE_RATE_LIMITS: z
    .string()
    .optional()
    .transform((value) => value === "true"),
});

export type Env = z.infer<typeof schema>;

function loadEnv(): Env {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `  ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${problems}`);
  }
  return {
    ...parsed.data,
    APP_URL: parsed.data.APP_URL.replace(/\/$/, ""),
  };
}

export const env = loadEnv();

export const isProduction = env.NODE_ENV === "production";
export const rateLimitsEnabled = !(env.DISABLE_RATE_LIMITS && !isProduction);
export const isTest = env.NODE_ENV === "test";
