export function StepsVisual({
  steps,
}: {
  steps: { label: string; description: string }[];
}) {
  return (
    <div className="mx-auto max-w-2xl">
      {steps.map((step, index) => (
        <div
          key={step.label}
          className="relative flex gap-5 border-b border-neutral-200 py-5 last:border-b-0"
        >
          {/* Connector line */}
          {index < steps.length - 1 ? (
            <div className="absolute left-[15px] top-[3.25rem] h-[calc(100%-0.5rem)] w-px bg-neutral-200" />
          ) : null}

          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-indigo-200 bg-indigo-50 text-xs font-bold text-indigo-700">
            {index + 1}
          </span>
          <div>
            <p className="font-medium text-neutral-950">{step.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-neutral-600">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
