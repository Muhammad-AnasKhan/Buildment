# Course content improvement loop — state

Last updated: 2026-08-10 (iteration 8)

## Course

Multi-Vendor Food Marketplace — `content/import/multi-vendor-marketplace/`

## Completed iterations

### Iteration 8 — 2026-08-10

**Focus:** Modules 13, 19, 20, 11, 15 — photos, payment, checkout UI, product API

**Changes:**
- **Module 13:** Rewrote 13.09 upload route, 13.11 upload UI; visual in 13.03; checklist 13.15 hints
- **New visual:** `product-upload-flow.svg`
- **Module 19:** Rewrote 19.10 payment intent, 19.11 payment-gated checkout; checklist 19.16 hints
- **Module 20:** Enhanced 20.05 with wireframe; rewrote 20.06 confirmation page
- **New visual:** `checkout-page-wireframe.svg`
- **Module 11:** Rewrote 11.09 create, 11.10 list vendor products
- **Module 15:** Rewrote 15.10 verify browse UI with full test script

**Validation:** `pnpm content:validate` — 350 chapters OK

**Next iteration should:**
1. Module 20 remaining build (20.07, 20.08, 20.10)
2. Module 19 webhook 19.12 + verify 19.14
3. Module 13 — 13.08, 13.10, 13.12
4. Module 11 — 11.11, 11.12, 11.13
5. Global checklist pass modules 14, 20, 21–23

### Iteration 7 — 2026-08-10

**Focus:** Modules 10, 12, 18, 07 — vendor onboarding, product dashboard, checkout gate, auth UI

**Changes:**
- **Module 10:** Rewrote 10.06, 10.08, 10.09 with numbered steps; checklist 10.12 verify hints
- **Module 12:** Rewrote 12.08 edit, 12.09 publish toggle; checklist 12.12 verify hints
- **Module 18:** Checklist 18.18 with critical two-order proof + verify hints
- **Module 07:** Rewrote 07.11 register, 07.13 login with step-by-step

**Validation:** `pnpm content:validate` — 350 chapters OK

**Next iteration should:**
1. Module 13 photo upload build cluster
2. Module 19–20 payment + checkout UI
3. Module 11 product API build lessons
4. Module 15.10 verify lesson
5. Global checklist pass modules 11, 14, 19–23

### Iteration 6 — 2026-08-10

**Focus:** Modules 15, 16, 18, 10 — shop UI, cart API, checkout API, vendor onboarding build clusters

**Changes:**
- **Module 15:** Rewrote build lessons 15.05–15.09 with numbered steps; visuals in 15.03; checklist 15.12 with verify hints
- **New visuals:** `shop-page-wireframe.svg`, `product-detail-wireframe.svg`
- **Module 18:** Rewrote checkout build 18.09–18.13 with step-by-step + checkout flow diagram in 18.03
- **New visual:** `checkout-split-flow.svg`
- **Module 16:** Rewrote 16.08 POST /cart; checklist 16.15 verify hints
- **Module 10:** Rewrote 10.07 open shop form; `vendor-open-shop-wireframe.svg`
- Stopped 30-minute wait loop per user request — continuous improvement mode

**Validation:** `pnpm content:validate` — 350 chapters OK

**Next iteration should:**
1. Module 10 remaining build (10.06, 10.08, 10.09) — step-by-step + wireframes
2. Module 12 vendor dashboard build cluster
3. Module 18 checklist 18.18 — verify hints
4. Module 07 remaining (7.11–7.13)
5. Roll step-by-step pattern to modules 11, 13, 19–20

### Iteration 5 — 2026-08-10

**Focus:** Module 16→17 cart UI transition + Chapter 17 build cluster

*(see git history for full detail)*

## Backlog

- [x] Module 16–17 cart transition
- [x] Module 15 shop UI build cluster — partial (15.05–15.09, 15.12)
- [x] Module 18 checkout build cluster — partial (18.09–18.13)
- [ ] Module 15 — 15.10 verify lesson polish
- [x] Module 10 — 10.06, 10.08, 10.09, 10.12
- [x] Module 12 vendor dashboard — 12.06–12.09, 12.12
- [x] Module 18 checklist 18.18
- [x] Module 07 — 7.11, 7.13
- [x] Module 13 — partial (13.03, 13.09, 13.11, 13.15)
- [x] Module 19 — partial (19.10, 19.11, 19.16)
- [x] Module 20 — partial (20.05, 20.06)
- [x] Module 11 — partial (11.09, 11.10)
- [x] Module 15 — 15.10
- [ ] Module 20 — 20.07, 20.08, 20.10, 20.13
- [ ] Module 19 — 19.12 webhook, 19.14 verify
- [ ] Module 13 — 13.08, 13.10, 13.12
- [ ] Module 11 — 11.11–11.13, 11.15

## Notes

- User requested continuous improvement — no 30-minute wait between passes.
- **Stitch MCP is live** — use `CallMcpTool` on the `stitch` server for course UI preview PNGs. See `.cursor/rules/stitch-mcp.mdc`. Showcase PNGs live in `public/showcase/multi-vendor-marketplace/` (18 screens). All chapter SVG wireframes removed Aug 2026.
