"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2, UserPlus, X } from "lucide-react";
import type { CourseTeamView } from "@/shared/api/teach";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inviteCourseInstructor, removeCourseInstructor, revokeCourseInstructorInvite } from "@/server/actions/course-team";

export function CourseTeamPanel({ courseId, courseSlug, team }: { courseId: string; courseSlug: string; team: CourseTeamView }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"COURSE_CREATOR" | "SUBMISSION_EVALUATOR">("SUBMISSION_EVALUATOR");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");

  return <section className="space-y-5 rounded-xl border bg-card p-5" aria-labelledby="course-team-heading">
    <div>
      <h2 id="course-team-heading" className="text-lg font-semibold">Course team</h2>
      <p className="mt-1 max-w-3xl text-sm text-muted-foreground">Invite instructors with access tailored to their work. Course creators can edit and publish course content. Submission evaluators can review submissions for this course.</p>
    </div>
    <form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem_auto]" onSubmit={async (event) => {
      event.preventDefault(); setBusy(true); setMessage("");
      const result = await inviteCourseInstructor({ courseId, courseSlug, email, role });
      setBusy(false);
      if (!result.ok) { setMessage(result.errors.join(" ")); return; }
      setInviteUrl(result.url); setMessage(result.emailSent ? "Invitation sent. You can also copy the link below." : "Email is not configured. Copy and share this invitation link directly."); setEmail("");
      router.refresh();
    }}>
      <Input type="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="instructor@example.com" aria-label="Instructor email" />
      <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={role} onChange={(event) => setRole(event.target.value as typeof role)} aria-label="Course team role">
        <option value="SUBMISSION_EVALUATOR">Submission evaluator</option>
        <option value="COURSE_CREATOR">Course creator</option>
      </select>
      <Button type="submit" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <UserPlus />} Invite instructor</Button>
    </form>
    {message ? <p role="status" className="text-sm text-muted-foreground">{message}</p> : null}
    {inviteUrl ? <div className="flex flex-col gap-2 sm:flex-row"><Input readOnly value={inviteUrl} aria-label="Invitation link" /><Button type="button" variant="outline" onClick={async () => { await navigator.clipboard.writeText(inviteUrl); setMessage("Invitation link copied."); }}><Copy /> Copy link</Button></div> : null}
    <div className="divide-y rounded-lg border">
      <div className="flex items-center justify-between gap-3 p-3 text-sm"><div><p className="font-medium">{team.owner.name || team.owner.email}</p><p className="text-xs text-muted-foreground">{team.owner.email}</p></div><span className="text-xs text-muted-foreground">Course owner</span></div>
      {team.instructors.map((member) => <div key={member.id} className="flex items-center justify-between gap-3 p-3 text-sm"><div><p className="font-medium">{member.name || member.email}</p><p className="text-xs text-muted-foreground">{member.email} · {member.role === "COURSE_CREATOR" ? "Course creator" : "Submission evaluator"}</p></div><Button size="sm" variant="ghost" aria-label={`Remove ${member.email}`} onClick={async () => { const result = await removeCourseInstructor({ courseId, courseSlug, userId: member.id }); setMessage(result.ok ? "Instructor removed from course." : result.errors.join(" ")); if (result.ok) router.refresh(); }}><X /></Button></div>)}
      {team.invites.map((invite) => <div key={invite.id} className="flex items-center justify-between gap-3 p-3 text-sm"><div className="min-w-0"><p className="truncate font-medium">{invite.email}</p><p className="text-xs text-muted-foreground">Pending · {invite.role === "COURSE_CREATOR" ? "Course creator" : "Submission evaluator"}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={async () => { await navigator.clipboard.writeText(invite.url); setMessage("Invitation link copied."); }}><Copy /> Copy link</Button><Button size="sm" variant="ghost" aria-label={`Revoke invitation for ${invite.email}`} onClick={async () => { const result = await revokeCourseInstructorInvite({ courseId, courseSlug, inviteId: invite.id }); setMessage(result.ok ? "Invitation revoked." : result.errors.join(" ")); if (result.ok) router.refresh(); }}><X /></Button></div></div>)}
    </div>
  </section>;
}
