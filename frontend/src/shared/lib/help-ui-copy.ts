// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
/** User-facing labels for chapter questions (learner ↔ mentor). */

export const helpUiCopy = {
  learnerNav: "Your questions",
  askQuestion: "Ask a question",
  askQuestionShort: "Question",
  questionSent: "Question sent",
  mentorReplied: "Mentor replied",
  dialogTitle: "Ask your question",
  allQuestionsLink: "All your questions",

  pageEyebrow: "Support",
  pageTitle: "Your questions",
  pageSubtitle: "Questions you asked from lessons. Your mentor replies here.",
  emptyTitle: "No questions yet",
  emptyHintBefore: "When you're stuck, use ",
  emptyHintAfter: " at the top of any lesson.",

  composerNew: "Your question",
  composerFollowUp: "Add a follow-up",
  composerPlaceholder: "What are you stuck on in this lesson?",
  sendToMentor: "Send to mentor",
  sendFollowUp: "Send follow-up",
  mentorSeesInbox: "Your mentor sees this on Learner questions.",

  mentorNav: "Learner questions",
  mentorTitle: "Learner questions",
  mentorSubtitle:
    "Questions from your learners. Reply here—they see it on the lesson.",
  mentorEmpty: "When a learner asks a question from a lesson, it appears here.",
  mentorComposerHint:
    "Your learner sees this when they reopen the lesson or open Your questions.",
  mentorThreadTitle: "Question thread",

  resolvedAskAgain: "Ask a question",
  resolvedStartNew: "start a new question",
  resolvedFollowUpBelow: "Send a new question below if you're stuck again.",
  resolvedMentorSide:
    "Resolved—the learner can ask a new question from the lesson if they need more help.",

  dashboardTitleUnread: "Mentor replied",
  dashboardTitleOpen: "Question open",
  dashboardReasonUnread: "A reply is waiting in Your questions.",
  dashboardReasonOpen: "Your question is still open.",

  activitySectionTitle: "Questions",
  activityEmpty: "No questions yet.",
  evaluationOpenItem: "Open question",
  menteeAttentionLabel: (count: number) =>
    `${count} open question${count === 1 ? "" : "s"}`,

  eventQuestionCreated: "Question asked",
  eventQuestionResolved: "Question resolved",
  mentorOpenCount: (count: number) =>
    `${count} open question${count === 1 ? "" : "s"} need a response`,
  mentorEmptyOpen: "No open questions",
  mentorEmptyResolved: "No resolved questions",

  replyAction: "Reply",
  replyingToPrefix: "Replying to",
  cancelReply: "Cancel reply",
  unreadDivider: "New messages",
} as const;
