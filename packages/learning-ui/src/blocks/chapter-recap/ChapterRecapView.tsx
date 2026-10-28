
export function ChapterRecapView({ points }: { points: string[] }) {
const list = points;
  return (
    <div className="not-prose my-8 rounded-xl border border-ok bg-ok-soft p-5">
      <h4 className="text-sm font-semibold text-ok">Key ideas from this chapter</h4>
      <ul className="mt-3 space-y-2">
        {list.map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <svg className="mt-0.5 size-4 shrink-0 text-ok" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="leading-relaxed">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
