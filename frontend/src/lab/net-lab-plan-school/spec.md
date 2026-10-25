# net-lab-plan-school

**Claim:** a block must start on a multiple of its own size, hold every device plus the network and broadcast addresses, sit inside the parent and overlap no other block.

**Inputs:** one block per group, written as address/prefix.

**Rule:** `checkPlan` in `frontend/src/lab/net/plan.ts`.

**Assumptions:** usable addresses are the block size minus two.

**Limits:** see the lab's limits line.

**Try this**

1. Give Guest Wi-Fi 10.20.0.0/24. Expected: it fits (254 usable).
2. Give Staff 10.20.0.128/24. Expected: refused, a /24 cannot start at .128; the block that holds it starts at 10.20.0.0.
3. Fill every group. Expected: the line shows no stripes and the banner says every group fits.
