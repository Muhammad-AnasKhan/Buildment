"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { friendlyError } from "@buildment/learning-ui/blocks/ai-interview/interview-model";
import type { AiCredentialStatus } from "@/shared/api/ai";
import { AiKeySettingsView, type AiKeyBusy } from "./ai-key-settings-view";

const PATH = "/api/v1/learner/ai-credential";

export function AiKeySettings({ initial }: { initial: AiCredentialStatus }) {
  const [status, setStatus] = useState(initial);
  const [keyDraft, setKeyDraft] = useState("");
  const [modelDraft, setModelDraft] = useState(initial.model ?? "");
  const [providerDraft, setProviderDraft] = useState<"OPENROUTER" | "GEMINI">(initial.provider);
  const [replacing, setReplacing] = useState(false);
  const [busy, setBusy] = useState<AiKeyBusy>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(kind: Exclude<AiKeyBusy, null>, work: () => Promise<string>) {
    setBusy(kind);
    setMessage(null);
    setError(null);
    try {
      setMessage(await work());
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(null);
    }
  }

  const save = () =>
    run("saving", async () => {
      const next = await apiFetch<AiCredentialStatus>(PATH, { method: "PUT", json: { provider: providerDraft, apiKey: keyDraft.trim(), model: modelDraft.trim() || null } });
      // The key leaves this component the moment OpenRouter accepts it.
      setKeyDraft("");
      setReplacing(false);
      setStatus(next);
      setProviderDraft(next.provider);
      return "Key checked and saved.";
    });

  const test = () =>
    run("testing", async () => {
      setStatus(await apiFetch<AiCredentialStatus>(`${PATH}/test`, { method: "POST" }));
      return `${status.provider === "GEMINI" ? "Gemini" : "OpenRouter"} accepted your key.`;
    });

  const saveModel = () =>
    run("model", async () => {
      const next = await apiFetch<AiCredentialStatus>(PATH, { method: "PATCH", json: { model: modelDraft.trim() || null } });
      setStatus(next);
      setModelDraft(next.model ?? "");
      return "Model saved.";
    });

  const remove = () => {
    if (!window.confirm("Delete your saved key? Your interviews stay, but you will need a key to start a new one.")) return;
    return run("deleting", async () => {
      await apiFetch<void>(PATH, { method: "DELETE" });
      setStatus({ ...status, hasKey: false, lastFour: null, model: null, updatedAt: null, lastUsedAt: null });
      setModelDraft("");
      setKeyDraft("");
      setReplacing(false);
      return "Key deleted.";
    });
  };

  return (
    <AiKeySettingsView
      status={status}
      keyDraft={keyDraft}
      modelDraft={modelDraft}
      providerDraft={providerDraft}
      replacing={replacing}
      busy={busy}
      message={message}
      error={error}
      onKeyChange={setKeyDraft}
      onModelChange={setModelDraft}
      onProviderChange={setProviderDraft}
      onSave={save}
      onTest={test}
      onSaveModel={saveModel}
      onDelete={remove}
      onReplace={(value) => {
        setReplacing(value);
        if (!value) setKeyDraft("");
      }}
    />
  );
}
