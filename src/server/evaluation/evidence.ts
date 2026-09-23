import { parseSafeSubmissionUrl } from "@/lib/safe-submission-url";

export type EvidenceClassificationInput = {
  prompt: string;
  label?: string;
  hint?: string;
  submissionMode?: string;
  url: string;
};

export type EvidenceType =
  | "Repository"
  | "Demo video"
  | "Deployed application"
  | "Architecture / ERD"
  | "Article / document"
  | "Other evidence";

export function classifyProjectEvidence(input: EvidenceClassificationInput): EvidenceType {
  const url = parseSafeSubmissionUrl(input.url);
  const hostname = url?.hostname.toLowerCase() ?? "";
  const text = `${input.prompt} ${input.label ?? ""} ${input.hint ?? ""}`.toLowerCase();

  if (
    ["github.com", "gitlab.com", "bitbucket.org"].some(
      (host) => hostname === host || hostname.endsWith(`.${host}`)
    ) ||
    /\b(repo|repository|github|gitlab|source code)\b/.test(text)
  ) {
    return "Repository";
  }
  if (
    input.submissionMode === "video_demo" ||
    ["loom.com", "youtube.com", "youtu.be", "drive.google.com"].some(
      (host) => hostname === host || hostname.endsWith(`.${host}`)
    ) ||
    /\b(video|recording|walkthrough|demo)\b/.test(text)
  ) {
    return "Demo video";
  }
  if (/\b(deploy|deployed|live app|production url|hosted)\b/.test(text)) {
    return "Deployed application";
  }
  if (/\b(erd|architecture|diagram|schema)\b/.test(text)) {
    return "Architecture / ERD";
  }
  if (
    input.submissionMode === "article" ||
    ["docs.google.com", "notion.so", "medium.com", "dev.to"].some(
      (host) => hostname === host || hostname.endsWith(`.${host}`)
    ) ||
    /\b(article|document|write-up|writeup)\b/.test(text)
  ) {
    return "Article / document";
  }
  return "Other evidence";
}

export function evidenceUrlParts(value: string) {
  const url = parseSafeSubmissionUrl(value);
  if (!url) return null;
  const path = decodeURIComponent(url.pathname).replace(/\/$/, "");
  return {
    url: url.toString(),
    hostname: url.hostname,
    displayPath: path && path !== "/" ? path : url.hostname,
  };
}
