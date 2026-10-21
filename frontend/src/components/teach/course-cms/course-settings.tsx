"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpenCheck, ImageIcon, Upload, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCourseSettings } from "@/server/actions/modules";
import type { CourseSettingsView } from "@/shared/api/teach";
import { uploadCourseImage } from "@/lib/course-media-upload";
import { isSafeAssetUrl } from "@/shared/lib/asset-url";

export function CourseSettings({ course }: { course: CourseSettingsView }) {
  const router = useRouter();
  const [pricingType, setPricingType] = useState(course.pricingType);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [coverUrl, setCoverUrl] = useState(course.coverUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const coverPreviewUrl = isSafeAssetUrl(coverUrl.trim()) ? coverUrl.trim() : null;

  async function uploadCover(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    setSaved(false);
    try {
      setCoverUrl(await uploadCourseImage(course.id, "cover", file));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not upload the image. Please try again.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || uploading) return;
    if (coverUrl.trim() && !isSafeAssetUrl(coverUrl.trim())) {
      setError("Use a same-origin image path or HTTPS URL for the cover.");
      return;
    }
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const result = await updateCourseSettings({
        courseId: course.id,
        title: String(data.get("title") ?? ""),
        description: String(data.get("description") ?? ""),
        coverUrl: coverUrl.trim(),
        projectGoal: String(data.get("projectGoal") ?? ""),
        difficulty: String(data.get("difficulty") ?? ""),
        estimatedHours: String(data.get("estimatedHours") ?? ""),
        sequential: data.get("sequential") === "on",
        pricingType: String(data.get("pricingType") ?? "FREE"),
        priceDollars: String(data.get("priceDollars") ?? ""),
        currency: String(data.get("currency") ?? "USD"),
      });
      if (!result.ok) {
        setError(result.errors.join(" "));
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Could not save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(event) => void save(event)} className="space-y-6">
      <section id="course-details" aria-labelledby="course-details-title" className="scroll-mt-24 overflow-hidden rounded-2xl border bg-card">
        <SectionHeading icon={ImageIcon} title="Course details" description="The name, summary, and cover learners see in the catalog." id="course-details-title" />
        <div className="grid gap-7 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-5">
            <Field label="Course title" htmlFor="course-title">
              <Input id="course-title" name="title" defaultValue={course.title} minLength={3} maxLength={120} required className="h-10" />
            </Field>
            <Field label="Short description" htmlFor="course-description" hint="A quick explanation of what learners will build.">
              <Textarea id="course-description" name="description" defaultValue={course.description ?? ""} maxLength={500} rows={5} placeholder="What will learners build and understand?" />
            </Field>
            <Field label="Cover image" htmlFor="course-cover-file" hint="JPEG, PNG, WebP, GIF, or AVIF · up to 8 MB. Save settings after uploading to publish the new cover.">
              <div className="flex flex-wrap items-center gap-3">
                <input id="course-cover-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={(event) => void uploadCover(event)} className="sr-only" disabled={uploading} />
                <label htmlFor="course-cover-file" className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium hover:bg-muted focus-within:ring-2 focus-within:ring-ring/30">
                  <Upload className="size-4" aria-hidden />{uploading ? "Uploading…" : "Upload cover"}
                </label>
                {uploading && <span role="status" className="text-sm text-muted-foreground">Sending image to storage…</span>}
              </div>
            </Field>
            <Field label="Or use an image URL" htmlFor="course-cover-url">
              <Input id="course-cover-url" name="coverUrl" type="text" inputMode="url" value={coverUrl} onChange={(event) => { setCoverUrl(event.target.value); setSaved(false); }} maxLength={2048} placeholder="https://example.com/cover.jpg" className="h-10" />
            </Field>
          </div>
          <div className="min-w-0">
            <p className="mb-2 text-sm font-medium">Cover preview</p>
            <div className="overflow-hidden rounded-xl border bg-muted/30">
              {coverPreviewUrl ? (
                <Image unoptimized width={1600} height={900} src={coverPreviewUrl} alt={`Cover for ${course.title}`} className="aspect-video w-full object-cover" />
              ) : (
                <div className="flex aspect-video items-center justify-center text-muted-foreground"><ImageIcon className="size-8" aria-hidden /></div>
              )}
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">This is how the cover will look after you save.</p>
          </div>
        </div>
      </section>

      <section id="learning-rules" aria-labelledby="learning-rules-title" className="scroll-mt-24 overflow-hidden rounded-2xl border bg-card">
        <SectionHeading icon={BookOpenCheck} title="Learning experience" description="Set expectations and choose how learners move through chapters." id="learning-rules-title" />
        <div className="space-y-5 p-5 sm:p-6">
          <Field label="Project goal" htmlFor="course-goal" hint="One clear outcome learners can work toward.">
            <Input id="course-goal" name="projectGoal" defaultValue={course.projectGoal ?? ""} maxLength={240} placeholder="Ship a real multi-vendor marketplace" className="h-10" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Difficulty" htmlFor="course-difficulty">
              <select id="course-difficulty" name="difficulty" defaultValue={course.difficulty ?? ""} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30">
                <option value="">Not set</option><option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
              </select>
            </Field>
            <Field label="Estimated hours" htmlFor="course-hours">
              <Input id="course-hours" name="estimatedHours" type="number" min={1} max={1000} defaultValue={course.estimatedHours ?? ""} placeholder="12" className="h-10" />
            </Field>
          </div>
          <label className="flex items-start gap-3 rounded-xl border bg-muted/25 p-4">
            <input type="checkbox" name="sequential" defaultChecked={course.sequential} className="mt-1 size-4 accent-primary" />
            <span><span className="block text-sm font-medium">Require chapters in order</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Learners finish the previous chapter before opening the next one.</span></span>
          </label>
        </div>
      </section>

      <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-24 overflow-hidden rounded-2xl border bg-card">
        <SectionHeading icon={Wallet} title="Pricing" description="Choose how learners enroll in this course." id="pricing-title" />
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <Field label="Enrollment type" htmlFor="course-pricing">
            <select id="course-pricing" name="pricingType" value={pricingType} onChange={(event) => setPricingType(event.target.value as typeof pricingType)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30">
              <option value="FREE">Free</option><option value="PAID">Paid</option>
            </select>
          </Field>
          <div className="hidden sm:block" />
          <Field label="Price" htmlFor="course-price" hint={pricingType === "FREE" ? "Free courses do not need a price." : undefined}>
            <Input id="course-price" name="priceDollars" type="number" min={0} step={0.01} defaultValue={course.pricingType === "PAID" && course.priceCents > 0 ? (course.priceCents / 100).toFixed(2) : ""} disabled={pricingType === "FREE"} placeholder="49.00" className="h-10" />
          </Field>
          <Field label="Currency" htmlFor="course-currency">
            <Input id="course-currency" name="currency" defaultValue={course.currency} maxLength={3} placeholder="USD" className="h-10" />
          </Field>
          {pricingType === "PAID" && <p className="text-xs leading-5 text-muted-foreground sm:col-span-2">Payment collection depends on the course checkout configuration.</p>}
        </div>
      </section>

      <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div aria-live="polite">{error ? <p role="alert" className="text-sm text-destructive">{error}</p> : saved ? <p className="text-sm text-emerald-700 dark:text-emerald-400">Settings saved.</p> : <p className="text-sm text-muted-foreground">Changes appear in the catalog after you save.</p>}</div>
        <Button type="submit" size="lg" loading={saving} loadingLabel="Saving…" disabled={saving || uploading} className="w-full sm:w-auto">Save settings</Button>
      </div>
    </form>
  );
}

function SectionHeading({ icon: Icon, title, description, id }: { icon: typeof ImageIcon; title: string; description: string; id: string }) {
  return <div className="flex items-start gap-3 border-b bg-muted/15 px-5 py-4 sm:px-6"><span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground"><Icon className="size-4" aria-hidden /></span><div><h2 id={id} className="text-base font-semibold">{title}</h2><p className="mt-0.5 text-sm text-muted-foreground">{description}</p></div></div>;
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={htmlFor}>{label}</Label>{children}{hint && <p className="text-xs leading-5 text-muted-foreground">{hint}</p>}</div>;
}
