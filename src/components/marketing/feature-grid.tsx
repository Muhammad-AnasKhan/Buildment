export function FeatureGrid({
  features,
}: {
  features: { title: string; description: string }[];
}) {
  return (
    <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {features.map(({ title, description }) => (
        <div key={title}>
          <h3 className="text-[15px] font-semibold text-neutral-900">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">{description}</p>
        </div>
      ))}
    </div>
  );
}
