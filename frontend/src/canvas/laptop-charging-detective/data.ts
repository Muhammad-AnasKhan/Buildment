import type { SequenceSpec } from "../renderers/sequence/types";

// Why Things Happen course, chapter 5.3 "Guess, test, repeat".
// Nour finds why her laptop will not charge by testing the cheapest likely
// cause first, one change at a time, and ruling out half the chain with one
// test. See spec.md.
export const laptopChargingDetective: SequenceSpec = {
  kind: "sequence",
  title: "Why will Nour's laptop not charge?",
  purpose: "See how describing the problem, then testing one cheap cause at a time, finds a fault without guessing.",
  summary:
    "Nour describes the problem, lists possible causes, tests the socket with a lamp, tests the charger on her phone, which rules out everything before the laptop, finds dust in the laptop's charging port, cleans it safely and writes down what she did.",
  actors: [
    { name: "Nour", sub: "you" },
    { name: "Socket", sub: "wall" },
    { name: "Charger", sub: "and cable" },
    { name: "Laptop", sub: "port" },
  ],
  steps: [
    {
      from: 0,
      to: 0,
      label: "describe it",
      title: "Describe the problem exactly",
      note: "What: no charging light, battery at 9%. When: since this morning. Where: at her desk. Not affected: her phone charges fine from another socket in the same room.",
      chips: ["no charging light", "since this morning", "phone still charges"],
    },
    {
      from: 0,
      to: 0,
      label: "list causes",
      title: "List the possible causes",
      note: "Power travels from the socket, through the charger and cable, into the laptop's port and battery. Any link could be the fault. A useful rule of thumb: test the cheapest likely one first, and change one thing at a time.",
      chips: ["socket", "charger and cable", "laptop port", "battery"],
    },
    {
      from: 0,
      to: 1,
      label: "plug in a lamp",
      tone: "good",
      outcome: "socket works",
      title: "Test 1: the socket",
      note: "She plugs a lamp into the same socket. It lights up, so the socket is ruled out. One test, one change, a clear answer.",
    },
    {
      from: 0,
      to: 2,
      label: "charge the phone",
      tone: "good",
      outcome: "charger works",
      title: "Test 2: the charger and cable",
      note: "Her laptop charger has the same kind of plug as her phone. It charges the phone, so the charger and cable almost certainly work: a phone draws less power than a laptop, so this is strong evidence, not proof. With one test she has set aside everything before the laptop: half the chain.",
    },
    {
      from: 0,
      to: 3,
      label: "look in the port",
      tone: "warn",
      outcome: "dust found",
      title: "Test 3: the laptop's port",
      note: "With the laptop switched off and unplugged, she shines her phone torch into the charging port. It is packed with dust and fluff from her bag.",
      chips: ["switched off", "unplugged"],
    },
    {
      from: 0,
      to: 3,
      label: "clean, then test",
      tone: "good",
      outcome: "charging",
      title: "Fix it, then check the fix",
      note: "She removes the dust gently with a wooden toothpick, never anything metal, and without pushing hard; if it does not come out easily, the next step is a repair shop. She plugs in again, and the charging light comes on. The fix is confirmed by a test, not assumed.",
    },
    {
      from: 0,
      to: 0,
      label: "write it down",
      title: "Keep a short log",
      note: "She writes the problem, each test in order, what it ruled out, and the fix. If it happens again, she starts from the port and saves an hour.",
    },
  ],
  tryThis: [
    "Before step 4, predict what one test on the phone can rule out. Then check.",
    "Why did Nour test the socket before checking the laptop itself? What makes a test 'cheap'?",
  ],
  limits:
    "Here the first good guess was right and each test gave a clear answer. Real faults can have two causes at once, or a test that only works some of the time; then repeat the test and keep the log. Never open a device or a charger yourself: some faults need a repair shop.",
};
