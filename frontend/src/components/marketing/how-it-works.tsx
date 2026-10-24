import { STUDY_NOTES } from "@/components/marketing/marketing-content";
import styles from "./landing.module.css";

export function HowItWorks() {
  return (
    <section id="work" aria-labelledby="work-heading" className="mx-auto grid max-w-7xl scroll-mt-32 gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24 lg:px-12 lg:py-24">
      <div>
        <p className={styles.eyebrow}>A note before you start</p>
        <h2 id="work-heading" className="mt-5 max-w-[12ch] font-serif text-4xl leading-[1.12] sm:text-5xl">One chapter is enough for today.</h2>
        <p className="mt-6 max-w-sm text-base leading-7">You do not need to hold the whole project in your head. Start with the next thing you can test.</p>
      </div>
      <ol>
        {STUDY_NOTES.map((note, index) => (
          <li key={note.title} className="grid grid-cols-[2rem_1fr] gap-4 border-t border-border py-6 first:pt-0 first:border-t-0">
            <span aria-hidden="true" className={`pt-1 font-mono text-xs ${styles.accent}`}>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="text-lg font-medium">{note.title}</h3>
              <p className="mt-2 text-base leading-7">{note.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
