-- When a block was created, so progress can tell a block added after a learner
-- finished a chapter from one that was there all along. Existing rows stay
-- NULL on purpose: their real creation time is unknown, and NULL keeps their
-- progress behaviour exactly as before. Only new rows get the default.
ALTER TABLE "Block" ADD COLUMN "createdAt" TIMESTAMP(3);
ALTER TABLE "Block" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
