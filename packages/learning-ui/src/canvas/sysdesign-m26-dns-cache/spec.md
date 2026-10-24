# Canvas spec: sysdesign-m26-dns-cache

- **Course and chapter:** system-design, 26.2 beat 4 (Look up a host once, not every time).
- **Renderer:** `scene` (data only). Export: `sysdesignM26DnsCache`.
- **Claim:** A local DNS cache removes the lookup from almost every fetch, because the crawler fetches many pages from the same host.
- **Story:** The fetcher asks the cache for shop.example. Miss. The cache asks a DNS server, which takes 100 ms, and keeps the IP address. The next page on the same host gets its answer in 0.5 ms. Verdict: "Next page: 0.5 ms, not 100 ms".
- **Numbers:** 100 ms cold lookup (course assumption, built on tens of milliseconds per hop, S3). 0.5 ms cache query (S3: a Redis, Memcached or MySQL query takes about 500 microseconds).
- **Sources:** S3 for 0.5 ms; chapter 3.3 for the TTL idea; S9 (RFC 1035) for the TTL definition.
