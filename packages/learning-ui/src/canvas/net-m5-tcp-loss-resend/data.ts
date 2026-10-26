import type { SequenceSpec } from "../renderers/sequence/types";

// 5.4 beat 4: the story continues from net-m5-tcp-loss-ack. The client has seen
// the same acknowledgement twice, ack 1101, while it sent bytes up to 1300. It
// sends the 100 bytes that start at 1101 again. This time they arrive, and
// the server, which was holding bytes 1201 to 1300, answers ack 1301: the next
// byte it expects now that nothing is missing. A real sender sends again after
// three repeated acknowledgements in a row (RFC 5681) or when a timer runs
// out. With three segments there is only one repeat, so the picture skips the
// wait and quotes no time. All numbers are small and
// illustrative.
export const netM5TcpLossResend: SequenceSpec = {
  kind: "sequence",
  title: "The client sends byte 1101 again",
  purpose: "The same acknowledgement twice hints that bytes from 1101 are missing. After a wait that the picture skips, the client sends them again, and the ack jumps to 1301.",
  summary:
    "The client sees ack 1101 twice, a hint that the bytes from 1101 did not arrive. A real client waits for more repeats or for a timer, and the picture skips that wait. It sends the 100 bytes that start at 1101 again, and this time they reach the server. The server already holds bytes 1201 to 1300, so it answers ack 1301, the next byte it expects.",
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
      title: "The same number twice hints: something is missing",
      note: "The client has sent bytes up to 1300, yet the server still asks for byte 1101. The client reads this as a hint that the bytes that start at 1101 did not arrive. One repeat is not enough for a real sender to be sure. It waits for three repeats in a row or for a timer, and the picture skips the wait.",
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
    "Find the step where the client decides to send again. What did it see, and what would a real sender wait for first?",
  ],
  limits:
    "Small illustrative numbers: real sequence numbers do not start at 1001. A real sender sends again after three repeated acknowledgements in a row or when a timer runs out. This picture has only one repeat, so it skips the wait, and it quotes no time. It shows one lost segment, with no windows and no congestion control.",
};
