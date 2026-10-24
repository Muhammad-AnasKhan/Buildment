# Canvas spec: sysdesign-m3-dns-lookup

- **Course and chapter:** system-design, 3.3 beat 1.
- **Renderer:** `scene` (data only).
- **Claim:** A resolver answers the phone's question recursively, and gets the answer iteratively: each name server refers it to the next one, until one has the address. Then it caches the answer for the record's TTL.
- **Story:** The phone asks for shop.example.com. The resolver asks the root ("try .com"), the .com servers ("try its server") and the name server of example.com ("203.0.113.7"), caches the answer for 300 s and returns it. Verdict: "Resolver walked the tree for you".
- **Numbers:** None measured. The 300 s TTL is an example value; 203.0.113.7 is a documentation address.
- **Sources:** [S9b] RFC 1034 (recursive and iterative resolution); [S9] RFC 1035 (TTL). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
