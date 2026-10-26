import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { outputOf, type ReplayData } from "../models/net-replay";
import { ReplayCanvas } from "../net-m1-replay-setup-checker/ReplayCanvas";

// 5.6 phone readers: challenge 3 part 1 played from a real recording (session
// conversation in the course recordings, run in the course lab on 2026-10-26
// with the reference solution): conversation.sh puts the server on 127.0.0.1
// and then on 0.0.0.0, captures the handshake and reads one open conversation
// from both sides; test.sh checks all of it. Each step hides its output until
// the learner picks what will happen: curl against 127.0.0.1, and what the
// test expects from that refusal. Every output line is copied from the
// recording. The renderer is ReplayCanvas in net-m1-replay-setup-checker; the
// model is models/net-replay.ts.
const TITLE = "The conversation, replayed";
const PURPOSE = "Follow a recorded run of challenge 3: a server on 127.0.0.1 turns the laptop away, a server on 0.0.0.0 answers, the handshake is captured, and the test passes.";
const LIMITS =
  "A recording of one real run in the course lab, with the finished solution of the challenge. The two computers, the addresses and the port 8080 are the course's own. The laptop's port in the capture (48158) and in the open conversation (48172) belong to two different conversations of the same run, so they differ. The process numbers and times are those of the run and will differ in yours.";

const DIR = "challenges/challenge-3-conversation/part-1-listening-and-the-handshake";

export const netM5ReplayConversationData: ReplayData = {
  steps: [
    {
      runsOn: "lab",
      command: `bash ${DIR}/conversation.sh`,
      output: outputOf([
        "--- 3. the server listens on 127.0.0.1 only",
        "State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess",
        "LISTEN 0      9          127.0.0.1:8080      0.0.0.0:*    users:((\"busybox\",pid=198,fd=3))",
        "curl: (7) Failed to connect to 192.168.1.80 port 8080 after 0 ms: Couldn't connect to server",
        "curl from the laptop exited with 7. Exit code 7 means: connection refused.",
        "--- 4. the server listens on 0.0.0.0",
        "State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess",
        "LISTEN 0      9            0.0.0.0:8080      0.0.0.0:*    users:((\"busybox\",pid=207,fd=3))",
        "hello from the server",
        "--- 5. the handshake",
        "tcpdump: verbose output suppressed, use -v[v]... for full protocol decode",
        "listening on veth-server, link-type EN10MB (Ethernet), snapshot length 262144 bytes",
        "10:39:05.171782 IP 192.168.1.23.48158 > 192.168.1.80.8080: Flags [S], seq 557210665, win 64240, options [mss 1460,sackOK,TS val 710427391 ecr 0,nop,wscale 7], length 0",
        "10:39:05.171824 IP 192.168.1.80.8080 > 192.168.1.23.48158: Flags [S.], seq 1089803950, ack 557210666, win 65160, options [mss 1460,sackOK,TS val 2147467152 ecr 710427391,nop,wscale 7], length 0",
        "10:39:05.171850 IP 192.168.1.23.48158 > 192.168.1.80.8080: Flags [.], ack 1, win 502, options [nop,nop,TS val 710427393 ecr 2147467152], length 0",
        "3 packets captured",
        "12 packets received by filter",
        "0 packets dropped by kernel",
        "--- 6. one open conversation, seen from both sides",
        "laptop sees:",
        "State Recv-Q Send-Q Local Address:Port  Peer Address:PortProcess",
        "ESTAB 0      0       192.168.1.23:48172 192.168.1.80:8080",
        "server sees:",
        "State Recv-Q Send-Q Local Address:Port Peer Address:Port Process",
        "ESTAB 0      0       192.168.1.80:8080 192.168.1.23:48172",
        "Done. The server is still listening on 0.0.0.0:8080. Next: bash test.sh",
      ]),
      note: "Server on 127.0.0.1: refused at once, exit 7. Server on 0.0.0.0: the page. The handshake is [S], [S.], [.], and both sides show the same four numbers.",
      predict: {
        question: "The server listens on 127.0.0.1 only. What does curl from the laptop do?",
        options: ["It waits, then fails", "It fails at once", "It gets the page"],
        correct: 1,
      },
    },
    {
      runsOn: "lab",
      command: `bash ${DIR}/test.sh`,
      output: outputOf([
        "PASS namespaces laptop and server exist",
        "PASS GAP 1: the server listens on 0.0.0.0:8080",
        "PASS curl from the laptop to 192.168.1.80:8080 works",
        "PASS GAP 2: listen-loopback.txt shows the server on 127.0.0.1:8080 only",
        "PASS GAP 2: listen-all.txt shows the server on 0.0.0.0:8080",
        "PASS GAP 3: the laptop says 192.168.1.23:48172 to 192.168.1.80:8080, the server says the same numbers the other way round",
        "PASS GAP 4: handshake.txt shows SYN, SYN-ACK, ACK in that order",
        "PASS GAP 4: the SYN goes laptop to server:8080, the SYN-ACK comes back",
        "PASS the test server listens on 127.0.0.1:8080",
        "PASS with the server on 127.0.0.1, curl from the laptop is refused at once (exit 7)",
        "PASS server is back on 0.0.0.0 and the laptop reaches it again",
        "RESULT: all checks passed",
      ]),
      note: "The test moves the server to 127.0.0.1 on purpose and passes only when curl is refused at once. A test can pass because something failed, as it should.",
      predict: {
        question: "The test puts the server on 127.0.0.1 again. What does it expect from curl?",
        options: ["A timeout, exit 28", "A page, exit 0", "Refused, exit 7"],
        correct: 2,
      },
    },
  ],
};

function ConversationBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(ReplayCanvas, { ...props, data: netM5ReplayConversationData });
}

export const netM5ReplayConversation: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: ConversationBeat,
};
