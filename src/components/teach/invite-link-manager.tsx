"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Link2 } from "lucide-react";
import { createInviteLink, revokeInvite } from "@/server/actions/invites";
import { CopyField } from "@/components/teach/copy-field";

type ExistingLink = {
  id: string;
  url: string;
};

export function InviteLinkManager({
  courseId,
  existing,
}: {
  courseId: string;
  existing: ExistingLink | null;
}) {
  const router = useRouter();
  const [created, create, isCreating] = useActionState(
    () => createInviteLink({ courseId }),
    undefined
  );
  const [revoking, setRevoking] = useState(false);

  const link = created?.ok ? { id: null, url: created.url } : existing;
  const createError = created && !created.ok ? created.errors.join(" ") : null;

  const handleRevoke = async () => {
    if (!existing) return;
    setRevoking(true);
    await revokeInvite({ inviteId: existing.id, courseId });
    router.refresh();
  };

  if (!link) {
    return (
      <div>
        <button
          type="button"
          onClick={() => void create()}
          disabled={isCreating}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
        >
          <Link2 className="size-3.5" />
          {isCreating ? "Creating link…" : "Create invite link"}
        </button>
        {createError && <p className="mt-2 text-xs text-red-600">{createError}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <CopyField value={link.url} />
      {existing && (
        <div>
          <button
            type="button"
            onClick={() => void handleRevoke()}
            disabled={revoking}
            className="text-xs font-medium text-neutral-400 transition-colors hover:text-red-600 disabled:opacity-50"
          >
            {revoking ? "Revoking…" : "Revoke this link"}
          </button>
        </div>
      )}
      {createError && <p className="text-xs text-red-600">{createError}</p>}
    </div>
  );
}
