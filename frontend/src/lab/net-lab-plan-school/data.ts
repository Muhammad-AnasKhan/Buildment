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
