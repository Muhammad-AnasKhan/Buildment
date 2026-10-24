import { CheckCircle2, KeyRound, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AiCredentialStatus } from "@/shared/api/ai";

// The "AI interviews" settings card, drawn from props only so it can be tested
// without a browser. The key itself is only ever typed into the box here and
// sent once; the server answers with its last four characters.

export type AiKeyBusy = null | "saving" | "testing" | "deleting" | "model";

export type AiKeySettingsViewProps = {
  status: AiCredentialStatus;
  keyDraft: string;
  modelDraft: string;
  /** True while the learner is pasting a replacement for a saved key. */
  replacing: boolean;
  busy: AiKeyBusy;
  message: string | null;
  error: string | null;
  onKeyChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onSave: () => void;
  onTest: () => void;
  onSaveModel: () => void;
  onDelete: () => void;
  onReplace: (replacing: boolean) => void;
};

function Notes() {
  return (
    <div className="space-y-2 rounded-lg border bg-muted/40 p-3 text-sm leading-6 text-muted-foreground">
      <p>
        <span className="font-medium text-foreground">Cost: </span>
        interviews run on your own OpenRouter account. A 10 answer interview usually costs a few cents, and free models cost nothing. You can set a spending limit on your key at openrouter.ai.
      </p>
      <p className="flex gap-2">
        <ShieldCheck className="mt-1 size-4 shrink-0" aria-hidden />
        <span>
          <span className="font-medium text-foreground">Privacy: </span>
          your key is encrypted before it is saved and is only used to send your interview to OpenRouter. It is never shown again, only its last four characters. Your answers go to OpenRouter and the model you pick, and your mentor can read your finished interviews. You can delete the key at any time.
        </span>
      </p>
    </div>
  );
}

export function AiKeySettingsView(props: AiKeySettingsViewProps) {
  const { status, busy } = props;
  const showKeyInput = !status.hasKey || props.replacing;
  const idle = busy === null;

  return (
    <section id="ai-interviews" aria-labelledby="ai-interviews-title" className="scroll-mt-24 space-y-4 rounded-xl border bg-card p-4 shadow-sm sm:p-6">
      <div>
        <h2 id="ai-interviews-title" className="text-lg font-semibold">
          AI interviews
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Practise with an AI interviewer inside your courses. You bring your own OpenRouter key.
        </p>
      </div>

      {!status.configured ? (
        <p role="status" className="rounded-lg border px-3 py-2 text-sm">
          AI interviews are not set up on this server.
        </p>
      ) : (
        <>
          <Notes />

          {status.hasKey ? (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm" data-testid="key-status">
              <KeyRound className="size-4" aria-hidden />
              <span>
                Key saved, ending in <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{status.lastFour}</code>
              </span>
            </p>
          ) : null}

          {showKeyInput ? (
            <div className="space-y-2">
              <Label htmlFor="openrouter-key">{status.hasKey ? "New OpenRouter key" : "OpenRouter key"}</Label>
              <Input
                id="openrouter-key"
                type="password"
                value={props.keyDraft}
                onChange={(event) => props.onKeyChange(event.target.value)}
                placeholder="sk-or-v1-..."
                autoComplete="off"
                spellCheck={false}
                maxLength={300}
                data-1p-ignore
                disabled={!idle}
                className="h-10 font-mono text-base"
              />
              <p className="text-xs text-muted-foreground">
                Create one at openrouter.ai/keys. We check it with OpenRouter before saving.
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="openrouter-model">Model</Label>
            <Input
              id="openrouter-model"
              value={props.modelDraft}
              onChange={(event) => props.onModelChange(event.target.value)}
              placeholder={status.defaultModel}
              autoComplete="off"
              spellCheck={false}
              maxLength={120}
              disabled={!idle}
              className="h-10 text-base"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use {status.defaultModel}. Any OpenRouter model id works, for example one ending in :free.
            </p>
          </div>

          {props.message ? (
            <p role="status" className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-4" aria-hidden /> {props.message}
            </p>
          ) : null}
          {props.error ? (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {props.error}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {showKeyInput ? (
              <Button className="h-10" onClick={props.onSave} disabled={!idle || props.keyDraft.trim().length < 20}>
                {busy === "saving" ? <Loader2 className="animate-spin" aria-hidden /> : null}
                {busy === "saving" ? "Checking key..." : status.hasKey ? "Replace key" : "Save and test key"}
              </Button>
            ) : (
              <>
                <Button className="h-10" variant="outline" onClick={props.onTest} disabled={!idle}>
                  {busy === "testing" ? <Loader2 className="animate-spin" aria-hidden /> : null}
                  {busy === "testing" ? "Testing..." : "Test key"}
                </Button>
                <Button className="h-10" variant="outline" onClick={() => props.onReplace(true)} disabled={!idle}>
                  Replace key
                </Button>
              </>
            )}
            {status.hasKey ? (
              <Button className="h-10" variant="outline" onClick={props.onSaveModel} disabled={!idle || props.modelDraft.trim() === (status.model ?? "")}>
                {busy === "model" ? <Loader2 className="animate-spin" aria-hidden /> : null}
                Save model
              </Button>
            ) : null}
            {props.replacing ? (
              <Button className="h-10" variant="ghost" onClick={() => props.onReplace(false)} disabled={!idle}>
                Cancel
              </Button>
            ) : null}
            {status.hasKey ? (
              <Button className="h-10 text-destructive hover:text-destructive sm:ml-auto" variant="ghost" onClick={props.onDelete} disabled={!idle}>
                <Trash2 aria-hidden /> Delete key
              </Button>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
