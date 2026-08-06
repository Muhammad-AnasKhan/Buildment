# Course content improvement loop — state

Last updated: 2026-08-05 (iteration 4)

## Course

Multi-Vendor Food Marketplace — `content/import/multi-vendor-marketplace/`

## Completed iterations

### Iteration 4 — 2026-08-05

**Focus:** Modules 13–15 — Week 2→3 transition + deliverables table fixes

**Diagnosis:**
- Week 3 bridge (13.14) existed but lacked forward roadmap — students couldn't see browse→cart→checkout arc
- 14.15→15.01 handoff missing explicit API-field → UI-component mapping
- Broken markdown tables in 13.03, 14.03, 15.03, 16.03 (`| Learning log` row truncated)
- 15.11 browse→buy transition to Ch 16 was list-only, not framed as rhythm shift

**Changes:**
- `13.14-bridge-to-week-3-customer-experience.md` — Week 3 roadmap table (Ch 14–20), Callout
- `14.15-recap-and-whats-next.md` — API→UI handoff table, gate Callout
- `15.01-set-the-scene.md` — Week 3 position Callout linking 13.14, ChapterRecap
- `15.11-recap-and-whats-next.md` — browse→buy handoff table, curl-first rhythm Callout
- Fixed deliverables tables: `13.03`, `14.03`, `15.03`, `16.03`

**Validation:** `npm run content:validate` — 348 chapters OK

**Next iteration should:**
1. Module 08 build cluster (8.8–8.13) — ownership middleware depth
2. Module 16–17 cart transition (mirror 14→15 pattern)
3. Module 03–04 MongoDB decision → connection bridge polish

### Iteration 3 — 2026-08-05

**Focus:** Module 07 build cluster + Module 08 authz bridge

**Diagnosis:**
- Build lessons 7.10, 7.14, 7.15 were contract-heavy but lacked production framing and common mistakes
- Critical gap: students may think ProtectedRoute = security — needs explicit client vs server guard table before Ch 8
- 08.01 bridge existed but did not callback Chapter 7 capabilities/limitations explicitly

**Changes:**
- `07.10-auth-context-or-hook.md` — why single source of truth, pattern comparison, common mistakes table
- `07.14-api-interceptor.md` — production rationale, request flow diagram, login-401 Callout, common mistakes
- `07.15-protected-route-wrapper.md` — client vs server guard table, production Callout
- `07.17-recap-and-whats-next.md` — explicit Ch 7 → Ch 8 handoff table
- `08.01-set-the-scene.md` — Ch 7 limitations table, IDOR gap Callout, expanded self-check, ChapterRecap

**Validation:** `npm run content:validate` — 348 chapters OK

**Next iteration should:**
1. Module 14–15 Week 2→3 transition — read 13.14 bridge + 15.01 set-the-scene
2. Module 08 build cluster (8.8–8.13) — deepen ownership middleware lessons
3. Module 07 remaining build pages (7.11–7.13) — common mistakes if still thin

### Iteration 2 — 2026-08-05

**Focus:** Modules 06–07 — auth API → login UI bridge + login handler depth

**Diagnosis:**
- Scanned modules 03–19 for off-by-one sub-chapter drift (like iteration 1) — **none found** beyond modules 20–23 already fixed
- Module 06→07 transition was structurally OK but lacked explicit contract handoff table
- 06.13 login handler was implementation-heavy without production context or common mistakes

**Changes:**
- `07.01-set-the-scene.md` — added Chapter 6 contract inheritance table, gate Callout, expanded self-check, ChapterRecap
- `06.13-login-handler.md` — added production critical-path framing, pre-code checkpoint, common mistakes table
- `06.19-recap-and-whats-next.md` — added explicit curl → Chapter 7 field handoff table

**Validation:** `npm run content:validate` — 348 chapters OK

**Next iteration should:**
1. Module 07 build cluster (7.8–7.16) — audit implementation lessons for same "why before what" gaps
2. Module 14–15 Week 2→3 transition — read 13.14 bridge + 14.01 + 15.01 for continuity
3. Module 08 set-the-scene — ensure authz chapter explicitly callbacks Chapter 7 protected routes

### Iteration 1 — 2026-08-05

**Focus:** Modules 21–23 — systematic sub-chapter cross-reference repair

**Problem:** Lessons in chapters 21, 22, and 23 referenced sub-chapter numbers from the previous chapter (20.x, 21.x, 22.x respectively). Students following "see 21.11" inside Chapter 22 would land in the wrong lesson — a major continuity break.

**Changes:**
- Module 20: corrected all internal `19.N` → `20.N` references; fixed checklist title `19.13` → `20.13`
- Module 21: corrected all internal `20.N` → `21.N` references; fixed checklist title `20.16` → `21.16`
- Module 22: corrected internal `21.N` → `22.N`; preserved legitimate backward refs to Chapter 21 (cache, Ch 21.11)
- Module 23: corrected internal `22.N` → `23.N`; preserved backward refs to Chapter 22 (async jobs, Ch 22.12, Chapter 22.15)

**Next iteration should:**
1. Module 07 build cluster (7.8–7.16) — audit implementation lessons for "why before what" gaps
2. Module 14–15 Week 2→3 transition polish
3. Module 08 — authz bridge from Chapter 7 protected routes

## Backlog

- [x] Global grep: wrong sub-chapter refs in modules 03–19 (clean — drift was 20–23 only)
- [x] Module 07 build cluster depth (7.8–7.16) — partial: 7.10, 7.14, 7.15, 7.17 (iteration 3)
- [x] Module 08: authorization narrative continuity from Ch 7 — partial: 8.01 (iteration 3)
- [x] Module 14–15: customer experience transition (Week 2 → Week 3) — iteration 4
- [x] Fix truncated Learning log table rows in what-youll-build lessons (13.03, 14.03, 15.03, 16.03)
- [ ] Module 08 build cluster (8.8–8.13)
- [ ] Module 16–17: cart API → cart UI transition
- [ ] Module 03–04: MongoDB decision → connection bridge polish
- [ ] Module 07 remaining build pages (7.11–7.13) — common mistakes pass

## Notes

- User requested loop every 30 minutes — re-invoke `/loop` or schedule a recurring agent; no automatic timer in-repo.
- Do not change the marketplace project scope — teaching quality only.
