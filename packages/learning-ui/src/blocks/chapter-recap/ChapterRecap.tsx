import { ChapterRecapView } from "./ChapterRecapView";

export function ChapterRecap({ points, items }: { points?: string[]; items?: string[] }) {
  const list = points ?? items;
  return list?.length ? <ChapterRecapView points={list} /> : null;
}
