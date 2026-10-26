import { Bot, KeyRound, Loader2, MessageSquareText, RotateCcw, Send, User } from "lucide-react";
import { Button, buttonVariants } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { AnswerTextareaWithMic } from "../../components/learn/answer-textarea-with-mic";
import { cn } from "../../lib/utils";
import type { AiInterviewSessionView } from "../../shared/api/ai";
import {
  AI_INTERVIEW_FLAG_LABELS,
  AI_INTERVIEW_FOCUS_LABELS,
  AI_INTERVIEW_LIMITS,
  contextFields,
  type SanitizedAiInterviewConfig,
} from "../../shared/blocks/ai-interview/schema";
import {
  AI_SETTINGS_HREF,
  checkAnswer,
  checkContext,
  contextReady,
  interviewStage,
  turnCounter,
  type ContextDrafts,
} from "./interview-model";

// The interview block, drawn from props only: the container owns the network and
// the drafts. Mobile first (a single column that works at 375px), colours come
// from theme tokens so light and dark mode both work.

export type InterviewBusy = null | "starting" | "answering" | "finishing";

export type AiInterviewViewProps = {
  config: SanitizedAiInterviewConfig;
  configured: boolean;
  hasKey: boolean;
  session: AiInterviewSessionView | null;
  /** One draft per context box the block asks for. */
  contextDrafts: ContextDrafts;
  answerDraft: string;
  busy: InterviewBusy;
  error: string | null;
  onContextChange: (field: keyof ContextDrafts, value: string) => void;
  onAnswerChange: (value: string) => void;
  onStart: () => void;
  onSend: () => void;
  onFinish: () => void;
  onStartOver: () => void;
  /** Leave the finished interview and show the start screen again. */
  onPracticeAgain: () => void;
};

function Shell({ config, children }: { config: SanitizedAiInterviewConfig; children: React.ReactNode }) {
  return (
    <section aria-label={`AI interview: ${config.title}`} className="not-prose my-6 overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm" data-block="ai-interview">
      <header className="space-y-2 border-b bg-muted/40 px-4 py-4 sm:px-6">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <MessageSquareText className="size-4" aria-hidden /> AI interview
        </p>
        <h3 className="text-lg font-semibold leading-snug tracking-tight">{config.title}</h3>
        <ul className="flex flex-wrap gap-1.5" aria-label="Topics">
          {config.focus.map((area) => (
            <li key={area} className="rounded-full border bg-background px-2.5 py-0.5 text-xs text-muted-foreground">
              {AI_INTERVIEW_FOCUS_LABELS[area]}
            </li>
          ))}
        </ul>
      </header>
      <div className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">{children}</div>
    </section>
  );
}

function ErrorLine({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  );
}

function Counter({ used, max, over }: { used: number; max: number; over: boolean }) {
  return (
    <span className={cn("text-xs tabular-nums", over ? "text-destructive" : "text-muted-foreground")}>
      {used.toLocaleString("en")} / {max.toLocaleString("en")}
    </span>
  );
}

function Bubble({ role, children }: { role: "interviewer" | "candidate"; children: React.ReactNode }) {
  const mine = role === "candidate";
  return (
    <li className={cn("flex gap-2", mine && "flex-row-reverse")}>
      <span
        className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full", mine ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
        aria-hidden
      >
        {mine ? <User className="size-4" /> : <Bot className="size-4" />}
      </span>
      <div className="max-w-[85%] min-w-0">
        <p className="mb-0.5 text-xs text-muted-foreground">{mine ? "You" : "Interviewer"}</p>
        <p className={cn("whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm leading-6", mine ? "rounded-tr-sm bg-primary/10" : "rounded-tl-sm bg-muted")}>{children}</p>
      </div>
    </li>
  );
}

function Transcript({ session, pending }: { session: AiInterviewSessionView; pending: boolean }) {
  return (
    <ol className="space-y-3" role="log" aria-live="polite" aria-label="Interview conversation">
      {session.transcript.map((turn, index) => (
        <Bubble key={`${turn.at}-${index}`} role={turn.role}>
          {turn.content}
        </Bubble>
      ))}
      {pending ? (
        <li className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
          <Loader2 className="size-4 animate-spin" aria-hidden /> The interviewer is thinking...
        </li>
      ) : null}
    </ol>
  );
}

