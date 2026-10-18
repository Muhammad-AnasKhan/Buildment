import type { LearnerProfile } from "@/shared/api/learner";
import { requireTeachSurface } from "@/server/auth/guards";
import { serverApiFetch } from "@/lib/api-server";
import { ProfileForm } from "@/components/auth/profile-form";
import { PasswordForm } from "@/components/auth/password-form";

export default async function InstructorProfilePage() {
  await requireTeachSurface();
  const profile = await serverApiFetch<LearnerProfile>("/api/v1/learner/profile");
  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Profile settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage your profile and password. Your details are shared across Learn and Teach.</p>
      </header>
      <ProfileForm email={profile.email} initial={{ name: profile.name ?? "", timezone: profile.timezone, skills: profile.skills.join(", ") }} />
      <PasswordForm />
    </div>
  );
}
