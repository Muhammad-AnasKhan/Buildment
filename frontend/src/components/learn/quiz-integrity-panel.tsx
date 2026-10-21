"use client";

import { useEffect, useRef } from "react";
import { Camera, CameraOff, Maximize, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuizIntegrity } from "@/lib/integrity/use-quiz-integrity";
import { INTEGRITY_LIMITS } from "@/shared/api/integrity";
import { cn } from "@/lib/utils";

// What the learner sees of quiz integrity: a "Proctored" badge with a count, short
// notices, a gentle full-screen banner and one dialog that says plainly what is
// noted and, when the course uses it, asks before the camera turns on.

const NOTED = [
  "Leaving this tab, window, or full screen",
  "Copy, paste, or right-click attempts (blocked), and screenshot keys (noticed when the browser reports them)",
  "Your pointer leaving the page, or a second screen when the browser reports it",
  "Answers submitted unusually quickly",
];

function IntegrityDialog({ integrity }: { integrity: QuizIntegrity }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { dialog, camera, session } = integrity;
  const open = dialog !== null && session !== null;
  const intro = dialog === "intro";

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  // With a required camera there is no way past the intro except turning it on.
  const closable = !(intro && camera.enabled);
  const close = () => {
    if (!closable) return;
    if (intro) integrity.begin();
    else integrity.closeInfo();
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="quiz-integrity-title"
      aria-describedby="quiz-integrity-description"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-background/70 open:flex open:items-center open:justify-center open:p-4"
    >
      {open ? (
        <div className="flex max-h-[min(44rem,calc(100dvh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-2xl">
          <div className="flex shrink-0 items-start justify-between gap-4 border-b px-5 py-4 sm:px-6 sm:py-5">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="size-4" aria-hidden />
                <p className="text-xs font-semibold uppercase tracking-wider">Proctored quiz</p>
              </div>
              <h2 id="quiz-integrity-title" className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                Your mentor can review this quiz
              </h2>
              <p id="quiz-integrity-description" className="mt-1 text-sm leading-6 text-muted-foreground">
                Activity notes do not change your score. Full screen is required when you submit.
              </p>
            </div>
            {closable ? (
              <button
                type="button"
                onClick={close}
                aria-label={intro ? "Start quiz" : "Close"}
                className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <X className="size-4" aria-hidden />
              </button>
            ) : null}
          </div>

          <div className="min-h-0 space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
            <section aria-labelledby="quiz-signals-title" className="rounded-xl border bg-muted/20 p-4">
              <h3 id="quiz-signals-title" className="text-sm font-semibold">What your mentor can see</h3>
              <ul className="mt-2 grid gap-1.5 pl-5 text-sm leading-5 text-foreground/85 marker:text-muted-foreground sm:grid-cols-2 sm:gap-x-7">
                {NOTED.map((item) => <li key={item} className="list-disc">{item}</li>)}
              </ul>
            </section>

            {camera.enabled ? (
              <section aria-labelledby="quiz-camera-title" className="rounded-xl border border-emerald-600/25 bg-emerald-500/5 p-4">
                <h3 id="quiz-camera-title" className="flex items-center gap-2 text-sm font-semibold">
                  <Camera className="size-4 text-emerald-700 dark:text-emerald-300" aria-hidden />
                  Camera photos are required for this course
                </h3>
                <p className="mt-1 text-sm leading-5 text-foreground/85">
                  Your camera must stay on during the quiz. Small still photos are taken about once a minute. There is no video or sound.
                </p>
                <dl className="mt-3 grid gap-x-5 gap-y-2 text-xs leading-5 sm:grid-cols-2">
                  <div><dt className="font-semibold">Photo</dt><dd className="text-muted-foreground">{INTEGRITY_LIMITS.snapshotWidth} × {INTEGRITY_LIMITS.snapshotHeight} pixels, about once a minute</dd></div>
                  <div><dt className="font-semibold">Who sees it</dt><dd className="text-muted-foreground">Course mentors and Buildment admins</dd></div>
                  <div><dt className="font-semibold">Automatic deletion</dt><dd className="text-muted-foreground">After {session?.camera.retentionDays ?? INTEGRITY_LIMITS.retentionDays} days; the activity report remains</dd></div>
                  <div><dt className="font-semibold">If the camera stops</dt><dd className="text-muted-foreground">The quiz pauses and keeps your answers until the camera is back on</dd></div>
                </dl>
              </section>
            ) : null}
          </div>

          <div className="shrink-0 border-t bg-card px-5 py-4 sm:px-6">
            {intro && camera.enabled ? <p className="mb-3 text-xs text-muted-foreground">Your camera will turn on when you start. If it stops, your quiz will pause and keep your answers.</p> : null}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {intro ? (
                camera.enabled ? (
                  <Button type="button" onClick={integrity.begin} className="h-10 gap-1.5 px-4">
                    <Camera className="size-4" aria-hidden />
                    Turn on camera and start
                  </Button>
                ) : (
                  <Button type="button" onClick={integrity.begin}>
                    Start quiz
                  </Button>
                )
              ) : (
                <>
                  {camera.enabled && camera.status !== "ON" ? (
                    <Button type="button" variant="outline" onClick={() => { void camera.start(); integrity.closeInfo(); }} className="gap-1.5">
                      <Camera className="size-4" aria-hidden />
                      Turn camera on
                    </Button>
                  ) : null}
                  <Button type="button" onClick={integrity.closeInfo}>
                    Back to the quiz
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}

const CAMERA_HELP: Record<string, string> = {
  denied: "Your browser blocked the camera. Allow camera access for this site (the camera icon in the address bar), then press Try again.",
  "no-camera": "We could not find a camera on this device. Connect one, or ask your mentor for help.",
  stopped: "Your camera stopped. Check that no other app is using it, then press Try again.",
  unsupported: "This browser cannot use a camera. Open the quiz in Chrome, Edge, Firefox or Safari.",
  error: "The camera did not start. Close other apps that use it, then press Try again.",
};

/** Covers the quiz while a required camera is off. Answers stay where they are underneath. */
export function QuizCameraGate({ integrity }: { integrity: QuizIntegrity }) {
  const { camera } = integrity;
  if (!camera.blocked || integrity.dialog === "intro") return null;
  return (
    <div className="absolute inset-0 z-10 flex items-start justify-center px-2 pt-10">
      <div role="alertdialog" aria-labelledby="quiz-camera-gate-title" aria-describedby="quiz-camera-gate-text" className="w-full max-w-md rounded-2xl border bg-card p-5 text-card-foreground shadow-lg">
        <div className="flex items-center gap-2">
          {camera.starting ? <Camera className="size-5 text-muted-foreground" aria-hidden /> : <CameraOff className="size-5 text-amber-600 dark:text-amber-300" aria-hidden />}
          <h2 id="quiz-camera-gate-title" className="text-base font-semibold">
            {camera.starting ? "Starting your camera…" : "Turn on your camera to continue"}
          </h2>
        </div>
        <p id="quiz-camera-gate-text" className="mt-2 text-sm leading-6 text-muted-foreground">
          {camera.starting
            ? "If your browser asks, choose Allow."
            : `This course needs the camera during quizzes, so the quiz is paused. Your answers are kept. ${camera.issue ? (CAMERA_HELP[camera.issue] ?? CAMERA_HELP.error) : ""}`}
        </p>
        {camera.starting ? null : (
          <Button type="button" className="mt-4 gap-1.5" onClick={() => void camera.start()}>
            <Camera className="size-4" aria-hidden />
            {camera.issue ? "Try camera again" : "Turn on camera"}
          </Button>
        )}
      </div>
    </div>
  );
}

/** Kept mounted so the stream survives re-renders; tiny and visible while on, so the learner always knows. */
function CameraPreview({ attach, visible }: { attach: (element: HTMLVideoElement | null) => void; visible: boolean }) {
  return (
    <video
      ref={attach}
      muted
      playsInline
      aria-hidden
      className={cn(
        "pointer-events-none fixed bottom-20 right-3 z-40 h-[54px] w-[72px] rounded-md border border-border bg-black object-cover shadow-sm sm:bottom-4",
        !visible && "hidden"
      )}
    />
  );
}

export function QuizIntegrityPanel({ integrity }: { integrity: QuizIntegrity }) {
  const { camera, notice } = integrity;
  const cameraOn = camera.status === "ON";

  return (
    <>
      <CameraPreview attach={camera.attachVideo} visible={cameraOn} />
      {integrity.active ? (
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={integrity.openInfo}
              aria-label={`Proctored quiz. ${integrity.flagCount} ${integrity.flagCount === 1 ? "note" : "notes"} for your mentor. Show what is noted.`}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-500/15 dark:text-emerald-200"
            >
              <ShieldCheck className="size-3.5" aria-hidden />
              Proctored
              <span className="rounded-full bg-emerald-700/15 px-1.5 font-mono tabular-nums dark:bg-emerald-300/15">{integrity.flagCount}</span>
            </button>
            {camera.enabled ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                {cameraOn ? <Camera className="size-3.5" aria-hidden /> : <CameraOff className="size-3.5" aria-hidden />}
                {cameraOn ? "Camera on" : "Camera off"}
              </span>
            ) : null}
          </div>

          <p role="status" aria-live="polite" className={cn("text-sm text-amber-800 dark:text-amber-200", !notice && "sr-only")}>
            {notice?.text ?? ""}
          </p>

          {integrity.requiresFullscreen && !integrity.isFullscreen && integrity.dialog !== "intro" ? (
            <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-400 bg-amber-50 px-4 py-3 text-amber-950 shadow-sm dark:border-amber-500/60 dark:bg-amber-500/20 dark:text-amber-50">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-500/15"><Maximize className="size-4" aria-hidden /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Full screen is required to submit</p>
                <p className="mt-0.5 text-xs leading-5 text-amber-900 dark:text-amber-100">Your answers stay saved. Return to full screen before submitting the quiz.</p>
              </div>
              {integrity.fullscreenSupported ? (
                <Button type="button" size="sm" onClick={integrity.returnToFullscreen} className="h-9 gap-1.5 bg-amber-950 px-3 text-white hover:bg-amber-900 dark:bg-amber-100 dark:text-amber-950 dark:hover:bg-white">
                  <Maximize className="size-3.5" aria-hidden />
                  Return to full screen
                </Button>
              ) : (
                <p className="w-full text-xs font-medium sm:w-auto">Use a browser that supports full screen.</p>
              )}
            </div>
          ) : null}

        </div>
      ) : null}
      <IntegrityDialog integrity={integrity} />
    </>
  );
}
