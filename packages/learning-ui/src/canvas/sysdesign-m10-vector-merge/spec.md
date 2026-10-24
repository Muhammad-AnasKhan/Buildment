# Canvas spec: sysdesign-m10-vector-merge

- **Course and chapter:** system-design, 10.4 beat 5 ("A merge replaces both versions").
- **Renderer:** `scene` (data only).
- **Claim:** A write that carries the merged vector is bigger than both old versions, so the old versions can be dropped.
- **Story:** The phone reads two versions, merges to milk + tea, and writes with the context [1,0,1] (the slot-by-slot maximum). B adds 1 to its own slot and stores [1,1,1]. Verdict: "New version replaces both".
- **Numbers:** Course numbers.
- **Sources:** S45 (reconcile on read; deleted items can reappear after a merge).
