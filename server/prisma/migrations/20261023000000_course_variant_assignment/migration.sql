-- How learners in a course family get their variant. Every existing course keeps
-- today's behaviour (the learner picks), and existing enrolments keep their variant.
CREATE TYPE "VariantAssignment" AS ENUM ('SELF_SELECT', 'RANDOM');

ALTER TABLE "Course" ADD COLUMN "variantAssignment" "VariantAssignment" NOT NULL DEFAULT 'SELF_SELECT';
