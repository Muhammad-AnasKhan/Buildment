import { z } from "zod";

export const OpenQuestionConfigSchema = z.object({
  prompt: z.string(),
  minWords: z.number().int().min(0).default(0),
  maxWords: z.number().int().min(1).optional(),
  allowSpeechInput: z.boolean().optional().default(false),
  speechPrimary: z.boolean().optional().default(false),
  submissionMode: z
    .enum(["text", "url", "url_required", "article", "video_demo"])
    .optional()
    .default("text"),
  allowUrl: z.boolean().optional().default(false),
  urlLabel: z.string().optional(),
  urlRequired: z.boolean().optional().default(false),
  urlHint: z.string().optional(),
  rubric: z.string().optional(), // mentor-only, never sent to the client
  sampleAnswer: z.string().optional(), // mentor-only unless revealed post-submit
});

export type OpenQuestionConfig = z.infer<typeof OpenQuestionConfigSchema>;

// The projection sanitizeBlockConfig() produces for the client — see
// src/mdx/sanitize.ts and docs/09-security.mdx.
export type SanitizedOpenQuestionConfig = Omit<OpenQuestionConfig, "rubric" | "sampleAnswer">;

export const OpenQuestionPayloadSchema = z
  .object({
    text: z.string(),
    url: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.url && data.url.trim()) {
      try {
        // eslint-disable-next-line no-new
        new URL(data.url.trim());
      } catch {
        ctx.addIssue({ code: "custom", message: "Invalid URL", path: ["url"] });
      }
    }
  });

const SUBMISSION_URL_LABELS: Record<string, { label: string; hint: string }> = {
  url: { label: "Link", hint: "Paste a URL (GitHub, docs, Loom, etc.)." },
  url_required: { label: "Link (required)", hint: "Paste the required URL." },
  article: { label: "Article link", hint: "Paste a blog post or doc you read for this topic." },
  video_demo: { label: "Demo video URL", hint: "Paste a Loom, Drive, or YouTube link to your walkthrough." },
};

export function openQuestionUrlPresentation(config: OpenQuestionConfig) {
  const mode = config.submissionMode ?? "text";
  const needsUrl = config.allowUrl || mode !== "text";
  const required = config.urlRequired || mode === "url_required" || mode === "article" || mode === "video_demo";
  const preset = SUBMISSION_URL_LABELS[mode];
  return {
    showUrl: needsUrl,
    urlRequired: required,
    urlLabel: config.urlLabel ?? preset?.label ?? "Link",
    urlHint: config.urlHint ?? preset?.hint,
  };
}

export function validateOpenQuestionPayload(
  config: OpenQuestionConfig,
  payload: z.infer<typeof OpenQuestionPayloadSchema>
): string | null {
  const urlMeta = openQuestionUrlPresentation(config);
  if (urlMeta.urlRequired && !(payload.url?.trim())) {
    return `${urlMeta.urlLabel} is required.`;
  }
  const hasText = payload.text.trim().length > 0;
  const hasUrl = Boolean(payload.url?.trim());

  if (!hasText && !hasUrl) {
    return urlMeta.urlRequired ? `Add the required ${urlMeta.urlLabel.toLowerCase()}.` : "Write an answer or add a link.";
  }

  const skipMinWords = config.speechPrimary && config.allowSpeechInput && hasText;
  if (config.minWords > 0 && hasText && !skipMinWords) {
    const words = payload.text.trim().split(/\s+/).filter(Boolean).length;
    if (words < config.minWords) {
      return `Answer at least ${config.minWords} words.`;
    }
  }

  return null;
}

export type OpenQuestionPayload = z.infer<typeof OpenQuestionPayloadSchema>;
