import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { outputOf, type ReplayData } from "../models/net-replay";
import { ReplayCanvas } from "../net-m1-replay-setup-checker/ReplayCanvas";

// 1.4 phone readers: challenge 1 part 1 played from a real recording (session
// virtual-cable in recordings/replay-sessions.txt, and the README capture step
// in recordings/replay-capture.txt): cable.sh, the ping, the capture, the
// ping that must fail and the test. At the capture step the output is hidden
// until the learner picks how many packets come before the first echo
// request. The renderer is ReplayCanvas in net-m1-replay-setup-checker; the
// model is models/net-replay.ts.
const TITLE = "The virtual cable, replayed";
const PURPOSE = "Follow a recorded run of challenge 1: build two computers and a cable, ping, capture the ping, ping an address nobody owns, and run the test.";
const LIMITS =
  "A recording of real runs in the course lab. The capture comes from a separate run of the same steps, so its hardware addresses and times differ from the first two steps. Long outputs are shortened and a line with three dots marks what was left out. The capture shows the first ping only, and the test line about the capture file passes only once capture.txt exists.";

const TEST = "bash challenges/challenge-1-two-computers/part-1-virtual-cable/test.sh";

export const netM1ReplayVirtualCableData: ReplayData = {
  steps: [
    {
      runsOn: "lab",
      command: "bash challenges/challenge-1-two-computers/part-1-virtual-cable/cable.sh",
      output: outputOf([
        "8: veth-laptop@if7: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000",
        "    link/ether 92:84:33:2d:7d:3f brd ff:ff:ff:ff:ff:ff link-netns phone",
        "    inet 192.168.1.10/24 scope global veth-laptop",
        "...",
        "7: veth-phone@if8: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000",
        "    link/ether da:31:b9:f1:3f:18 brd ff:ff:ff:ff:ff:ff link-netns laptop",
        "    inet 192.168.1.20/24 scope global veth-phone",
        "...",
        "Done. Next: ip netns exec laptop ping -c2 -W1 192.168.1.20",
      ]),
      note: "The script built two computers, laptop and phone, joined by one virtual cable. Each end has its own address: 192.168.1.10 and 192.168.1.20.",
    },
    {
      runsOn: "lab",
      command: "ip netns exec laptop ping -c 2 192.168.1.20",
      output: outputOf([
        "PING 192.168.1.20 (192.168.1.20) 56(84) bytes of data.",
        "64 bytes from 192.168.1.20: icmp_seq=1 ttl=64 time=0.542 ms",
        "64 bytes from 192.168.1.20: icmp_seq=2 ttl=64 time=0.039 ms",
        "",
        "--- 192.168.1.20 ping statistics ---",
        "2 packets transmitted, 2 received, 0% packet loss, time 1002ms",
        "rtt min/avg/max/mdev = 0.039/0.290/0.542/0.251 ms",
      ]),
      note: "Two pings went out and two answers came back: 2 received, 0% packet loss. The cable works.",
    },
    {
      runsOn: "lab",
      command: [
        "cd /work/challenges/challenge-1-two-computers/part-1-virtual-cable",
        "ip netns exec laptop ip neigh flush dev veth-laptop",
        "timeout 10 ip netns exec phone tcpdump -n -v -e -i veth-phone -c 6 arp or icmp > capture.txt 2>&1 &",
        "sleep 1",
        "ip netns exec laptop ping -c2 -W1 192.168.1.20",
        "wait",
        "cat capture.txt",
      ].join("\n"),
      output: outputOf([
        "...",
        "tcpdump: listening on veth-phone, link-type EN10MB (Ethernet), snapshot length 262144 bytes",
        "20:20:36.245550 e2:fe:29:a1:af:56 > ff:ff:ff:ff:ff:ff, ethertype ARP (0x0806), length 42: Ethernet (len 6), IPv4 (len 4), Request who-has 192.168.1.20 tell 192.168.1.10, length 28",
        "20:20:36.245572 3a:ad:cd:4f:50:ae > e2:fe:29:a1:af:56, ethertype ARP (0x0806), length 42: Ethernet (len 6), IPv4 (len 4), Reply 192.168.1.20 is-at 3a:ad:cd:4f:50:ae, length 28",
        "20:20:36.245575 e2:fe:29:a1:af:56 > 3a:ad:cd:4f:50:ae, ethertype IPv4 (0x0800), length 98: (tos 0x0, ttl 64, id 21931, offset 0, flags [DF], proto ICMP (1), length 84)",
        "    192.168.1.10 > 192.168.1.20: ICMP echo request, id 45, seq 1, length 64",
        "20:20:36.246015 3a:ad:cd:4f:50:ae > e2:fe:29:a1:af:56, ethertype IPv4 (0x0800), length 98: (tos 0x0, ttl 64, id 13804, offset 0, flags [none], proto ICMP (1), length 84)",
        "    192.168.1.20 > 192.168.1.10: ICMP echo reply, id 45, seq 1, length 64",
        "...",
        "6 packets captured",
        "6 packets received by filter",
        "0 packets dropped by kernel",
      ]),
      note: "ARP comes first: the laptop asks everyone who has 192.168.1.20, and the phone answers. Only then does the first echo request go out.",
      predict: {
        question: "How many packets does the capture show before the first echo request?",
        options: ["2 packets", "1 packet", "4 packets"],
        correct: 0,
      },
    },
    {
      runsOn: "lab",
      command: "ip netns exec laptop ping -c 2 -W 1 192.168.1.99",
      output: outputOf([
        "PING 192.168.1.99 (192.168.1.99) 56(84) bytes of data.",
        "",
        "--- 192.168.1.99 ping statistics ---",
        "2 packets transmitted, 0 received, 100% packet loss, time 1029ms",
      ]),
      note: "Nobody owns 192.168.1.99, so no error message comes, only silence: 0 received, 100% packet loss.",
    },
    {
      runsOn: "lab",
      command: TEST,
      output: outputOf([
        "PASS namespaces laptop and phone exist",
        "PASS laptop has 192.168.1.10/24 on veth-laptop",
        "PASS phone has 192.168.1.20/24 on veth-phone",
        "PASS laptop pings 192.168.1.20 with 0% loss",
        "PASS phone pings 192.168.1.10 with 0% loss",
        "PASS 192.168.1.99 gets no answer (2 sent, 0 received), as it should",
        "PASS capture.txt has the ARP lines and the ping lines",
        "RESULT: all checks passed",
      ]),
      note: "Every check passes, including the one that reads your capture.txt for the ARP lines and the ping lines.",
    },
  ],
};

function VirtualCableBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(ReplayCanvas, { ...props, data: netM1ReplayVirtualCableData });
}

export const netM1ReplayVirtualCable: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: VirtualCableBeat,
};
