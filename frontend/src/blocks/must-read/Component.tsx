import { fetchBlockState } from "@/blocks/block-state";
import { MandatoryReadCard } from "@/components/learn/mandatory-read-card";
import { PendingBlockCard } from "@/components/learn/pending-block-card";

export async function MustReadComponent({
  id,
  title,
  url,
  href,
  description,
  summary,
  source,
  readMinutes,
}: {
  id?: string;
  title?: string;
  url?: string;
  href?: string;
  description?: string;
  summary?: string;
  source?: string;
  readMinutes?: number;
}) {
  const directUrl = url ?? href;
  const directTitle = title;
  const directDescription = description ?? summary;

  if (directUrl && directTitle && directDescription) {
    const state = id ? await fetchBlockState(id, "MUST_READ") : null;
    return (
      <MandatoryReadCard
        blockId={id}
        initialRead={state?.initialRead ?? false}
        required={state?.required ?? true}
        title={directTitle}
        href={directUrl}
        source={source}
        summary={directDescription}
        readMinutes={readMinutes}
      />
    );
  }

  if (!id) {
    return null;
  }

  const state = await fetchBlockState(id, "MUST_READ");
  if (!state) {
    return (
      <PendingBlockCard
        typeLabel="Mandatory Reading"
        title={title || "Reading assignment in progress"}
        description="Assigned documentation or article details are being configured."
        blockId={id}
      />
    );
  }
  return (
    <MandatoryReadCard
      blockId={id}
      initialRead={state.initialRead}
      required={state.required}
      title={state.config.title}
      href={state.config.url}
      source={state.config.source}
      summary={state.config.description}
      readMinutes={state.config.readMinutes}
    />
  );
}
