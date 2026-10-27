import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { outputOf, type ReplayData } from "../models/net-replay";
import { ReplayCanvas } from "../net-m1-replay-setup-checker/ReplayCanvas";

// 12.2 to 12.8 phone readers: challenge 9 played from a real recording (the
// challenge 9 lab sessions, recorded 2026-10-27 in the lab image with the seed
// ref-mentor). Step 1 is the setup (12.1), steps 2 and 3 part 1 (12.2), steps
// 4 and 5 part 2 (12.3), steps 6 to 8 part 3 (12.4), steps 9 and 10 part 4
// (12.5), steps 11 and 12 part 5 (12.6), steps 13 to 16 part 6 (12.7) and
// step 17 part 7 (12.8). Two steps hide their output until the learner picks:
// what the last hop shows while r1 limits its own replies (step 8) and how
// many UDP packets are lost below the speed limit (step 15). The renderer is
// ReplayCanvas in net-m1-replay-setup-checker; the model is models/net-replay.ts.
const TITLE = "Challenge 9, replayed";
const PURPOSE =
  "Follow a recorded run of challenge 9: plant four faults, read a capture back, filter one, find each fault with mtr, dig, nmap and iperf3, and time a page with curl.";
const LIMITS =
  "A recording of one run of the course lab with the seed ref-mentor, not of a learner. Your seed gives other ports, names, loss and speeds, and times differ on every run. Long outputs are shortened, a line with three dots marks what was left out, and trailing spaces are removed. Wireshark itself is not shown: the capture is read back with tcpdump -r, as the test does.";

