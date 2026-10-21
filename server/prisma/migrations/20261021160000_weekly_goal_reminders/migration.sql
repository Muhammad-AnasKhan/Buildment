ALTER TABLE "User"
  ADD COLUMN "weeklyGoalReminderEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "weeklyGoalReminderSentOn" DATE;
