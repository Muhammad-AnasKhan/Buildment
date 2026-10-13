import type { Request, Response } from "express";
import type { WeeklyGoalInput } from "@buildment/shared/api/learner";
import type { StreakMilestone } from "@buildment/shared/lib/streak";
import { created, noContent, ok } from "../utils/responses.js";
import { bypassProgressGatingForEmail } from "../services/auth/seed-access.js";
import { loadLearnerWorkspace } from "../services/learner/workspace.js";
import { loadMenteeDashboard } from "../services/learner/load-mentee-dashboard.js";
import { loadLearnerProgress } from "../services/learner/progress.js";
import * as weeklyGoal from "../services/learner/weekly-goal.js";
import { loadProfile, updateProfile } from "../services/learner/profile.js";
import { requestInstructorAccess } from "../services/instructor-access/request.js";
import type { ProfileUpdateInput } from "@buildment/shared/api/learner";

function displayName(user: { name: string | null; email: string }) {
  return user.name?.trim() || user.email.split("@")[0] || "there";
}

// GET /api/v1/learner/workspace
export async function workspace(req: Request, res: Response) {
  ok(res, await loadLearnerWorkspace(req.user!));
}

// GET /api/v1/learner/dashboard
export async function dashboard(req: Request, res: Response) {
  const user = req.user!;
  ok(
    res,
    await loadMenteeDashboard({
      learnerId: user.id,
      learnerName: displayName(user),
      bypassLocking: bypassProgressGatingForEmail(user.email),
    })
  );
}

// GET /api/v1/learner/progress
export async function progress(req: Request, res: Response) {
  const user = req.user!;
  ok(res, await loadLearnerProgress({ userId: user.id, bypassLocking: bypassProgressGatingForEmail(user.email) }));
}

// PUT /api/v1/learner/weekly-goal
export async function putWeeklyGoal(req: Request, res: Response) {
  await weeklyGoal.setWeeklyGoal(req.user!.id, req.body as WeeklyGoalInput);
  noContent(res);
}

// DELETE /api/v1/learner/weekly-goal
export async function deleteWeeklyGoal(req: Request, res: Response) {
  await weeklyGoal.clearWeeklyGoal(req.user!.id);
  noContent(res);
}

// POST /api/v1/learner/streak-milestones/:milestone/acknowledge
export async function acknowledgeStreakMilestone(req: Request, res: Response) {
  const { milestone } = req.params as unknown as { milestone: StreakMilestone };
  await weeklyGoal.acknowledgeStreakMilestone(req.user!.id, milestone);
  noContent(res);
}

// GET /api/v1/learner/profile
export async function profile(req: Request, res: Response) {
  ok(res, await loadProfile(req.user!));
}

// PATCH /api/v1/learner/profile
export async function patchProfile(req: Request, res: Response) {
  await updateProfile(req.user!, req.body as ProfileUpdateInput);
  noContent(res);
}

// POST /api/v1/learner/instructor-access-requests
export async function requestInstructor(req: Request, res: Response) {
  const { message } = req.body as { message?: string };
  created(res, await requestInstructorAccess(req.user!, message));
}
