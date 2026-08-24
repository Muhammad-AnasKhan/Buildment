import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/logo";
import { getSessionUser } from "@/server/auth/guards";
import { acceptInvite, getPublicInviteView } from "@/server/actions/invites";

export default async function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await getPublicInviteView(token);

  if (!invite) {
    return <InviteShell title="Invite not found" body="This invite link is invalid. Ask your mentor to send a fresh one." />;
  }
  if (invite.revokedAt) {
    return <InviteShell title="Invite revoked" body="This invite was revoked by the mentor. Ask them to send a new one." />;
  }
  if (invite.acceptedAt) {
    return <InviteShell title="Invite already used" body="This invite has already been accepted." />;
  }
  if (invite.expiresAt && invite.expiresAt <= new Date()) {
    return <InviteShell title="Invite expired" body="This invite has expired. Ask your mentor to send a new one." />;
  }
  if (invite.course.status !== "PUBLISHED") {
    return <InviteShell title="Course unavailable" body="This course is not open for enrollment right now." />;
  }

  const user = await getSessionUser();

  if (!user) {
    return (
      <InviteShell
        title="You're invited to join a course"
        body={`${invite.course.mentor.name ?? "Your mentor"} invited you to “${invite.course.title}” on buildment.`}
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
            Use <span className="font-medium text-neutral-600">{invite.email}</span> — the invite
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
      body={`${invite.course.mentor.name ?? "Your mentor"} invited you to “${invite.course.title}”. Accept to add it to your dashboard.`}
      invite={invite}
    >
      <form
        className="space-y-4"
        action={async (formData) => {
          "use server";
          const name = String(formData.get("name") ?? "") || undefined;
          const result = await acceptInvite({ token, name });
          if (result.ok) {
            if (user.role === "MENTEE") {
              redirect(`/courses/${result.courseSlug}`);
            }
            redirect("/courses");
          }
        }}
      >
        {!user.name && (
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-neutral-700">
              Your name
            </Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="How should your mentor address you?"
              className="h-10 rounded-lg border-neutral-200"
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

type InviteView = NonNullable<Awaited<ReturnType<typeof getPublicInviteView>>>;

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
    <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-24">
      <Logo size="lg" />
      <div className="mt-10 w-full max-w-sm">
        {invite && (
          <div className="mb-6 rounded-xl border border-neutral-200 p-4">
            <p className="font-semibold text-neutral-900">{invite.course.title}</p>
            {invite.course.description && (
              <p className="mt-1 line-clamp-3 text-sm text-neutral-500">
                {invite.course.description}
              </p>
            )}
            <p className="mt-2 text-xs text-neutral-400">
              {invite.course.mentor.name ? `Mentored by ${invite.course.mentor.name}` : "Mentored course"}
              {invite.course.estimatedHours ? ` · ~${invite.course.estimatedHours}h` : ""}
            </p>
          </div>
        )}

        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">{body}</p>

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
