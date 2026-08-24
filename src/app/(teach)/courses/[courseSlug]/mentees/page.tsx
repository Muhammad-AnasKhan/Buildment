import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Users } from "lucide-react";
import { prisma } from "@/server/db";
import { requireMentorOfCourse } from "@/server/auth/guards";
import { assignByEmails, revokeInvite } from "@/server/actions/invites";
import { inviteAcceptUrl } from "@/server/email/send";
import { InviteLinkManager } from "@/components/teach/invite-link-manager";

type SearchParams = {
  enrolled?: string;
  invited?: string;
  emailFailed?: string;
  assignError?: string;
};

export default async function CourseMenteesPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { courseSlug } = await params;
  const query = await searchParams;

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      enrollments: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
      invites: {
        where: { acceptedAt: null, revokedAt: null },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!course) notFound();
  await requireMentorOfCourse(course.id);

  const isDraft = course.status !== "PUBLISHED";
  const linkInvite = course.invites.find((invite) => invite.email === null);
  const pendingEmailInvites = course.invites.filter((invite) => invite.email !== null);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={`/courses/${course.slug}/edit`}
        className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
      >
        ← Back to course
      </Link>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Mentees — {course.title}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Assign by email, or share an invite link mentees can use to enroll themselves.
          </p>
        </div>
        <span
          className={
            course.status === "PUBLISHED"
              ? "rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
              : "rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600"
          }
        >
          {course.status.toLowerCase()}
        </span>
      </div>

      <AssignmentBanner query={query} />

      {isDraft ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          This course is still a draft — publish it in{" "}
          <Link
            href={`/courses/${course.slug}/edit`}
            className="font-medium underline underline-offset-2"
          >
            course settings
          </Link>{" "}
          before assigning mentees.
        </div>
      ) : (
        <>
          {/* Section 1: invite mentees (email + invite link) */}
          <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-neutral-900">Invite mentees</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Emails with an existing account are enrolled immediately; new emails get an
              invite. You can also share the invite link.
            </p>

            <form
              className="mt-4 flex flex-col gap-3"
              action={async (formData) => {
                "use server";
                const emailsRaw = String(formData.get("emails") ?? "");
                const result = await assignByEmails({ courseId: course.id, emailsRaw });
                if (!result.ok) {
                  redirect(
                    `/courses/${course.slug}/mentees?assignError=${encodeURIComponent(result.errors.join(" "))}`
                  );
                }
                const params = new URLSearchParams({
                  enrolled: String(result.enrolledEmails.length),
                  invited: String(result.invitedEmails.length),
                });
                if (result.emailFailed) params.set("emailFailed", "1");
                redirect(`/courses/${course.slug}/mentees?${params.toString()}`);
              }}
            >
              <textarea
                name="emails"
                required
                rows={3}
                placeholder={"One email per line\nada@example.com\nben@example.com"}
                className="w-full rounded-lg border border-neutral-200 bg-white p-3 text-sm text-neutral-800 outline-none transition-colors focus:border-indigo-300"
              />
              <div>
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                >
                  Assign mentees
                </button>
              </div>
            </form>

            <div className="mt-5 border-t border-neutral-100 pt-5">
              <h3 className="text-sm font-medium text-neutral-900">Invite link</h3>
              <div className="mt-2">
                <InviteLinkManager
                  courseId={course.id}
                  existing={
                    linkInvite
                      ? { id: linkInvite.id, url: inviteAcceptUrl(linkInvite.token) }
                      : null
                  }
                />
              </div>
            </div>
          </section>

          {/* Section 2: pending email invites */}
          {pendingEmailInvites.length > 0 && (
            <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-neutral-900">Pending invites</h2>
              <ul className="mt-2 divide-y divide-neutral-100">
                {pendingEmailInvites.map((invite) => (
                  <li key={invite.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-neutral-900">{invite.email}</p>
                      <p className="text-xs text-neutral-400">
                        Invited {invite.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <form
                      action={async () => {
                        "use server";
                        await revokeInvite({ inviteId: invite.id, courseId: course.id });
                        redirect(`/courses/${course.slug}/mentees`);
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:border-red-200 hover:bg-red-50"
                      >
                        Revoke
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {/* Section 3: enrolled table */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-neutral-900">
          Enrolled · {course.enrollments.length}
        </h2>
        {course.enrollments.length === 0 ? (
          <div className="mt-3 flex flex-col items-center gap-2 rounded-xl border border-neutral-200 bg-white py-12 text-center">
            <Users className="size-8 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-700">No mentees enrolled yet</p>
            <p className="text-sm text-neutral-400">
              {isDraft
                ? "Publish the course to start assigning."
                : "Assign mentees above to get started."}
            </p>
          </div>
        ) : (
          <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-xs font-medium text-neutral-500">
                    <th className="px-4 py-3">Mentee</th>
                    <th className="px-4 py-3">Progress</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {course.enrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-neutral-900">
                          {enrollment.user.name ?? "Unnamed"}
                        </p>
                        <p className="text-xs text-neutral-400">{enrollment.user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-neutral-100">
                            <div
                              className="h-full rounded-full bg-indigo-600"
                              style={{ width: `${enrollment.percentComplete}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-neutral-500">
                            {enrollment.percentComplete}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            enrollment.status === "COMPLETED"
                              ? "rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                              : enrollment.status === "IN_PROGRESS"
                                ? "rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
                                : enrollment.status === "DROPPED"
                                  ? "rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700"
                                  : "rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600"
                          }
                        >
                          {enrollment.status.toLowerCase().replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-400">
                        {enrollment.lastActiveAt
                          ? enrollment.lastActiveAt.toLocaleDateString()
                          : "Not started"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function AssignmentBanner({ query }: { query: SearchParams }) {
  if (query.assignError) {
    return (
      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        {query.assignError}
      </div>
    );
  }

  const enrolled = Number(query.enrolled ?? 0);
  const invited = Number(query.invited ?? 0);
  if (enrolled === 0 && invited === 0) return null;

  const parts: string[] = [];
  if (enrolled > 0) parts.push(`${enrolled} account${enrolled === 1 ? "" : "s"} enrolled`);
  if (invited > 0) parts.push(`${invited} invite email${invited === 1 ? "" : "s"} sent`);

  return (
    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
      <p>{parts.join(" · ")}.</p>
      {query.emailFailed === "1" && (
        <p className="mt-1 text-xs text-amber-700">
          Email delivery is not configured (set AUTH_RESEND_KEY + EMAIL_FROM) — the invites
          were created, but no emails went out.
        </p>
      )}
    </div>
  );
}
