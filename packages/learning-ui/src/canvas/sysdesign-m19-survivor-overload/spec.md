# Canvas spec: sysdesign-m19-survivor-overload

- **Course and chapter:** system-design, 19.5 beat 4 ("The survivor must carry everyone").
- **Renderer:** `scene` (data only).
- **Claim:** Failing over moves traffic, not capacity. If each region is sized for its own half, the survivor receives twice its load. Both regions must be sized for the full load, or the survivor must shed load.
- **Story:** A's users and B's users each send 50 req/s to their own region (capacity 60). Region A fails, A's users move to B. B gets 100 against a capacity of 60 and both groups see errors. Verdict: "Survivor sized for half melts down".
- **Numbers:** 50 and 60 req/s are made up. Two regions each sized for 100% of traffic is the sizing rule used in 19.4 (cost 2.0x).
- **Sources:** Retry amplification and metastable failures [S89, S94]; AWS DR whitepaper on testing whether the other Regions can handle all the traffic [S107].
