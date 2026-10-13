"use client";

import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { useSpeechInput } from "@/lib/use-speech-input";

export function AnswerTextareaWithMic({
  value,
  onChange,
  placeholder,
  rows = 4,
  ariaLabel,
  enableSpeech = true,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  ariaLabel: string;
  enableSpeech?: boolean;
  className?: string;
}) {
  const committedRef = useRef(value);

  const appendTranscript = (chunk: string, isFinal: boolean) => {
    const spoken = chunk.trim();
    if (!spoken) return;
    const base = committedRef.current;
    const spacer = base && !base.endsWith(" ") ? " " : "";
    if (isFinal) {
      const next = `${base}${spacer}${spoken}`;
      committedRef.current = next;
      onChange(next);
      return;
    }
    onChange(`${base}${spacer}${spoken}`);
  };

  const { supported, listening, error, toggle } = useSpeechInput(appendTranscript);

  useEffect(() => {
    if (!listening) committedRef.current = value;
  }, [listening, value]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => {
            committedRef.current = e.target.value;
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          rows={rows}
          aria-label={ariaLabel}
          className={cn(
            "min-h-[6.5rem] resize-y bg-background text-[15px] leading-relaxed text-foreground",
            enableSpeech && supported && "pr-12",
            className
          )}
        />
        {enableSpeech && supported ? (
          <Button
            type="button"
            size="icon"
            variant={listening ? "default" : "ghost"}
            className={cn(
              "absolute right-2 top-2 size-9 shrink-0",
              listening && "bg-rose-600 hover:bg-rose-700"
            )}
            onClick={toggle}
            aria-pressed={listening}
            aria-label={listening ? "Stop dictation" : "Dictate answer with microphone"}
          >
            {listening ? <MicOff className="size-4" aria-hidden /> : <Mic className="size-4" aria-hidden />}
          </Button>
        ) : null}
      </div>
      {enableSpeech && !supported ? (
        <p className="text-xs text-muted-foreground">Speech input is not available in this browser — type your answer.</p>
      ) : null}
      {error ? <p className="text-xs text-amber-700">{error}</p> : null}
      {listening ? (
        <p className="text-xs font-medium text-rose-600">Listening… words appear as you speak.</p>
      ) : null}
    </div>
  );
}
