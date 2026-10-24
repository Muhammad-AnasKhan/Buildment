# Canvas spec: sysdesign-m7-btree-split

- **Course and chapter:** system-design, 7.3 beat 3.
- **Renderer:** `scene` (data only).
- **Claim:** A B-tree changes pages in place. An insert into a full page splits it, which writes the old page, a new page and the parent.
- **Story:** The app inserts 47. The parent sends it to the full leaf. The leaf splits and moves half its keys to a new leaf. The parent adds a pointer. Three pages were written.
- **Numbers:** 4 keys per page (toy size). 3 pages written for one insert in the split case.
- **Predict before it (in the chapter):** none. The beat text asks the learner what to notice.
- **Sources:** PostgreSQL docs: B-tree is a multi-way balanced tree of leaf and internal pages (read 2026-10-24).