export const netM12ReplayToolboxData: ReplayData = {
  steps: [
    {
      runsOn: "lab",
      command: ["cd /work/challenges/challenge-9-toolbox/part-0-the-broken-network", "bash faults.sh --seed ref-mentor"].join("\n"),
      output: outputOf([
        "--- building the lab network",
        "--- seed 'ref-mentor' (saved in fault-seed.txt)",
        "",
        "What should be true in this network (the service sheet):",
        "  www.lab.test, shop.lab.test, docs.lab.test, news.lab.test and mail.lab.test all mean 203.0.113.80.",
        "  The laptop asks the campus resolver, 192.0.2.1. The public resolver is 203.0.113.53.",
        "  The server has a web page on port 80, the app on port 7630, and an iperf3 server on port 5201.",
        "  Every cable is virtual. It carries more than 1 Gbit/s and loses nothing.",
        "",
        "Four faults are planted. What people say:",
        "  \"Copying a file to the server is slow.\"  (two different faults make this complaint)",
        "  \"docs.lab.test does not load for me. www.lab.test works.\"",
        "  \"The app on port 7630 does not answer.\"",
        "Write a best guess for each one in faults.md before you start part 1.",
      ]),
      note: "The service sheet says what should be true, and the complaints say what people feel. With this seed the app port is 7630 and the broken name is docs.lab.test.",
    },
    {
      runsOn: "lab",
      command: ["cd ../part-1-wireshark", "bash make-capture.sh"].join("\n"),
      output: outputOf([
        "capture.pcap is ready: 33 packets, made from your seed 'ref-mentor'.",
        "Open it in Wireshark on your computer. It is in your repository folder, in",
        "challenges/challenge-9-toolbox/part-1-wireshark/",
      ]),
      note: "The capture was made on the laptop's own cable and saved in your repository folder, so Wireshark on your computer can open the same file.",
    },
    {
      runsOn: "lab",
      command: "tcpdump -nn -v -r capture.pcap 'src host 203.0.113.80' -c 2",
      output: outputOf([
        "reading from file capture.pcap, link-type EN10MB (Ethernet), snapshot length 262144",
        "16:32:42.972431 IP (tos 0x0, ttl 107, id 0, offset 0, flags [DF], proto TCP (6), length 60)",
        "    203.0.113.80.80 > 192.0.2.10.48452: Flags [S.], cksum 0xfe89 (incorrect -> 0x4611), seq 333793012, ack 576157637, win 65160, options [mss 1460,sackOK,TS val 4205898183 ecr 965882981,nop,wscale 7], length 0",
        "16:32:42.972645 IP (tos 0x0, ttl 107, id 32009, offset 0, flags [DF], proto TCP (6), length 52)",
        "    203.0.113.80.80 > 192.0.2.10.48452: Flags [.], cksum 0xfe81 (incorrect -> 0x711d), ack 76, win 509, options [nop,nop,TS val 4205898183 ecr 965882982], length 0",
      ]),
      note: "The server's packets reach the laptop with ttl 107. The test reads the file this way, with tcpdump -r, and compares it with what you read in Wireshark.",
    },
    {
      runsOn: "lab",
      command: ["cd ../part-2-tcpdump", "bash traffic.sh 40 &", "ip netns exec laptop tcpdump -nn -i veth-laptop -c 10 -w dns-only.pcap port 53"].join("\n"),
      output: outputOf([
        "tcpdump: listening on veth-laptop, link-type EN10MB (Ethernet), snapshot length 262144 bytes",
        "10 packets captured",
        "12 packets received by filter",
        "0 packets dropped by kernel",
      ]),
      note: "With -w, tcpdump prints no packets while it writes. It stopped by itself after 10 packets, so the file is complete.",
    },
    {
      runsOn: "lab",
      command: "tcpdump -nn -r dns-only.pcap",
      output: outputOf([
        "reading from file dns-only.pcap, link-type EN10MB (Ethernet), snapshot length 262144",
        "16:25:45.067394 IP 192.0.2.10.44469 > 192.0.2.1.53: 41492+ [1au] A? www.lab.test. (53)",
        "16:25:46.090482 IP 192.0.2.10.54935 > 203.0.113.53.53: 17407+ [1au] A? news.lab.test. (54)",
        "16:25:46.090703 IP 203.0.113.53.53 > 192.0.2.10.54935: 17407* 1/0/1 A 203.0.113.80 (58)",
        "16:25:47.141233 IP 192.0.2.10.33049 > 192.0.2.1.53: 61307+ [1au] A? www.lab.test. (53)",
        "...",
        "16:25:49.221490 IP 192.0.2.10.52586 > 192.0.2.1.53: 65125+ [1au] A? www.lab.test. (53)",
        "16:25:49.221982 IP 192.0.2.1.53 > 192.0.2.10.52586: 65125* 1/0/1 A 203.0.113.80 (57)",
      ]),
      note: "Every line has .53, the DNS port: questions with A? and answers with A 203.0.113.80. The capture filter kept nothing else.",
    },
    {
      runsOn: "lab",
      command: ["cd ../part-3-mtr", "ip netns exec laptop mtr -rn -c 50 -i 0.2 203.0.113.80"].join("\n"),
      output: outputOf([
        "Start: 2026-10-27T16:26:23+0000",
        "HOST: 9acde94c9099                Loss%   Snt   Last   Avg  Best  Wrst StDev",
        "  1.|-- 192.0.2.1                  0.0%    50    0.1   0.1   0.1   0.2   0.0",
        "  2.|-- 198.51.100.2              10.0%    50    0.1   0.1   0.1   0.2   0.0",
        "  3.|-- 203.0.113.80              10.0%    50    0.2   0.2   0.2   0.4   0.1",
      ]),
      note: "Hop 1 loses nothing, and hops 2 and 3 lose 10%. The loss starts on the cable from r1 to r2 and goes on to the last hop.",
    },
    {
      runsOn: "lab",
      command: ["ip netns exec r1 tc qdisc show", "ip netns exec r1 tc qdisc del dev veth-r1wan root"].join("\n"),
      output: outputOf([
        "qdisc noqueue 0: dev lo root refcnt 2",
        "qdisc noqueue 0: dev veth-r1lan root refcnt 2",
        "qdisc netem 802b: dev veth-r1wan root refcnt 21 limit 1000 loss 10%",
      ]),
      note: "r1's cable to r2, veth-r1wan, has a netem queue with loss 10%. The second command prints nothing and removes it: fault 1 is cleared.",
    },
    {
      runsOn: "lab",
      command: ["ip netns exec r1 sysctl -w net.ipv4.icmp_ratelimit=1000", "ip netns exec laptop mtr -rn -c 50 -i 0.2 203.0.113.80"].join("\n"),
      output: outputOf([
        "net.ipv4.icmp_ratelimit = 1000",
        "Start: 2026-10-27T16:26:43+0000",
        "HOST: 9acde94c9099                Loss%   Snt   Last   Avg  Best  Wrst StDev",
        "  1.|-- 192.0.2.1                 70.0%    50    0.1   0.1   0.1   0.5   0.1",
        "  2.|-- 198.51.100.2               0.0%    50    0.1   0.1   0.1   0.2   0.0",
        "  3.|-- 203.0.113.80               0.0%    50    0.3   0.3   0.2   0.5   0.1",
      ]),
      note: "Loss at hop 1 only, and none after it. r1 limits its own replies to the probes, but it forwards every packet that passes through it.",
      predict: {
        question: "r1 now limits its own replies, and hop 1 shows 70.0% loss. What does the last hop, 203.0.113.80, show?",
        options: ["0.0% loss", "70.0% loss", "10.0% loss"],
        correct: 0,
      },
    },
    {
      runsOn: "lab",
      command: ["cd ../part-4-dig", "ip netns exec laptop dig @192.0.2.1 docs.lab.test"].join("\n"),
      output: outputOf([
        "; <<>> DiG 9.18.39-0ubuntu0.24.04.8-Ubuntu <<>> @192.0.2.1 docs.lab.test",
        "...",
        ";; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1",
        "...",
        ";; ANSWER SECTION:",
        "docs.lab.test.\t\t0\tIN\tA\t203.0.113.153",
        "",
        ";; Query time: 4 msec",
        ";; SERVER: 192.0.2.1#53(192.0.2.1) (UDP)",
      ]),
      note: "The campus resolver, 192.0.2.1, answers docs.lab.test with 203.0.113.153. The service sheet says 203.0.113.80.",
    },
    {
      runsOn: "lab",
      command: "ip netns exec laptop dig @203.0.113.53 docs.lab.test",
      output: outputOf([
        "; <<>> DiG 9.18.39-0ubuntu0.24.04.8-Ubuntu <<>> @203.0.113.53 docs.lab.test",
        "...",
        ";; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1",
        "...",
        ";; ANSWER SECTION:",
        "docs.lab.test.\t\t0\tIN\tA\t203.0.113.80",
        "",
        ";; Query time: 4 msec",
        ";; SERVER: 203.0.113.53#53(203.0.113.53) (UDP)",
      ]),
      note: "The public resolver gives 203.0.113.80 for the same name. Two resolvers, two answers: the campus one is wrong.",
    },
    {
      runsOn: "lab",
      command: ["cd ../part-5-nmap", "ip netns exec laptop nmap -n -p 80,81,7630 203.0.113.80"].join("\n"),
      output: outputOf([
        "Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-10-27 16:27 UTC",
        "Nmap scan report for 203.0.113.80",
        "Host is up (0.00019s latency).",
        "",
        "PORT     STATE    SERVICE",
        "80/tcp   open     http",
        "81/tcp   closed   hosts2-ns",
        "7630/tcp filtered hawk",
        "",
        "Nmap done: 1 IP address (1 host up) scanned in 1.43 seconds",
      ]),
      note: "Three ports, three states: open (an answer came back), closed (a reset came back) and filtered (nothing came back).",
    },
    {
      runsOn: "lab",
      command: ["ip netns exec server ss -ltn", "ip netns exec r2 nft list ruleset"].join("\n"),
      output: outputOf([
        "State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess",
        "LISTEN 0      9                  *:7630            *:*",
        "LISTEN 0      4096               *:5201            *:*",
        "LISTEN 0      9                  *:80              *:*",
        "table inet fault3 {",
        "\tchain forward {",
        "\t\ttype filter hook forward priority filter; policy accept;",
        "\t\ttcp dport 7630 drop",
        "\t}",
        "}",
      ]),
      note: "The app listens on 7630, and r2 drops every packet to that port on the way. Your teammate and your app were both right.",
    },
    {
      runsOn: "lab",
      command: ["cd ../part-6-iperf3", "ip netns exec laptop iperf3 -c 203.0.113.80 -t 5"].join("\n"),
      output: outputOf([
        "Connecting to host 203.0.113.80, port 5201",
        "[  5] local 192.0.2.10 port 52804 connected to 203.0.113.80 port 5201",
        "[ ID] Interval           Transfer     Bitrate         Retr  Cwnd",
        "[  5]   0.00-1.00   sec  4.75 MBytes  39.8 Mbits/sec    0   1.14 MBytes",
        "[  5]   1.00-2.00   sec  1.38 MBytes  11.5 Mbits/sec    0   1.21 MBytes",
        "[  5]   2.00-3.00   sec  1.38 MBytes  11.5 Mbits/sec    0   1.29 MBytes",
        "[  5]   3.00-4.00   sec  1.38 MBytes  11.5 Mbits/sec    0   1.36 MBytes",
        "[  5]   4.00-5.00   sec  1.38 MBytes  11.5 Mbits/sec    0   1.43 MBytes",
        "- - - - - - - - - - - - - - - - - - - - - - - - -",
        "[ ID] Interval           Transfer     Bitrate         Retr",
        "[  5]   0.00-5.00   sec  10.2 MBytes  17.2 Mbits/sec    0             sender",
        "[  5]   0.00-5.95   sec  8.75 MBytes  12.3 Mbits/sec                  receiver",
        "",
        "iperf Done.",
      ]),
      note: "The receiver line says 12.3 Mbits/sec with 0 retransmits: slow, but nothing lost. The sender line is higher because data still waited in a queue.",
    },
    {
      runsOn: "lab",
      command: "ip netns exec laptop iperf3 -c 203.0.113.80 -t 5 -R",
      output: outputOf([
        "Connecting to host 203.0.113.80, port 5201",
        "Reverse mode, remote host 203.0.113.80 is sending",
        "[  5] local 192.0.2.10 port 54058 connected to 203.0.113.80 port 5201",
        "[ ID] Interval           Transfer     Bitrate",
        "...",
        "- - - - - - - - - - - - - - - - - - - - - - - - -",
        "[ ID] Interval           Transfer     Bitrate         Retr",
        "[  5]   0.00-5.00   sec  4.99 GBytes  8.57 Gbits/sec  1901             sender",
        "[  5]   0.00-5.00   sec  4.99 GBytes  8.56 Gbits/sec                  receiver",
        "",
        "iperf Done.",
      ]),
      note: "Many times faster. The limit sits on the way out of r2 toward the server, so only the laptop to server direction is slow.",
    },
    {
      runsOn: "lab",
      command: "ip netns exec laptop iperf3 -c 203.0.113.80 -t 5 -u -b 2M",
      output: outputOf([
        "Connecting to host 203.0.113.80, port 5201",
        "[  5] local 192.0.2.10 port 55768 connected to 203.0.113.80 port 5201",
        "[ ID] Interval           Transfer     Bitrate         Total Datagrams",
        "...",
        "- - - - - - - - - - - - - - - - - - - - - - - - -",
        "[ ID] Interval           Transfer     Bitrate         Jitter    Lost/Total Datagrams",
        "[  5]   0.00-5.00   sec  1.19 MBytes  2.00 Mbits/sec  0.000 ms  0/864 (0%)  sender",
        "[  5]   0.00-5.00   sec  1.19 MBytes  2.00 Mbits/sec  0.119 ms  0/864 (0%)  receiver",
        "",
        "iperf Done.",
      ]),
      note: "UDP below the limit loses nothing: 0/864 (0%). A speed limit makes packets wait in a queue. It does not drop them.",
      predict: {
        question: "UDP does not resend lost packets, so iperf3 can count them. At 2 Mbits/sec, below the 13 Mbit/s limit, how many are lost?",
        options: ["92/864 (11%)", "0/864 (0%)", "432/864 (50%)"],
        correct: 1,
      },
    },
    {
      runsOn: "lab",
      command: ["ip netns exec r2 tc qdisc show", "ip netns exec r2 tc qdisc del dev veth-r2srv root"].join("\n"),
      output: outputOf([
        "qdisc noqueue 0: dev lo root refcnt 2",
        "qdisc noqueue 0: dev veth-r2wan root refcnt 2",
        "qdisc noqueue 0: dev br-srv root refcnt 2",
        "qdisc netem 802c: dev veth-r2srv root refcnt 21 limit 1000 rate 13Mbit",
        "qdisc noqueue 0: dev veth-r2dns root refcnt 2",
      ]),
      note: "veth-r2srv, r2's cable to the server, has a netem queue with rate 13Mbit: fault 4. The second command removes it.",
    },
    {
      runsOn: "lab",
      command: ["cd ../part-7-curl", "ip netns exec laptop curl -sS -o /dev/null -w 'time_namelookup=%{time_namelookup} time_connect=%{time_connect} time_starttransfer=%{time_starttransfer} time_total=%{time_total}\\n' http://www.lab.test/", "ip netns exec laptop curl -sS -o /dev/null -w 'time_namelookup=%{time_namelookup} time_connect=%{time_connect} time_starttransfer=%{time_starttransfer} time_total=%{time_total}\\n' http://www.lab.test/cgi-bin/slow"].join("\n"),
      output: outputOf([
        "time_namelookup=0.001876 time_connect=0.002322 time_starttransfer=0.003723 time_total=0.003864",
        "time_namelookup=0.002831 time_connect=0.003474 time_starttransfer=4.011277 time_total=4.011456",
      ]),
      note: "Both visits find the name and connect within a few thousandths of a second. The slow page waits about 4 seconds for its first byte: the server was working.",
    },
  ],
};

function ToolboxBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(ReplayCanvas, { ...props, data: netM12ReplayToolboxData });
}

export const netM12ReplayToolbox: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: ToolboxBeat,
};
