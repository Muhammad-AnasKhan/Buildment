export function StepsVisual({
  steps,
}: {
  steps: { label: string; description: string }[];
}) {
  return (
    <div className="mx-auto max-w-xl">
      {steps.map((step, index) => (
        <div
          key={step.label}
          className="relative flex gap-4 border-b border-neutral-100 py-5 last:border-b-0"
        >
          {index < steps.length - 1 ? (
            <div className="absolute left-[13px] top-12 h-[calc(100%-2.5rem)] w-px bg-neutral-200" />
          ) : null}

          <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-xs font-semibold text-neutral-500">
            {index + 1}
          </span>
          <div>
            <p className="text-[15px] font-medium text-neutral-900">{step.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-neutral-500">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
