# Canvas spec: sysdesign-m16-no-headroom

- **Course and chapter:** system-design, 16.6 beat 4 (Redundancy needs spare room).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** Redundancy only works if the survivors have spare capacity: each server must run below 100% minus its share of a lost server.
- **Story:** The load balancer sends 60 requests a second to each server. Server B crashes. All 120 go to A, which can do 100, so A is overloaded and its answers slow down.
- **Numbers:** 2 x 60 = 120 req/s total. A alone: 120 / 100 = 120% busy. To survive losing 1 of 2, each server may run at most 50%.
- **Sources:** Utilisation and queueing from chapter 2.5; series and parallel availability from chapter 2.6.
