# Learner-selectable variants for FreshMarket: first version

**Date:** 2026-10-21
**Status:** agreed with the product owner for a first PR

## Intent

The product owner asked to "allow user to select variant so all course becomes adaptive as per variant design theme and later at end specialisation in some area is also chosen".

The multi-vendor marketplace family has six products: FreshMarket (grocery, the general course) and five variants (services, handmade, home-kitchens, digital-goods, books). They are described in `agent-ip/work/multi-vendor-marketplace/variant-diff.md`. None of the variant chapters exist yet, and no instructor has signed off on the variant roadmaps. So this first version lets a learner pick the product they are building and changes how the whole course looks for that product. It also records a specialisation choice at the end of the course. Changing the chapter content per variant comes later.

## Goals

- A learner picks a variant when they enrol. They can also pick or change it later from the course home.
- The course home and every chapter in the reader use that variant's theme: accent colour, heading style and a banner with the product name.
- The choice is saved on the enrolment, and mentors see it on the mentee roster and the mentee evaluation page.
- When the learner completes the course, the course home offers a specialisation choice. Their variant's own follow-up is marked as recommended, and the pick is saved and shown to mentors.

## Non-goals

- Variant-specific chapters, swapped modules or placeholders such as `%%project.name%%` in chapter text (platform-needs.md, need 4).
- Brand styles, project names, wordmarks and accents for each learner (personalization-layer.md). That layer is separate from variants.
- Seat caps, cohort draws and separate Course rows for each variant (platform-needs.md, needs 1 to 3).
- The follow-up specialisation courses themselves. We only record the choice.

## Anti-goals

- A theme that breaks reading. Every accent must pass WCAG AA (4.5:1) as text on the reader background, and its button label must pass on the accent, in light and dark mode. A unit test enforces this.
- A change that affects courses with no variants. Without a family, nothing changes.

## Decisions

| Question | Decision | Whose call |
|---|---|---|
| Separate Course rows or one course with overlays | One course. The variant is stored on the enrolment, so progress, gating, reports and the review queue stay untouched. | Proposed by Claude, approved by the product owner |
| What "adaptive" changes first | Theme only: accent colour, heading font stack and a product-name banner on the course home and in the reader | Proposed by Claude, approved by the product owner |
| Where specialisation happens | On the course home once the course is complete, recorded on the enrolment | Proposed by Claude, approved by the product owner |
| How a course gets variants | New nullable `Course.familySlug`. The variant catalogue lives in shared code, keyed by family. A migration sets it on both known FreshMarket slugs (`multi-vendor-marketplace` and `freshmarket-multi-vendor-marketplace-v2`), and `course.yaml` accepts an optional `family`. | Claude |
| Default when nothing is picked | The family's general variant (grocery, FreshMarket). The course home prompts the learner to pick. | Claude |
| Can the variant change | Yes, until the course is complete. While the content is the same for every variant, switching costs nothing. Once variant chapters exist, it should lock after the first build module (personalization-layer.md 4.4). | Claude |
| Specialisation list | All six follow-up tracks of the family, with the learner's own variant's track first and marked as recommended. Grocery's follow-up ("Inventory and reservations at scale") is not in the roadmaps; Claude added it from FreshMarket's hardest constraint. | Claude |
| Colours | One accent for each variant, taken from its identity notes in the variant roadmaps: FreshMarket green, SkillSlot deep teal, Ghurza deep red, Sufra warm amber, Midad electric violet, Hamesh ink blue. Books and handmade use a serif heading stack (system fonts, so nothing extra to download). | Claude |

## Data

- `Course.familySlug String?`
- `Enrollment.variantSlug String?`, `variantChosenAt DateTime?`, `specialisationSlug String?`, `specialisationChosenAt DateTime?`

The slugs are checked against the shared catalogue in the API, not with database enums, so content can add variants without a migration.

## API

- `CourseOverview` and `ChapterReaderView` gain a `track` field: the family slug, the chosen or default variant slug, whether the learner has picked yet, the specialisation slug and whether it is open yet. It is null for courses with no family.
- `PUT /api/v1/courses/:courseSlug/track/variant` with `{ variantSlug }`. Only the enrolled learner can call it. It is refused after the course is complete.
- `PUT /api/v1/courses/:courseSlug/track/specialisation` with `{ specialisationSlug }`. Only the enrolled learner can call it, and only once the course is complete.
- The mentee roster item and the mentee evaluation gain `track: { variant, specialisation } | null`, with labels.

## Frontend

- `/courses/[courseSlug]/variant` is a picker page with one card per variant: product name, what you build, hardest constraint and an accent swatch. After a self-enrolment in a course with a family, the learner goes there first.
- `VariantThemeScope` wraps the course home and reader in `data-variant` with the accent tokens. `globals.css` maps them onto `--primary`, `--ring` and a banner tint for light and dark mode.
- The course home shows the variant banner, a "Pick your variant" prompt until the learner chooses, and the specialisation chooser once the course is complete.
- The mentor roster and evaluation pages show a small variant and specialisation chip.

## Left to the builder

Layout and copy of the picker and chooser, test shape, and the exact dark-mode accent shades, within the contrast rule above.
