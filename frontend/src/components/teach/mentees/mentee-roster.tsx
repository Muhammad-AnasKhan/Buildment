"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { NudgeMenteeButton } from "@/components/teach/nudge-mentee-button";
import { RepairEnrollmentProgressButton } from "@/components/teach/repair-enrollment-progress-button";
import { formatStudyAmount } from "@/lib/format-study-duration";
import { cn } from "@/lib/utils";
import type { MenteeRosterItem } from "@/server/mentor-dashboard/types";

export function MenteeRoster({ mentees }: { mentees: MenteeRosterItem[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [progress, setProgress] = useState("all");
  const [attention, setAttention] = useState("all");
  const [activity, setActivity] = useState("all");
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return mentees.filter((mentee) => {
      if (needle && !mentee.name.toLowerCase().includes(needle) && !mentee.email?.toLowerCase().includes(needle)) return false;
      if (status !== "all" && mentee.status !== status) return false;
      if (progress !== "all" && mentee.progressState !== progress) return false;
      if (activity !== "all" && mentee.activityState !== activity) return false;
      if (attention === "pending" && mentee.pendingReviews === 0) return false;
      if (attention === "help" && mentee.openHelpRequests === 0) return false;
      if (attention === "any" && mentee.attention.length === 0) return false;
      return true;
    }).sort((a, b) => b.attention.length - a.attention.length || a.name.localeCompare(b.name));
  }, [activity, attention, mentees, progress, query, status]);

  return <section aria-labelledby="roster-title">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><h2 id="roster-title" className="text-lg font-semibold">Learner roster</h2><p className="text-sm text-muted-foreground">{visible.length} of {mentees.length} learners shown</p></div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      <label className="relative sm:col-span-2 lg:col-span-1"><span className="sr-only">Search learners</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or email" className="h-9 pl-9" /></label>
      <Filter label="Enrollment status" value={status} setValue={setStatus} options={[["all", "All statuses"], ["ASSIGNED", "Assigned"], ["IN_PROGRESS", "In progress"], ["COMPLETED", "Completed"], ["DROPPED", "Dropped"]]} />
      <Filter label="Progress state" value={progress} setValue={setProgress} options={[["all", "All progress"], ["not-started", "Not started"], ["in-progress", "In progress"], ["completed", "Completed"]]} />
      <Filter label="Mentor attention" value={attention} setValue={setAttention} options={[["all", "All learners"], ["any", "Needs attention"], ["pending", "Pending reviews"], ["help", "Open help"]]} />
      <Filter label="Recent activity" value={activity} setValue={setActivity} options={[["all", "Any activity"], ["recent", "Active 7 days"], ["inactive", "Inactive 7+ days"], ["never", "Not started"]]} />
    </div></div>
    {visible.length ? <><div className="mt-4 hidden overflow-hidden rounded-2xl border bg-card md:block"><table className="w-full table-fixed text-sm"><thead><tr className="border-b bg-muted/25 text-left text-[11px] font-medium text-muted-foreground"><th className="w-[27%] px-4 py-3">Learner</th><th className="w-[17%] px-4 py-3">Progress</th><th className="w-[18%] px-4 py-3">Current work</th><th className="w-[15%] px-4 py-3">Attention</th><th className="w-[11%] px-4 py-3">Activity</th><th className="w-[12%] px-4 py-3 text-right">Action</th></tr></thead><tbody className="divide-y">{visible.map((mentee) => <DesktopRow key={mentee.id} mentee={mentee} />)}</tbody></table></div><div className="mt-4 grid gap-3 md:hidden">{visible.map((mentee) => <MobileCard key={mentee.id} mentee={mentee} />)}</div></> : <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed p-12 text-center"><Users className="size-7 text-muted-foreground" /><p className="mt-3 text-sm font-medium">No learners match these filters</p><p className="mt-1 text-sm text-muted-foreground">Adjust the search, status, progress, attention, or activity filter.</p></div>}
  </section>;
}

function DesktopRow({ mentee }: { mentee: MenteeRosterItem }) { return <tr className="align-top transition-colors hover:bg-muted/20"><td className="px-4 py-3"><Identity mentee={mentee} /></td><td className="px-4 py-3"><Progress mentee={mentee} /></td><td className="px-4 py-3"><p className="truncate text-xs font-medium">{mentee.currentChapter ?? "No chapter opened"}</p><p className="mt-1 text-[11px] text-muted-foreground">{mentee.maxScore ? `${mentee.score}/${mentee.maxScore} score` : "No score yet"} · {formatStudyAmount(mentee.studySeconds)}</p></td><td className="px-4 py-3"><Attention mentee={mentee} /></td><td className="px-4 py-3"><p className="text-xs font-medium">{mentee.lastActiveLabel}</p><p className="mt-1 text-[11px] capitalize text-muted-foreground">{mentee.status.toLowerCase().replaceAll("_", " ")}</p></td><td className="px-4 py-3"><div className="flex flex-col items-end gap-1"><Link href={mentee.evaluationHref} className={cn(buttonVariants({ size: "sm" }), "gap-1")}>Evaluate <ArrowRight /></Link><details className="relative"><summary className="cursor-pointer list-none text-[11px] text-muted-foreground hover:text-foreground">More tools</summary><div className="absolute right-0 z-10 mt-1 flex w-52 flex-col gap-1 rounded-xl border bg-popover p-2 shadow-md"><NudgeMenteeButton enrollmentId={mentee.id} /><RepairEnrollmentProgressButton enrollmentId={mentee.id} /></div></details></div></td></tr>; }

function MobileCard({ mentee }: { mentee: MenteeRosterItem }) { return <article className="rounded-2xl border bg-card p-4"><div className="flex items-start justify-between gap-3"><Identity mentee={mentee} /><Badge variant="outline" className="capitalize">{mentee.status.toLowerCase().replaceAll("_", " ")}</Badge></div><div className="mt-4"><Progress mentee={mentee} /></div><div className="mt-4 grid grid-cols-2 gap-3 border-y py-3 text-xs"><div><p className="text-muted-foreground">Current chapter</p><p className="mt-1 line-clamp-2 font-medium">{mentee.currentChapter ?? "Not started"}</p></div><div><p className="text-muted-foreground">Last activity</p><p className="mt-1 font-medium">{mentee.lastActiveLabel}</p></div></div><div className="mt-3"><Attention mentee={mentee} /></div><div className="mt-4 flex flex-wrap items-center gap-2"><Link href={mentee.evaluationHref} className={cn(buttonVariants({ size: "sm" }), "gap-1")}>Evaluate learner <ArrowRight /></Link><NudgeMenteeButton enrollmentId={mentee.id} /></div></article>; }

function Identity({ mentee }: { mentee: MenteeRosterItem }) { return <div className="flex min-w-0 items-center gap-3"><Avatar size="lg"><AvatarImage src={mentee.image ?? undefined} alt="" /><AvatarFallback>{mentee.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0"><Link href={mentee.evaluationHref} className="block truncate text-sm font-semibold hover:underline">{mentee.name}</Link><p className="truncate text-xs text-muted-foreground">{mentee.email ?? "No email"}</p></div></div>; }

function Progress({ mentee }: { mentee: MenteeRosterItem }) { return <div><div className="flex items-center justify-between gap-2 text-xs"><span className="font-medium tabular-nums">{mentee.percentComplete}%</span><span className="text-muted-foreground">{mentee.chaptersCompleted}/{mentee.chapterCount} chapters</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, mentee.percentComplete))}%` }} /></div></div>; }

function Attention({ mentee }: { mentee: MenteeRosterItem }) { return mentee.attention.length ? <div className="flex flex-wrap gap-1">{mentee.attention.slice(0, 2).map((item) => <Badge key={item.kind} variant={item.kind === "help" ? "secondary" : "outline"}>{item.label}</Badge>)}</div> : <span className="text-xs text-muted-foreground">No action needed</span>; }

function Filter({ label, value, setValue, options }: { label: string; value: string; setValue: (value: string) => void; options: Array<[string, string]> }) { return <label><span className="sr-only">{label}</span><select aria-label={label} value={value} onChange={(event) => setValue(event.target.value)} className="h-9 w-full rounded-lg border bg-background px-3 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">{options.map(([option, name]) => <option key={option} value={option}>{name}</option>)}</select></label>; }
