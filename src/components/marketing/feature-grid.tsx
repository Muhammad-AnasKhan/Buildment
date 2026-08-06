import { cn } from "@/lib/utils";

export function FeatureGrid({
  features,
}: {
  features: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }[];
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
      {features.map(({ icon: Icon, title, description }) => (
        <div
          key={title}
          className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Icon className="size-5" />
          </div>
          <h3 className="mt-4 text-base font-semibold tracking-tight text-neutral-950">{title}</h3>
          <p className="mt-2 text-[15px] leading-[1.65] text-neutral-600">{description}</p>
        </div>
      ))}
    </div>
  );
}
