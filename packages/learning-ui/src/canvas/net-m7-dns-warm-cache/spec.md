# Canvas spec: net-m7-dns-warm-cache

Course and chapter: networking, 7.3 beat 3 (step through). Renderer: the existing `sequence` renderer, data only (`SequenceSpec`, `renderers/sequence/`). No new component.

## Claim

When the resolver already holds an unexpired answer, it replies from memory: two messages, and no question to the root, the .com servers or the servers of example.com. The answer comes with a TTL [S24].

## Touch

**Next** and **Back** step through three steps on two lanes, the laptop and the resolver: the question, the cache hit (a loop on the resolver's lane) and the answer, 203.0.113.45 with TTL 300. The loop is work inside the resolver, not a message, so the run has two messages.

## Limits

One scripted run: one resolver, one A record, no DNSSEC. There is no clock, so the TTL does not count down and the copy does not expire here; chapter 7.4 covers expiry. The names, the address 203.0.113.45 (a documentation address [S10]) and the TTL of 300 are made up for the lesson.
