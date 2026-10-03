import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth/guards";
import { getLatestBlockResponse } from "@/server/progress/latest-response";
import { MandatoryReadCard } from "@/components/learn/mandatory-read-card";
import { MustReadConfigSchema } from "./schema";

export async function MustReadComponent({ id }: { id: string }) {
  const block = await prisma.block.findUnique({ where: { id } });
  const parsed = block ? MustReadConfigSchema.safeParse(block.config) : null;
  if (!block || block.type !== "MUST_READ" || !parsed?.success) {
    return <div className="my-6 rounded-md border border-dashed border-destructive/50 p-4 text-sm text-destructive">Mandatory read block {id} is missing or misconfigured.</div>;
  }
  const user = await getSessionUser();
  const latest = user ? await getLatestBlockResponse(id, user.id) : null;
  return <MandatoryReadCard blockId={id} initialRead={Boolean(latest && latest.status !== "DRAFT")} title={parsed.data.title} href={parsed.data.url} source={parsed.data.source} summary={parsed.data.description} readMinutes={parsed.data.readMinutes} />;
}
