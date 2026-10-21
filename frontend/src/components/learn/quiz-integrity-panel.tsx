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
  "When you leave this tab or window",
  "When you leave full screen",
  "Copy, paste and right-click (they are turned off)",
  "Screenshot keys (we can see them, but we cannot stop them)",
  "When your mouse leaves the page",
  "A second screen, if your browser tells us",
  "Answers sent much faster than reading time",
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
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-background/70 open:flex open:items-center open:justify-center open:p-4"
    >
      {open ? (
        <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card p-5 text-card-foreground shadow-xl sm:p-6">
          {closable ? (
            <button
              type="button"
              onClick={close}
              aria-label={intro ? "Start quiz" : "Close"}
              className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : null}
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="size-5" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-wider">Proctored quiz</p>
          </div>
          <h2 id="quiz-integrity-title" className="mt-2 text-xl font-semibold tracking-tight">
            Your mentor sees a short report of this quiz
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Nothing here fails or ends your quiz. Your mentor reads the report and decides.
          </p>

          <h3 className="mt-4 text-sm font-semibold">What we note</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            {NOTED.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {integrity.fullscreenSupported ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">The quiz opens in full screen. Press Esc to leave it if you need to.</p>
          ) : null}

          {camera.enabled ? (
            <section aria-labelledby="quiz-camera-title" className="mt-4 rounded-xl border bg-muted/40 p-4">
              <h3 id="quiz-camera-title" className="flex items-center gap-2 text-sm font-semibold">
                <Camera className="size-4" aria-hidden />
                Camera photos: needed for this course
              </h3>
              <dl className="mt-2 grid gap-1.5 text-sm leading-6">
                <div>
                  <dt className="inline font-medium">What: </dt>
                  <dd className="inline text-muted-foreground">
                    a small still photo from your camera ({INTEGRITY_LIMITS.snapshotWidth} x {INTEGRITY_LIMITS.snapshotHeight}). No video. No sound.
                  </dd>
                </div>
                <div>
                  <dt className="inline font-medium">How often: </dt>
                  <dd className="inline text-muted-foreground">about once a minute while this quiz is open.</dd>
                </div>
                <div>
                  <dt className="inline font-medium">Who can see them: </dt>
                  <dd className="inline text-muted-foreground">only the mentors of this course and Buildment admins.</dd>
                </div>
                <div>
                  <dt className="inline font-medium">Deleted: </dt>
                  <dd className="inline text-muted-foreground">
                    automatically after {session?.camera.retentionDays ?? INTEGRITY_LIMITS.retentionDays} days. The report stays.
                  </dd>
                </div>
              </dl>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                If your camera stops, the quiz pauses until it is back on. Your answers are kept. No camera on this device? Ask your mentor before you start.
              </p>
            </section>
          ) : null}

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {intro ? (
              camera.enabled ? (
                <Button type="button" onClick={integrity.begin} className="gap-1.5">
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

          {integrity.fullscreenPrompt ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm">
              <span className="mr-auto">You left full screen.</span>
              <Button type="button" size="sm" onClick={integrity.returnToFullscreen} className="gap-1.5">
                <Maximize className="size-3.5" aria-hidden />
                Return to full screen
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={integrity.dismissFullscreenPrompt}>
                Not now
              </Button>
            </div>
          ) : null}

        </div>
      ) : null}
      <IntegrityDialog integrity={integrity} />
    </>
  );
}
