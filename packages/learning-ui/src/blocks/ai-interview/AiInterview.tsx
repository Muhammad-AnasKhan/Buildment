import { AI_INTERVIEW_LIMITS, type SanitizedAiInterviewConfig } from "../../shared/blocks/ai-interview/schema";
import { AiInterviewView } from "./AiInterviewView";

const unavailableConfig: SanitizedAiInterviewConfig = {
  title: "AI interview",
  opening: "This interview is not available in this app yet.",
  focus: ["ownership"],
  context: "none" as const,
  maxTurns: AI_INTERVIEW_LIMITS.defaultMaxTurns,
  whyDepth: AI_INTERVIEW_LIMITS.defaultWhyDepth,
};

/** Shared unavailable state for hosts that do not provide interview services. */
export function AiInterview() {
  return (
    <AiInterviewView
      config={unavailableConfig}
      configured={false}
      hasKey={false}
      session={null}
      contextDraft=""
      answerDraft=""
      busy={null}
      error={null}
      onContextChange={() => undefined}
      onAnswerChange={() => undefined}
      onStart={() => undefined}
      onSend={() => undefined}
      onFinish={() => undefined}
      onStartOver={() => undefined}
      onPracticeAgain={() => undefined}
    />
  );
}
