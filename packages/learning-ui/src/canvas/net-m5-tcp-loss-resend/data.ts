import type { SequenceSpec } from "../renderers/sequence/types";

// 5.4 beat 4: the story continues from net-m5-tcp-loss-ack. The client has seen
// the same acknowledgement twice, ack 1101, while it sent bytes up to 1300. It
// sends the 100 bytes that start at 1101 again. This time they arrive, and
// the server, which was holding bytes 1201 to 1300, answers ack 1301: the next
// byte it expects now that nothing is missing. The picture does not say what
// triggers the second send in a real stack (a timer or repeated
// acknowledgements) and quotes no time and no count. All numbers are small and
// illustrative.
export const netM5TcpLossResend: SequenceSpec = {
  kind: "sequence",
  title: "The client sends byte 1101 again",
  purpose: "The same acknowledgement twice tells the client that bytes from 1101 are missing. It sends them again, and the ack jumps to 1301.",
  summary:
    "The client sees ack 1101 twice and knows that the bytes from 1101 did not arrive. It sends the 100 bytes that start at 1101 again, and this time they reach the server. The server already holds bytes 1201 to 1300, so it answers ack 1301, the next byte it expects.",
  actors: [
    { name: "Client", sub: "sender" },
    { name: "Server", sub: "receiver" },
  ],
  steps: [
    {
      from: 0,
      to: 0,
      label: "ack 1101 twice",
      tone: "warn",
      outcome: "ack 1101 x2",
      title: "The same number twice means: something is missing",
      note: "The client has sent bytes up to 1300, yet the server still asks for byte 1101. The client reads this as: the bytes that start at 1101 did not arrive.",
      chips: ["ack: 1101", "ack: 1101"],
    },
    {
      from: 0,
      to: 1,
      label: "seq 1101, 100 B",
      tone: "accent",
      outcome: "resent",
      title: "The client sends byte 1101 again",
      note: "It sends the same 100 bytes again, numbered 1101 to 1200. The numbers are the same as the first time, so the server can put the bytes in their place.",
      chips: ["seq: 1101", "length: 100 bytes", "sent a second time"],
    },
    {
      from: 1,
      to: 0,
      label: "ack 1301",
      tone: "good",
      outcome: "ack 1301",
      title: "The ack jumps to 1301",
      note: "Now the server holds bytes 1001 to 1300 with no gap. The next byte it expects is 1301, so that is the number it sends. The jump from 1101 to 1301 tells the client that all three segments arrived.",
      chips: ["ack: 1301", "no gap left"],
    },
  ],
  tryThis: [
    "Say why the ack jumps by 200 and not by 100.",
    "Find the step where the client decides to send again. What did it see?",
  ],
  limits:
    "Small illustrative numbers: real sequence numbers do not start at 1001. The picture does not say what makes a real sender send again (a timer, or several repeated acknowledgements), and it quotes no time and no count. It shows one lost segment, with no windows and no congestion control.",
};
