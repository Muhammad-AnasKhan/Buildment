import Link from "next/link";
import { redirect } from "next/navigation";
import { MailPlus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { assignByEmails, revokeInvite } from "@/server/actions/invites";
import { inviteAcceptUrl } from "@/server/email/send";
import { InviteLinkManager } from "@/components/teach/invite-link-manager";
import type { CourseMenteesView } from "@/server/mentor-dashboard/types";

export type AssignmentQuery = { enrolled?: string; invited?: string; emailFailed?: string; assignError?: string };

export function InvitePanel({ view, query }: { view: CourseMenteesView; query: AssignmentQuery }) {
  const { course } = view;
  return <section id="invite-mentees">
    <AssignmentBanner query={query} />
    {course.status !== "PUBLISHED" ? <div className="rounded-xl border bg-muted/35 p-4 text-sm"><span className="font-medium">Invites are paused while this course is a draft.</span> <Link href={`/courses/${course.slug}/edit`} className="underline underline-offset-4">Publish it in course settings</Link> to enroll learners.</div> : <details className="group rounded-2xl border bg-card">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 marker:hidden sm:p-5"><span className="grid size-9 place-items-center rounded-lg bg-muted"><UserPlus className="size-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Invite or assign learners</span><span className="block text-xs text-muted-foreground">Add existing accounts by email or share a reusable enrollment link.</span></span><span className="text-xs text-muted-foreground transition-transform group-open:rotate-180">⌄</span></summary>
      <div className="grid gap-5 border-t p-4 sm:p-5 lg:grid-cols-2">
        <div><h3 className="text-sm font-semibold">Assign by email</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Existing accounts enroll immediately; new addresses receive an invitation.</p><form className="mt-3 space-y-3" action={async (formData) => {
          "use server";
          const emailsRaw = String(formData.get("emails") ?? "");
          const result = await assignByEmails({ courseId: course.id, emailsRaw });
          if (!result.ok) redirect(`/courses/${course.slug}/mentees?assignError=${encodeURIComponent(result.errors.join(" "))}`);
          const params = new URLSearchParams({ enrolled: String(result.enrolledEmails.length), invited: String(result.invitedEmails.length) });
          if (result.emailFailed) params.set("emailFailed", "1");
          redirect(`/courses/${course.slug}/mentees?${params.toString()}`);
        }}><Textarea name="emails" required rows={3} aria-label="Learner email addresses" placeholder={"One email per line\nada@example.com\nben@example.com"} /><Button type="submit"><MailPlus /> Assign learners</Button></form></div>
        <div className="lg:border-l lg:pl-5"><h3 className="text-sm font-semibold">Invite link</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Anyone with the link can enroll while it remains active.</p><div className="mt-3"><InviteLinkManager courseId={course.id} existing={view.linkInvite ? { id: view.linkInvite.id, url: inviteAcceptUrl(view.linkInvite.token) } : null} /></div></div>
      </div>
    </details>}
    {view.pendingEmailInvites.length ? <details className="mt-3 rounded-xl border bg-card"><summary className="cursor-pointer px-4 py-3 text-sm font-medium">Pending email invitations · {view.pendingEmailInvites.length}</summary><ul className="divide-y border-t">{view.pendingEmailInvites.map((invite) => <li key={invite.id} className="flex items-center justify-between gap-3 px-4 py-3"><div className="min-w-0"><p className="truncate text-sm">{invite.email}</p><p className="text-xs text-muted-foreground">Invited {new Date(invite.createdAt).toLocaleDateString()}</p></div><form action={async () => { "use server"; await revokeInvite({ inviteId: invite.id, courseId: course.id }); redirect(`/courses/${course.slug}/mentees`); }}><Button type="submit" variant="ghost" size="sm" className="text-destructive">Revoke</Button></form></li>)}</ul></details> : null}
  </section>;
}

function AssignmentBanner({ query }: { query: AssignmentQuery }) {
  if (query.assignError) return <div className="mb-3 rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">{query.assignError}</div>;
  const enrolled = Number(query.enrolled ?? 0); const invited = Number(query.invited ?? 0);
  if (!enrolled && !invited) return null;
  return <div className="mb-3 rounded-xl border bg-muted/40 p-3 text-sm"><p>{enrolled ? `${enrolled} account${enrolled === 1 ? "" : "s"} enrolled` : ""}{enrolled && invited ? " · " : ""}{invited ? `${invited} invitation${invited === 1 ? "" : "s"} created` : ""}.</p>{query.emailFailed === "1" ? <p className="mt-1 text-xs text-muted-foreground">Email delivery is not configured, but the invitations were saved.</p> : null}</div>;
}
