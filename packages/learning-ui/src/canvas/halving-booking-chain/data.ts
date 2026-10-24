import type { SequenceSpec } from "../renderers/sequence/types";

// Why Things Happen course, chapter 5.4 "Split the problem in half".
// Hadi's barber shop: a booking passes through 8 steps before he sees it.
// Three tests in the middle of what is left find the broken step. See spec.md.
export const halvingBookingChain: SequenceSpec = {
  kind: "sequence",
  title: "Split in half: where do Hadi's bookings go?",
  purpose: "See how testing the middle of a chain rules out half of what is left with each test.",
  summary:
    "A booking passes through 8 steps. Hadi opens his booking sheet and finds the bookings, which clears steps 1 to 4. He searches his inbox and finds no alerts, so the fault is in step 5 or 6. He finds the alerts in the spam folder, so step 6 is the fault. He marks them as not spam, sends a test booking, and the alert reaches his phone. Three tests instead of up to seven.",
  actors: [
    { name: "Hadi", sub: "barber" },
    { name: "Booking sheet", sub: "after step 4" },
    { name: "Email", sub: "steps 5 and 6" },
    { name: "Phone", sub: "steps 7 and 8" },
  ],
  steps: [
    {
      from: 0,
      to: 0,
      label: "write the chain",
      title: "Eight steps, one fault",
      note: "Form opened, filled in, sent, saved in the sheet, alert sent, alert in the inbox, phone notification, Hadi reads it. Since Sunday he sees no bookings. The fault is in one of the 8 steps.",
      chips: ["8 steps", "since Sunday"],
    },
    {
      from: 0,
      to: 1,
      label: "open the sheet",
      tone: "good",
      outcome: "4 steps left",
      title: "Test 1: the middle of 8",
      note: "All three bookings are in the sheet, with their Monday, Tuesday and Wednesday dates. Steps 1 to 4 work. One look has cleared half the chain.",
    },
    {
      from: 0,
      to: 2,
      label: "search the inbox",
      tone: "warn",
      outcome: "2 steps left",
      title: "Test 2: the middle of steps 5 to 8",
      note: "He searches his inbox for the word 'booking'. Nothing since Sunday. The fault is in step 5 (the alert is sent) or step 6 (it reaches the inbox).",
    },
    {
      from: 0,
      to: 2,
      label: "search spam",
      tone: "warn",
      outcome: "step 6",
      title: "Test 3: the last split",
      note: "He searches every folder. All three alerts are in the spam folder. So step 5 works, and step 6 is the fault: the alerts go to spam.",
    },
    {
      from: 0,
      to: 2,
      label: "mark not spam",
      title: "The fix",
      note: "He marks the three alerts as 'not spam' and adds the sheet's address to his contacts.",
    },
    {
      from: 0,
      to: 3,
      label: "test booking",
      tone: "good",
      outcome: "fix confirmed",
      title: "Check the fix",
      note: "He sends a test booking through his own form. A minute later the alert is in his inbox and his phone shows the notification. He does it again the next morning, and it works again.",
    },
    {
      from: 0,
      to: 0,
      label: "count the tests",
      title: "Three tests, not seven",
      note: "Testing one step at a time from the start could have taken up to 7 tests. Halving took 3: 8 steps, then 4, then 2, then 1.",
      chips: ["8", "4", "2", "1"],
    },
  ],
  tryThis: [
    "Before step 2, predict how much of the 8-step chain one look at the booking sheet can clear. Then check.",
    "After each test, count the steps still under suspicion. What would a test at step 2 instead of step 4 have cleared?",
  ],
  limits:
    "Here each step feeds the next, one step is broken, and every test gives a clear answer. Splitting in half helps less when several causes act together, when the middle cannot be tested safely, or when a fault comes and goes; then repeat each test before you trust it.",
};
