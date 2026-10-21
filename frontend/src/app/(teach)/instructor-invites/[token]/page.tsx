import { redirect } from "next/navigation";
import { requireTeachSurface } from "@/server/auth/guards";
import { acceptCourseInstructorInvite } from "@/server/actions/course-team";
import { Button } from "@/components/ui/button";

export default async function AcceptCourseInstructorInvitePage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ error?: string }> }) {
  const { token } = await params;
  const query = await searchParams;
  await requireTeachSurface();
  async function accept() {
    "use server";
    const result = await acceptCourseInstructorInvite(token);
    if (!result.ok) redirect(`/instructor-invites/${encodeURIComponent(token)}?error=${encodeURIComponent(result.errors.join(" "))}`);
    redirect(result.role === "COURSE_CREATOR" ? `/courses/${result.courseSlug}/edit` : "/review");
  }
  return <main className="mx-auto max-w-lg px-5 py-20">
    <div className="rounded-2xl border bg-card p-7 text-center">
      <h1 className="text-2xl font-semibold">Join a course team</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">Accept the invitation to help create course content or evaluate learner submissions. The invitation must match your signed-in email.</p>
      {query.error ? <p role="alert" className="mt-4 text-sm text-destructive">{query.error}</p> : null}
      <form action={accept}><Button className="mt-6">Accept invitation</Button></form>
    </div>
  </main>;
}
