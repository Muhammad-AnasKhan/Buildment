import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/logo";
import type { AcceptInviteResult, InvitePublicView } from "@/shared/api/invites";
import { getSessionUser } from "@/server/auth/guards";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch } from "@/lib/api-server";

export default async function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let invite: InvitePublicView;
  try {
    invite = await serverApiFetch<InvitePublicView>(`/api/v1/invites/${encodeURIComponent(token)}`, { token: null });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return <InviteShell title="Invite not found" body="This invite link is invalid. Ask your mentor to send a fresh one." />;
    }
    throw error;
  }

  if (invite.state === "revoked") {
    return <InviteShell title="Invite revoked" body="This invite was revoked by the mentor. Ask them to send a new one." />;
  }
  if (invite.state === "accepted") {
    return <InviteShell title="Invite already used" body="This invite has already been accepted." />;
  }
  if (invite.state === "expired") {
    return <InviteShell title="Invite expired" body="This invite has expired. Ask your mentor to send a new one." />;
  }
  if (invite.state === "course-unavailable") {
    return <InviteShell title="Course unavailable" body="This course is not open for enrollment right now." />;
  }

  const user = await getSessionUser();

  if (!user) {
    return (
      <InviteShell
        title="You're invited to join a course"
        body={`${invite.course.mentorName ?? "Your mentor"} invited you to “${invite.course.title}” on buildment.`}
        invite={invite}
      >
        <Link
          href={`/login?redirectTo=${encodeURIComponent(`/invite/${token}`)}`}
          className="block"
        >
          <Button className="h-11 w-full rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500">
            Sign in or create your profile
          </Button>
        </Link>
        {invite.email && (
          <p className="mt-3 text-center text-xs text-neutral-400">
            Use <span className="font-medium text-muted-foreground">{invite.email}</span> — the invite
            is bound to that address.
          </p>
        )}
      </InviteShell>
    );
  }

  if (invite.email && user.email?.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <InviteShell
        title="Wrong account"
        body={`You're signed in as ${user.email}, but this invite was sent to ${invite.email}. Sign out and open the link again with the invited account.`}
        invite={invite}
      />
    );
  }

  return (
    <InviteShell
      title="Accept your invite"
      body={`${invite.course.mentorName ?? "Your mentor"} invited you to “${invite.course.title}”. Accept to add it to your dashboard.`}
      invite={invite}
    >
      <form
        className="space-y-4"
        action={async (formData) => {
          "use server";
          const name = String(formData.get("name") ?? "") || undefined;
          const result = await serverApiFetch<AcceptInviteResult>(`/api/v1/invites/${encodeURIComponent(token)}/accept`, {
            method: "POST",
            json: { name },
          });
          redirect(result.checkoutRequired ? `/courses/${result.courseSlug}/checkout` : `/courses/${result.courseSlug}`);
        }}
      >
        {!user.name && (
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Your name
            </Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="How should your mentor address you?"
              className="h-10 rounded-lg border-border"
            />
          </div>
        )}
        <Button
          type="submit"
          className="h-11 w-full rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Accept invite &amp; start learning
        </Button>
        <p className="text-center text-xs text-neutral-400">Signed in as {user.email}</p>
      </form>
    </InviteShell>
  );
}

type InviteView = InvitePublicView;

function InviteShell({
  title,
  body,
  invite,
  children,
}: {
  title: string;
  body: string;
  invite?: InviteView;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-card px-6 py-24">
      <Logo size="lg" />
      <div className="mt-10 w-full max-w-sm">
        {invite && (
          <div className="mb-6 rounded-xl border border-border p-4">
            <p className="font-semibold text-foreground">{invite.course.title}</p>
            {invite.course.description && (
              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                {invite.course.description}
              </p>
            )}
            <p className="mt-2 text-xs text-neutral-400">
              {invite.course.mentorName ? `Mentored by ${invite.course.mentorName}` : "Mentored course"}
              {invite.course.estimatedHours ? ` · ~${invite.course.estimatedHours}h` : ""}
            </p>
          </div>
        )}

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>

        {children ? (
          <div className="mt-6">{children}</div>
        ) : (
          <Link
            href="/"
            className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline"
          >
            Go to buildment
          </Link>
        )}
      </div>
    </div>
  );
}