function FeedbackCard({ session, config }: { session: AiInterviewSessionView; config: SanitizedAiInterviewConfig }) {
  const feedback = session.feedback!;
  return (
    <div className="space-y-5" data-testid="ai-interview-feedback">
      <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-300">
        Interview finished. This block is complete.
      </p>
      <div>
        <h4 className="text-sm font-semibold">Strengths to build on</h4>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6">
          {feedback.strengths.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-sm font-semibold">What to do better</h4>
        <ul className="mt-2 space-y-3">
          {feedback.weaknesses.map((item) => (
            <li key={item.point} className="rounded-lg border bg-muted/40 p-3 text-sm leading-6">
              <p>{item.point}</p>
              <p className="mt-1.5">
                <span className="font-medium">Try this: </span>
                {item.fix}
              </p>
            </li>
          ))}
        </ul>
      </div>
      {feedback.focusNotes.length > 0 ? (
        <div>
          <h4 className="text-sm font-semibold">Notes by topic</h4>
          <dl className="mt-2 space-y-2 text-sm leading-6">
            {feedback.focusNotes.map((item) => (
              <div key={item.focus}>
                <dt className="font-medium">{AI_INTERVIEW_FOCUS_LABELS[item.focus]}</dt>
                <dd className="text-muted-foreground">{item.note}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
      {feedback.flags.length > 0 ? (
        <div data-testid="ai-interview-flags">
          <h4 className="text-sm font-semibold">Things to watch</h4>
          <p className="mt-1 text-xs text-muted-foreground">These came from your own words. Each one is a habit you can change.</p>
          <ul className="mt-2 space-y-2">
            {feedback.flags.map((flag, index) => (
              <li key={`${flag.name}-${index}`} className="rounded-lg border bg-amber-500/10 p-3 text-sm leading-6">
                <p className="font-medium">{AI_INTERVIEW_FLAG_LABELS[flag.name]}</p>
                <blockquote className="mt-1 border-l-2 border-amber-500/60 pl-3 text-muted-foreground">{flag.quote}</blockquote>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div>
        <h4 className="text-sm font-semibold">Your next three steps</h4>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-6">
          {feedback.nextSteps.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </div>
      <details className="rounded-lg border p-3 text-sm">
        <summary className="cursor-pointer font-medium">Read the full conversation ({session.turnCount} answers)</summary>
        <div className="mt-3">
          <Transcript session={session} pending={false} />
        </div>
      </details>
      <p className="text-xs text-muted-foreground">
        {config.maxTurns} answers at most. Your mentor can read this conversation and the feedback.
      </p>
    </div>
  );
}

export function AiInterviewView(props: AiInterviewViewProps) {
  const { config, session, busy, error } = props;
  const stage = interviewStage({ configured: props.configured, hasKey: props.hasKey, session });

  if (stage === "unavailable") {
    return (
      <Shell config={config}>
        <p className="text-sm leading-6 text-muted-foreground">AI interviews are not set up on this server. Ask your mentor or the site owner to turn them on.</p>
      </Shell>
    );
  }

  if (stage === "no-key") {
    return (
      <Shell config={config}>
        <p className="text-sm leading-6">{config.opening}</p>
        <div className="rounded-xl border border-dashed p-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <KeyRound className="size-4" aria-hidden /> Add your own OpenRouter key to practise
          </p>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            This interview uses your key, so you pay OpenRouter directly for a few cents of usage. Free models work too. It takes about a minute to set up.
          </p>
          <a href={AI_SETTINGS_HREF} className={cn(buttonVariants(), "mt-3 h-10 w-full sm:w-auto")}>
            Go to settings
          </a>
        </div>
      </Shell>
    );
  }

  if (stage === "feedback" && session) {
    return (
      <Shell config={config}>
        <FeedbackCard session={session} config={config} />
        <Button variant="outline" className="h-10 w-full sm:w-auto" onClick={props.onPracticeAgain} disabled={busy !== null}>
          <RotateCcw aria-hidden /> Practise again
        </Button>
        <ErrorLine message={error} />
      </Shell>
    );
  }

  if (stage === "chat" && session) {
    const check = checkAnswer(props.answerDraft);
    const thinking = busy === "answering";
    const finishing = busy === "finishing";
    return (
      <Shell config={config}>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span aria-live="polite" data-testid="turn-counter">
            {turnCounter(session)}
          </span>
          <button type="button" className="underline-offset-4 hover:underline disabled:opacity-50" onClick={props.onStartOver} disabled={busy !== null}>
            Start over
          </button>
        </div>
        <Transcript session={session} pending={thinking} />
        {session.limitReached ? (
          <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">That was your last answer. Finish the interview to get your feedback.</p>
        ) : (
          <form
            className="space-y-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (check.canSend && busy === null) props.onSend();
            }}
          >
            <AnswerTextareaWithMic
              id={`answer-${session.id}`}
              value={props.answerDraft}
              onChange={props.onAnswerChange}
              ariaLabel="Your answer"
              placeholder="Type or speak your answer. Simple words are fine."
              rows={4}
              className="min-h-24 text-base"
              disabled={busy !== null}
              invalid={check.tooLong}
              describedBy={`answer-count-${session.id}`}
            />
            <div className="flex items-center justify-between gap-3">
              <span id={`answer-count-${session.id}`}>
                <Counter used={check.length} max={AI_INTERVIEW_LIMITS.answerMaxChars} over={check.tooLong} />
              </span>
              <Button type="submit" className="h-10 px-4" disabled={!check.canSend || busy !== null}>
                {thinking ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />} {thinking ? "Sending" : "Send"}
              </Button>
            </div>
          </form>
        )}
        <ErrorLine message={error} />
        <div className="border-t pt-4">
          <Button variant={session.limitReached ? "default" : "outline"} className="h-10 w-full sm:w-auto" onClick={props.onFinish} disabled={!session.canFinish || busy !== null}>
            {finishing ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {finishing ? "Writing your feedback..." : "Finish and get feedback"}
          </Button>
          {!session.canFinish ? <p className="mt-2 text-xs text-muted-foreground">Answer at least one question first.</p> : null}
        </div>
      </Shell>
    );
  }

  // intro: a key is saved, no session is running.
  const boxes = contextFields(config.context);
  const canStart = contextReady(config.context, props.contextDrafts);
  const starting = busy === "starting";
  return (
    <Shell config={config}>
      <p className="text-sm leading-6">{config.opening}</p>
      <p className="text-sm leading-6 text-muted-foreground">
        A text interview with up to {config.maxTurns} answers. Write simple, honest answers. You can finish early and get feedback.
      </p>
      {boxes.map((box) => {
        const text = props.contextDrafts[box.field];
        const check = checkContext(text, box.min, box.max);
        const id = `ai-interview-${box.field}`;
        return (
          <div key={box.field} className="space-y-2" data-field={box.field}>
            <label htmlFor={id} className="text-sm font-medium">
              {box.label}
            </label>
            <p id={`${id}-hint`} className="text-xs text-muted-foreground">
              {box.hint}
            </p>
            <Textarea
              id={id}
              value={text}
              onChange={(event) => props.onContextChange(box.field, event.target.value)}
              rows={6}
              className="min-h-32 resize-y text-base"
              disabled={busy !== null}
              aria-invalid={check.tooLong}
              aria-describedby={`${id}-hint`}
            />
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">{check.tooShort ? `At least ${box.min} characters` : " "}</span>
              <Counter used={text.length} max={box.max} over={check.tooLong} />
            </div>
          </div>
        );
      })}
      <ErrorLine message={error} />
      <Button className="h-10 w-full sm:w-auto" onClick={props.onStart} disabled={busy !== null || !canStart}>
        {starting ? <Loader2 className="animate-spin" aria-hidden /> : null}
        {starting ? "Starting..." : "Start interview"}
      </Button>
    </Shell>
  );
}
