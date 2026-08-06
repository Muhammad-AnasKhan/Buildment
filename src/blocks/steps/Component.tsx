import { prisma } from "@/server/db";
import { StepsConfigSchema } from "./schema";
import { StepsClient } from "./StepsClient";

// The Steps block is a static, presentational block rendered entirely from its
// MDX children (<Step> tags). Unlike QUIZ or OPEN_QUESTION, it has no
// submission, no grading, and only a minimal server config (optional title).
//
// This is a server component so it can verify the block exists in the DB and
// parse its config. The actual rendering is delegated to StepsClient (a client
// component) which receives the MDX children directly.
export async function StepsComponent({
  id,
  children,
}: {
  id: string;
  children?: React.ReactNode;
}) {
  const block = await prisma.block.findUnique({ where: { id } });
  const parsed = block ? StepsConfigSchema.safeParse(block.config) : null;
  const config = parsed?.success ? parsed.data : null;

  return (
    <StepsClient id={id} title={config?.title}>
      {children}
    </StepsClient>
  );
}
