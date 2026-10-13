"use client";

import { useCallback, useMemo } from "react";
import type { MdxJsxAttribute } from "mdast-util-mdx-jsx";
import { useMdastNodeUpdater, type JsxEditorProps } from "@mdxeditor/editor";
import { CircleHelp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useChapterBlockConfig } from "@/components/teach/editor/chapter-block-configs";
import {
  defaultQuizDraft,
  quizDraftFromConfig,
  quizDraftFromJsxProperties,
  quizDraftToJsxProperties,
  type QuizOptionDraft,
} from "@/blocks/quiz/quiz-editor-utils";
import { cn } from "@/lib/utils";

function readPropertiesFromMdast(mdastNode: JsxEditorProps["mdastNode"], propNames: string[]) {
  const out: Record<string, string> = {};
  for (const name of propNames) {
    const attribute = mdastNode.attributes.find(
      (attr): attr is MdxJsxAttribute =>
        attr.type === "mdxJsxAttribute" && attr.name === name
    );
    if (!attribute) {
      out[name] = "";
      continue;
    }
    const value = attribute.value;
    if (typeof value === "string") {
      out[name] = value;
    } else if (value && typeof value === "object" && "value" in value && typeof value.value === "string") {
      out[name] = value.value;
    } else {
      out[name] = "";
    }
  }
  return out;
}

function draftFromMdast(
  mdastNode: JsxEditorProps["mdastNode"],
  storedConfig: unknown
): ReturnType<typeof defaultQuizDraft> {
  const props = readPropertiesFromMdast(mdastNode, [
    "id",
    "prompt",
    "question",
    "quizType",
    "options",
    "correctOptionIds",
    "explanation",
    "allowRetry",
  ]);
  const fromJsx = quizDraftFromJsxProperties(props);
  const hasInline =
    Boolean(props.prompt?.trim() || props.question?.trim()) ||
    Boolean(props.options?.trim()) ||
    Boolean(props.correctOptionIds?.trim());
  if (hasInline) return fromJsx;
  if (storedConfig) return quizDraftFromConfig(storedConfig);
  return fromJsx;
}

function attributesFromDraft(
  descriptor: JsxEditorProps["descriptor"],
  draft: ReturnType<typeof defaultQuizDraft>,
  blockId: string | undefined
): MdxJsxAttribute[] {
  const values = quizDraftToJsxProperties({ id: blockId, draft });
  return Object.entries(values).reduce<MdxJsxAttribute[]>((acc, [name, value]) => {
    if (value === "" && name !== "prompt") return acc;
    const property = descriptor.props.find((prop) => prop.name === name);
    if (property?.type === "expression") {
      acc.push({
        type: "mdxJsxAttribute",
        name,
        value: { type: "mdxJsxAttributeValueExpression", value },
      });
      return acc;
    }
    acc.push({ type: "mdxJsxAttribute", name, value });
    return acc;
  }, []);
}

function trueFalseOptions(): QuizOptionDraft[] {
  return [
    { id: "true", label: "True" },
    { id: "false", label: "False" },
  ];
}

