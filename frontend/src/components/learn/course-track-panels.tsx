import Link from "next/link";
import { Check, ClipboardList, Mail, MessageSquare, MessagesSquare, Smartphone, type LucideIcon } from "lucide-react";
import type { CourseTrack, CourseVariant, VariantChannel } from "@/shared/lib/course-tracks";
import { findCourseFamily, resolveVariant, specialisationsFor } from "@/shared/lib/course-tracks";
import { chooseCourseSpecialisationAction } from "@/server/actions/course-track";
import { buttonVariants } from "@/components/ui/button";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { cn } from "@/lib/utils";

// Course home panels for a course in a family: the learner's variant, and the
// specialisation choice that opens once the course is complete.

/** Small dot in the variant's accent. Must sit inside a VariantThemeScope to take its colour. */
export function VariantDot({ className }: { className?: string }) {
  return <span aria-hidden className={cn("inline-block size-2.5 shrink-0 rounded-full bg-primary", className)} />;
}

const CHANNEL_ICONS: Array<[RegExp, LucideIcon]> = [
  [/team/i, MessagesSquare],
  [/chat/i, MessageSquare],
  [/mail/i, Mail],
  [/form/i, ClipboardList],
  [/messag|sms|phone/i, Smartphone],
];

function channelIcon(label: string): LucideIcon {
  return CHANNEL_ICONS.find(([pattern]) => pattern.test(label))?.[1] ?? MessageSquare;
}

/** Channel chips for a variant card. A suggested extra channel gets a dashed outline and says "optional" in words. */
export function VariantChannels({ channels }: { channels: VariantChannel[] }) {
  return (
    <ul aria-label="Channels" className="flex flex-wrap gap-1.5">
      {channels.map((channel) => {
        const Icon = channelIcon(channel.label);
        return (
          <li
            key={channel.label}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs leading-5 font-medium",
              channel.optional ? "border-dashed border-border text-muted-foreground" : "border-border bg-muted text-foreground"
            )}
          >
            <Icon aria-hidden className="size-3.5 shrink-0" />
            <span>
              {channel.label}
              {channel.optional ? <span className="font-normal">, optional</span> : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** What a variant card says about the product: summary, channels and the hard problem. Must sit inside a VariantThemeScope. */
export function VariantDetails({ variant }: { variant: CourseVariant }) {
  return (
    <div className="space-y-3">
      <p className="text-sm leading-6">{variant.summary}</p>
      {variant.channels?.length ? <VariantChannels channels={variant.channels} /> : null}
      <div className="rounded-lg border border-border bg-secondary px-3 py-2">
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">Hard problem</p>
        <p className="mt-0.5 text-sm leading-6">{variant.hardestConstraint}</p>
      </div>
    </div>
  );
}

export function VariantBanner({ courseSlug, track }: { courseSlug: string; track: CourseTrack }) {
  const family = track.family ?? findCourseFamily(track.familySlug);
  if (!family) return null;
  const variant = resolveVariant(family, track.variantSlug);
  // Finished learners keep whatever they built, including the default.
  const settled = track.variantChosen || track.variantLocked;
  const available = !track.availableVariantSlugs?.length || track.availableVariantSlugs.includes(variant.slug);
  const onlyOneAvailable = track.availableVariantSlugs?.length === 1;

  return (
    <section
      aria-label="Your variant"
      className="flex flex-col gap-3 rounded-xl border border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex items-baseline gap-2.5 text-sm leading-6">
        <VariantDot className="translate-y-px" />
        <span>
          {settled ? (
            <>
              You are building <strong className="font-semibold">{variant.productName}</strong>, the{" "}
              {variant.label.toLowerCase()} variant.
            </>
          ) : (
            <>
              Your starting product is <strong className="font-semibold">{variant.productName}</strong>.{" "}
              <span className="text-muted-foreground">{onlyOneAvailable ? "This is the product currently available." : "You can pick a different product to build."}</span>
            </>
          )}
        </span>
      </p>
      {!available && <p className="text-xs text-muted-foreground">This product&apos;s own lessons are still being prepared. Your earlier choice and work remain recorded.</p>}
      {track.variantLocked ? (
        <p className="text-xs text-muted-foreground">{track.variantAssigned ? "Assigned to you for this course" : "Variant fixed after starting a chapter"}</p>
      ) : (
        <Link
          href={`/courses/${courseSlug}/variant`}
          className={cn(buttonVariants({ variant: settled ? "outline" : "default", size: "sm" }), "shrink-0")}
        >
          {settled ? "Change" : onlyOneAvailable ? "Continue with this product" : "Choose a variant"}
        </Link>
      )}
    </section>
  );
}

export function SpecialisationPanel({ courseSlug, track }: { courseSlug: string; track: CourseTrack }) {
  const family = track.family ?? findCourseFamily(track.familySlug);
  if (!family) return null;
  if (family.specialisations.length === 0) return null;
  const variant = resolveVariant(family, track.variantSlug);
  const options = specialisationsFor(family, variant);

  if (!track.specialisationOpen) {
    return (
      <section id="specialisation" aria-labelledby="specialisation-heading" className="border-t border-border pt-6">
        <h2 id="specialisation-heading" className="text-base font-semibold">
          After the course
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          When you finish every chapter, you choose a specialisation to go deeper in. For {variant.productName} we suggest{" "}
          <span className="font-medium text-foreground">{options[0]!.label.toLowerCase()}</span>.
        </p>
      </section>
    );
  }

  return (
    <section id="specialisation" aria-labelledby="specialisation-heading" className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 id="specialisation-heading" className="text-lg font-semibold">
          {track.specialisationSlug ? "Your specialisation" : "Choose your specialisation"}
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          You finished {variant.productName}. Pick what to go deeper in next. Your mentor sees your choice, and you can
          change it here.
        </p>
      </div>
      <ul className="divide-y divide-border">
        {options.map((option) => {
          const chosen = track.specialisationSlug === option.slug;
          return (
            <li key={option.slug}>
              <form
                action={chooseCourseSpecialisationAction}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <input type="hidden" name="courseSlug" value={courseSlug} />
                <input type="hidden" name="specialisationSlug" value={option.slug} />
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold">
                    {option.label}
                    {option.recommended ? (
                      <span className="ml-2 font-normal text-muted-foreground">Suggested for {variant.productName}</span>
                    ) : null}
                  </h3>
                  <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{option.summary}</p>
                </div>
                {chosen ? (
                  <p className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary">
                    <Check className="size-4" aria-hidden /> Chosen
                  </p>
                ) : (
                  <PendingSubmitButton pendingLabel="Saving" size="sm" variant="outline" className="shrink-0 self-start sm:self-auto">
                    Choose<span className="sr-only"> {option.label}</span>
                  </PendingSubmitButton>
                )}
              </form>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
