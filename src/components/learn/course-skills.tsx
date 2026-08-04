import { CheckCircle2 } from "lucide-react";

export function CourseSkills({
  skills,
}: {
  skills: { title: string; description: string }[];
}) {
  if (skills.length === 0) return null;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 max-w-xl">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
          Practical skills
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-neutral-950">
          What you&apos;ll be able to build afterward
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill) => (
          <div
            key={skill.title}
            className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4"
          >
            <CheckCircle2 className="size-5 text-indigo-600" aria-hidden />
            <h3 className="mt-2.5 text-sm font-semibold text-neutral-950">{skill.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">{skill.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
