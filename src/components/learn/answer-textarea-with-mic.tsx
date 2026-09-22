"use client";

import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
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
  const appendTranscript = (chunk: string, isFinal: boolean) => {
    if (!chunk.trim()) return;
    onChange(
      isFinal
        ? `${value}${value && !value.endsWith(" ") ? " " : ""}${chunk.trim()}`
        : value
    );
  };

  const { supported, listening, error, toggle } = useSpeechInput(appendTranscript);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
        <p className="text-xs text-neutral-500">Speech input is not available in this browser — type your answer.</p>
      ) : null}
      {error ? <p className="text-xs text-amber-700">{error}</p> : null}
      {listening ? (
        <p className="text-xs font-medium text-rose-600">Listening… speak clearly, then tap the mic to stop.</p>
      ) : null}
    </div>
  );
}
