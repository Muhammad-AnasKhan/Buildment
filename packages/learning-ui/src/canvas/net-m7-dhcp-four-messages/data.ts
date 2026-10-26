import type { SequenceSpec } from "../renderers/sequence/types";

// 7.2 beat 2: the four DHCP messages of one lease [S23]. A phone with no
// address broadcasts DISCOVER; the server offers 10.5.0.84 from its pool; the
// phone asks for it with REQUEST; the server confirms with ACK. The client
// uses UDP port 68 and the server port 67 [S23]. The made-up café network is
// 10.5.0.0/24 with the pool 10.5.0.50 to 10.5.0.200 and a lease of 3600 s
// (dnsmasq's default is one hour [S64]). The addresses 0.0.0.0 and
// 255.255.255.255 for DISCOVER and REQUEST are what the lab capture shows
// (0.0.0.0.68 > 255.255.255.255.67). Renewal at half the lease and rebinding at
// 0.875 of it are the defaults of [S23].
export const netM7DhcpFourMessages: SequenceSpec = {
  kind: "sequence",
  title: "Four messages hand out an address",
  purpose: "Step through one DHCP lease: the phone asks, the server offers 10.5.0.84, the phone asks for it, and the server confirms.",
  summary:
    "A phone with no address broadcasts a DISCOVER from 0.0.0.0, port 68, to 255.255.255.255, port 67. The DHCP server offers 10.5.0.84 from its pool, with a mask, a gateway, a DNS server and a lease time of 3600 seconds. The phone broadcasts a REQUEST for that address. The server confirms with an ACK, and the lease starts.",
  actors: [
    { name: "Phone", sub: "no address" },
    { name: "Server", sub: "10.5.0.1" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "DISCOVER",
      title: "1. DISCOVER: is anyone there?",
      note: "The phone has no address, so it sends from 0.0.0.0 to everyone on the link, 255.255.255.255. Only a DHCP server answers it.",
      chips: ["from 0.0.0.0, port 68", "to 255.255.255.255, port 67"],
    },
    {
      from: 1,
      to: 0,
      label: "OFFER 10.5.0.84",
      title: "2. OFFER: take this address",
      note: "The server picks a free address from its pool, 10.5.0.50 to 10.5.0.200, and offers it together with the other settings of the lease.",
      chips: ["address 10.5.0.84", "mask 255.255.255.0", "gateway 10.5.0.1", "DNS server 10.5.0.1", "lease 3600 s"],
    },
    {
      from: 0,
      to: 1,
      label: "REQUEST 10.5.0.84",
      title: "3. REQUEST: I take it",
      note: "The phone still has no address, so this message also goes out from 0.0.0.0 to everyone. It says which address the phone wants.",
      chips: ["from 0.0.0.0, port 68", "to 255.255.255.255, port 67"],
    },
    {
      from: 1,
      to: 0,
      label: "ACK 10.5.0.84",
      title: "4. ACK: it is yours",
      note: "The server confirms. The lease starts now and lasts 3600 seconds. The phone sets its address, gateway and DNS server and can talk to the network.",
      chips: ["lease 3600 s", "renew at 1800 s", "rebind at 3150 s"],
      tone: "good",
      outcome: "lease granted",
    },
  ],
  tryThis: [
    "At step 1, look at the source address. Why is it 0.0.0.0, and why does the message go to everyone?",
    "At step 4, check the chips: half of 3600 is 1800, and 0.875 of 3600 is 3150. Those are the two timers of the next beat.",
  ],
  limits:
    "One phone, one server and one link, in a made-up café network. There is no relay and no second server, and the lease timers are not drawn on this walkthrough. The names DISCOVER, OFFER, REQUEST and ACK, the ports 67 and 68, and the timer defaults come from RFC 2131 [S23]. The picture shows no timing, and a real server may take a moment to answer the first message.",
};
