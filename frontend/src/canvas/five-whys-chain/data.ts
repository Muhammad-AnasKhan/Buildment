import type { StateMachineSpec } from "../renderers/state-machine/types";

// Why Things Happen course, chapter 4.3 "The five whys".
// Amal's family shop: late deliveries traced back, one why at a time, to a
// missing cut-off time for same-day orders. The last step shows a chain that
// stops at blame instead. See spec.md.
export const fiveWhysChain: StateMachineSpec = {
  kind: "state-machine",
  title: "Five whys: why are the deliveries late?",
  purpose: "Follow one problem back through five whys to a cause the shop can change, and see where a chain goes wrong.",
  summary:
    "Deliveries arrive late because the rider leaves late, because packing ends late, because packing starts late, because phone orders keep coming until 11:30, because the shop has no cut-off time for same-day orders. A weaker chain stops at the rider and blames him.",
  states: [
    { id: "late", name: "Deliveries late", sub: "the problem", col: 0, row: 0 },
    { id: "rider", name: "Rider leaves late", sub: "after 13:00", col: 1, row: 0 },
    { id: "packing", name: "Packing ends late", sub: "at about 12:45", col: 2, row: 0 },
    { id: "start", name: "Late packing start", sub: "at 11:30", col: 2, row: 1 },
    { id: "orders", name: "Phone orders", sub: "until 11:30", col: 1, row: 1 },
    { id: "cutoff", name: "No cut-off time", sub: "root cause", col: 0, row: 1 },
  ],
  edges: [
    { from: "late", to: "rider", label: "why" },
    { from: "rider", to: "packing", label: "why" },
    { from: "packing", to: "start", label: "why" },
    { from: "start", to: "orders", label: "why" },
    { from: "orders", to: "cutoff", label: "why" },
  ],
  steps: [
    {
      state: "late",
      edge: 0,
      title: "Start with the problem, stated exactly",
      note: "Over the last 20 delivery days, the round from Amal's family shop arrived after 14:00, the time the shop promises, on 11 days. First why: why are the deliveries late?",
      chips: ["late on 11 of 20 days", "promised by 14:00"],
    },
    {
      state: "rider",
      edge: 1,
      title: "Why 1: the rider leaves late",
      note: "The delivery log shows the rider leaves after 13:00 on most days, and the round takes him about an hour. Why does he leave so late?",
      chips: ["evidence: delivery log"],
    },
    {
      state: "packing",
      edge: 2,
      title: "Why 2: packing ends late",
      note: "He cannot leave until the bags are packed, and packing usually ends at about 12:45. Why does packing end so late?",
      chips: ["evidence: Amal watched three mornings"],
    },
    {
      state: "start",
      edge: 3,
      title: "Why 3: packing starts late",
      note: "Packing only starts at 11:30, and it takes about an hour and a quarter. Why does it start so late?",
    },
    {
      state: "orders",
      edge: 4,
      title: "Why 4: orders keep coming",
      note: "Customers phone in orders all morning, and the family waits until the calls stop, at about 11:30, before packing anything. Why do they wait?",
    },
    {
      state: "cutoff",
      tone: "good",
      outcome: "root cause",
      title: "Why 5: no cut-off time",
      note: "The shop never set a cut-off time for same-day orders, so nobody knows when to start. This is a process the family can change: orders by 10:00 go out the same day, later orders the next morning.",
      chips: ["a step the shop can change", "test: try it for two weeks"],
    },
    {
      state: "rider",
      tone: "bad",
      outcome: "blame, not a cause",
      title: "A chain that stops too early",
      note: "A weaker chain stops at why 1 with 'because the rider is slow'. That blames a person, and it fixes nothing: a new rider would leave late too, because the bags are still not ready.",
    },
  ],
  tryThis: [
    "Before step 6, predict what the root cause will be. Is it a person or a missing step?",
    "Count the whys in the chain. Would a sixth why still lead to something the shop can change?",
  ],
  limits:
    "Real problems often have more than one chain of causes, and five is a habit, not a rule: stop when you reach a cause you can change and check. Each why here is backed by evidence such as the delivery log; a why that is only a guess needs checking before you act on it.",
};