export function QuizJsxEditor({ mdastNode, descriptor }: JsxEditorProps) {
  const updateMdastNode = useMdastNodeUpdater();
  const props = readPropertiesFromMdast(mdastNode, ["id"]);
  const blockId = props.id?.trim() || undefined;
  const storedConfig = useChapterBlockConfig(blockId);

  const draft = useMemo(
    () => draftFromMdast(mdastNode, storedConfig),
    [mdastNode, storedConfig]
  );

  const commit = useCallback(
    (next: ReturnType<typeof defaultQuizDraft>) => {
      updateMdastNode({
        attributes: attributesFromDraft(descriptor, next, blockId),
      });
    },
    [blockId, descriptor, updateMdastNode]
  );

  const toggleCorrect = (optionId: string) => {
    if (draft.quizType === "multiple") {
      const set = new Set(draft.correctOptionIds);
      if (set.has(optionId)) set.delete(optionId);
      else set.add(optionId);
      commit({ ...draft, correctOptionIds: [...set] });
      return;
    }
    commit({ ...draft, correctOptionIds: [optionId] });
  };

  const setQuizType = (quizType: typeof draft.quizType) => {
    if (quizType === "true-false") {
      commit({
        ...draft,
        quizType,
        options: trueFalseOptions(),
        correctOptionIds: ["true"],
      });
      return;
    }
    const options =
      draft.quizType === "true-false" ? defaultQuizDraft().options : draft.options;
    commit({
      ...draft,
      quizType,
      options,
      correctOptionIds: options[0] ? [options[0].id] : [],
    });
  };

  return (
    <div className="my-3 rounded-xl border border-violet-200/80 bg-gradient-to-b from-violet-50/50 to-white p-4 shadow-sm dark:border-violet-900/50 dark:from-violet-950/20 dark:to-card">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-violet-950 dark:text-violet-100">
        <CircleHelp className="size-4 shrink-0" aria-hidden />
        Quiz block
        {blockId ? (
          <span className="ml-auto truncate font-mono text-xs font-normal text-muted-foreground">{blockId}</span>
        ) : null}
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor={`quiz-prompt-${blockId ?? "new"}`}>Question</Label>
          <Textarea
            id={`quiz-prompt-${blockId ?? "new"}`}
            value={draft.prompt}
            placeholder="Ask the learner something specific…"
            rows={3}
            onChange={(event) => commit({ ...draft, prompt: event.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`quiz-type-${blockId ?? "new"}`}>Answer type</Label>
          <select
            id={`quiz-type-${blockId ?? "new"}`}
            value={draft.quizType}
            onChange={(event) =>
              setQuizType(event.target.value as typeof draft.quizType)
            }
            className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="single">Single choice</option>
            <option value="multiple">Multiple choice</option>
            <option value="true-false">True / false</option>
          </select>
        </div>

        {draft.quizType !== "true-false" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Options</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const id = `opt-${draft.options.length}`;
                  commit({
                    ...draft,
                    options: [...draft.options, { id, label: "" }],
                  });
                }}
              >
                <Plus className="size-3.5" />
                Add option
              </Button>
            </div>
            <ul className="space-y-2">
              {draft.options.map((option, index) => (
                <li key={option.id} className="flex items-start gap-2">
                  <button
                    type="button"
                    aria-label={
                      draft.correctOptionIds.includes(option.id)
                        ? "Correct answer"
                        : "Mark as correct"
                    }
                    onClick={() => toggleCorrect(option.id)}
                    className={cn(
                      "mt-2 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      draft.correctOptionIds.includes(option.id)
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-muted-foreground/40 bg-background"
                    )}
                  >
                    {draft.correctOptionIds.includes(option.id) ? (
                      <span className="size-2 rounded-full bg-white" />
                    ) : null}
                  </button>
                  <Input
                    value={option.label}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1"
                    onChange={(event) => {
                      const options = draft.options.map((row) =>
                        row.id === option.id ? { ...row, label: event.target.value } : row
                      );
                      commit({ ...draft, options });
                    }}
                  />
                  {draft.options.length > 2 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove option"
                      onClick={() => {
                        const options = draft.options.filter((row) => row.id !== option.id);
                        const correctOptionIds = draft.correctOptionIds.filter((id) =>
                          options.some((row) => row.id === id)
                        );
                        commit({
                          ...draft,
                          options,
                          correctOptionIds:
                            correctOptionIds.length > 0
                              ? correctOptionIds
                              : options[0]
                                ? [options[0].id]
                                : [],
                        });
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              Click the circle to mark correct answer
              {draft.quizType === "multiple" ? "s" : ""}. Source mode keeps{" "}
              <code className="text-[11px]">correctOptionIds</code> in sync.
            </p>
          </div>
        ) : (
          <div className="flex gap-2">
            {trueFalseOptions().map((option) => (
              <Button
                key={option.id}
                type="button"
                variant={draft.correctOptionIds.includes(option.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleCorrect(option.id)}
              >
                {option.label}
                {draft.correctOptionIds.includes(option.id) ? " (correct)" : ""}
              </Button>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor={`quiz-explanation-${blockId ?? "new"}`}>Feedback (optional)</Label>
          <Textarea
            id={`quiz-explanation-${blockId ?? "new"}`}
            value={draft.explanation}
            placeholder="Explain the correct answer after submission…"
            rows={2}
            onChange={(event) => commit({ ...draft, explanation: event.target.value })}
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id={`quiz-retry-${blockId ?? "new"}`}
            checked={draft.allowRetry}
            onCheckedChange={(checked) =>
              commit({ ...draft, allowRetry: checked === true })
            }
          />
          <Label htmlFor={`quiz-retry-${blockId ?? "new"}`}>Allow retry after incorrect answer</Label>
        </div>
      </div>
    </div>
  );
}
