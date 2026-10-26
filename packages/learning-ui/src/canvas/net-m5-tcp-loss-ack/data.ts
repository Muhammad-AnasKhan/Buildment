import type { SequenceSpec } from "../renderers/sequence/types";

// 5.4 beat 3: a client sends a server three segments of 100 bytes, numbered by
// bytes from 1001. The link drops segment 2 (bytes 1101 to 1200). The server
// gets segment 3 but still asks for byte 1101, so its acknowledgement does not
// move: ack 1101, then ack 1101 again. All numbers are small and
// illustrative; real sequence numbers do not start at 1001 (the capture in
// chapter 5.6 shows real ones). The model is simple on purpose: one loss, no timer
// and no windows. The middle lane is the link between the two computers.
export const netM5TcpLossAck: SequenceSpec = {
  kind: "sequence",
  title: "The server keeps asking for byte 1101",
  purpose: "A client sends three segments of 100 bytes. The link drops the second, and the server's acknowledgement stops at byte 1101.",
  summary:
    "The client sends segment 1, bytes 1001 to 1100, and the server answers ack 1101, the next byte it expects. The client sends segment 2, bytes 1101 to 1200, and the link drops it. The client sends segment 3, bytes 1201 to 1300, and it arrives, but the server still expects byte 1101, so it answers ack 1101 again.",
  actors: [
    { name: "Client", sub: "sender" },
    { name: "Link", sub: "Wi-Fi" },
    { name: "Server", sub: "receiver" },
  ],
  steps: [
    {
      from: 0,
      to: 2,
      label: "seq 1001, 100 B",
      title: "Segment 1 leaves the client",
      note: "Every byte has a number. This segment carries 100 bytes, numbered 1001 to 1100. The client writes the first number, 1001, in the segment.",
      chips: ["seq: 1001", "length: 100 bytes"],
    },
    {
      from: 2,
      to: 0,
      label: "ack 1101",
      tone: "good",
      outcome: "ack 1101",
      title: "The server names the next byte it expects",
      note: "The server has bytes up to 1100. So it answers with the number of the byte it wants next: 1101. An acknowledgement always names the next byte, not the last one.",
      chips: ["ack: 1101", "next byte expected"],
    },
    {
      from: 0,
      to: 1,
      label: "seq 1101, 100 B",
      tone: "warn",
      title: "Segment 2 leaves the client",
      note: "The client sends bytes 1101 to 1200. It does not wait for an answer before it sends segment 3. The segment goes into the link.",
      chips: ["seq: 1101", "length: 100 bytes"],
    },
    {
      from: 1,
      to: 1,
      label: "dropped",
      tone: "bad",
      outcome: "lost",
      title: "The link drops segment 2",
      note: "Segment 2 never reaches the server. Nobody is told. The server does not know that bytes 1101 to 1200 were ever sent.",
      chips: ["bytes 1101 to 1200 lost"],
    },
    {
      from: 0,
      to: 2,
      label: "seq 1201, 100 B",
      title: "Segment 3 arrives anyway",
      note: "The client sends bytes 1201 to 1300. This segment is not lost. The server now holds bytes 1001 to 1100 and 1201 to 1300, with a gap in the middle.",
      chips: ["seq: 1201", "length: 100 bytes"],
    },
    {
      from: 2,
      to: 0,
      label: "ack 1101 again",
      tone: "warn",
      outcome: "ack 1101",
      title: "The same ack again: byte 1101 is still missing",
      note: "The server still expects byte 1101, so it says ack 1101 a second time. The number does not jump to 1301, because the gap is still there.",
      chips: ["ack: 1101", "same as before"],
    },
  ],
  tryThis: [
    "Before you press Next at step 6, say what number the server will answer with.",
    "Find the step where the ack number stops growing. Which segment caused that?",
  ],
  limits:
    "Small illustrative numbers: real sequence numbers do not start at 1001, and the capture in chapter 5.6 shows real, much larger ones. The picture shows one loss, three segments and no timers, no windows and no congestion control. A real receiver may also tell the sender which later segments it holds, which is not drawn.",
};
