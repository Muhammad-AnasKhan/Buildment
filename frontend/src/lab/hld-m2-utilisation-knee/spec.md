# The utilisation knee

**Claim:** a server's p99 latency stays flat as load rises, then climbs sharply once the server passes roughly 70% busy. Adding capacity before the knee keeps latency flat; adding it after only just rescues it.

**Inputs**

| Input | Min | Max | Step | Default |
|---|---|---|---|---|
| Offered load (client) | 1 req/s | 10,000,000 req/s | 1 | 1,000 req/s |
| App server size | general/compute/memory tiers | | | compute-small |
| App server count | 1 | 50 | 1 | 2 |

**Rule:** each app server has a capacity from its size tier and a per-vCPU rule. Utilisation is offered load divided by total capacity. p50 is roughly the base service time; p99 rises as utilisation passes about 70% and climbs steeply toward 90%, the queueing knee from module 2.

**Assumptions:** steady state, requests independent, one region, no cold starts or noisy neighbours, illustrative prices.

**Limits:** this is a model, not a cloud. It compares the shapes of designs, not a real bill or a real latency in milliseconds.

**Try this**

1. Hold the count at 2 and raise load from 1,000 to 5,000 req/s. Expected: p99 is flat at first, then climbs once each server passes about 70%.
2. At 5,000 req/s, add a third app server. Expected: utilisation drops back under the knee and p99 falls.
3. Swap the size up one tier instead of adding a server. Expected: similar relief, different cost; compare the hourly cost of the two fixes.
