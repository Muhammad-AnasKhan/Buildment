import type { NetLabSpec } from "../types";

// Lab 3.10 in the networking roadmap: fit the school's groups into one /22.
export const netLabPlanSchool: NetLabSpec = {
  slug: "net-lab-plan-school",
  family: "net",
  mode: "plan",
  title: "Plan the school network",
  purpose: "The school has one block, 10.20.0.0/22. Give every group its own block that fits its devices, with no overlaps.",
  limits:
    "Usable addresses are the block size minus two (the network and broadcast addresses). Real plans also leave room to grow; this lab checks fit, alignment and overlap only.",
  hints: [
    "Place the biggest groups first, at the start of the parent block.",
    "A block must start on a multiple of its own size: a /25 starts at .0 or .128.",
  ],
  tasks: ["Write a block for each group. The line above shows where each one sits inside 10.20.0.0/22."],
  solution: {
    summary:
      "Size each group first: the smallest block whose usable addresses (size minus two) cover its devices. Then place the biggest blocks first, each on a multiple of its own size, so the smaller ones fill the space after them without gaps or overlaps. This plan uses 864 of the 1,024 addresses and leaves 160 free at the end.",
    blocks: {
      guest: { block: "10.20.0.0/24", why: "250 devices need a /24 (254 usable). Biggest first, at the start of the parent." },
      staff: { block: "10.20.1.0/24", why: "200 devices also need a /24; a /25 holds only 126. It starts right after Guest Wi-Fi." },
      "lab-a": { block: "10.20.2.0/25", why: "120 devices fit a /25 (126 usable). A /25 starts at .0 or .128." },
      "lab-b": { block: "10.20.2.128/25", why: "100 devices need a /25 too, so it takes the other half of 10.20.2.0/24." },
      "lab-c": { block: "10.20.3.0/26", why: "60 devices fit a /26 (62 usable), with no room to spare." },
      printers: { block: "10.20.3.64/27", why: "20 printers fit a /27 (30 usable). It starts where Lab C ends." },
    },
  },
  plan: {
    parent: "10.20.0.0/22",
    needs: [
      { id: "guest", label: "Guest Wi-Fi", hosts: 250 },
      { id: "staff", label: "Staff", hosts: 200 },
      { id: "lab-a", label: "Lab A", hosts: 120 },
      { id: "lab-b", label: "Lab B", hosts: 100 },
      { id: "lab-c", label: "Lab C", hosts: 60 },
      { id: "printers", label: "Printers", hosts: 20 },
    ],
  },
};
