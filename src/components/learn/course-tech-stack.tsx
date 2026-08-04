export function CourseTechStack({ techStack }: { techStack: string[] }) {
  if (techStack.length === 0) return null;

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        Project tech stack
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {techStack.map((tech) => (
          <span
            key={tech}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50/50"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
