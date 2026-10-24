import { useEffect, useRef } from 'react';
import type { QuizIntegrity } from '@buildment/learning-ui/lib/integrity/use-quiz-integrity';

export function IntegrityNotice({ integrity }: { integrity: QuizIntegrity }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (integrity.dialog && !dialog.current?.open) dialog.current?.showModal();
    if (!integrity.dialog && dialog.current?.open) dialog.current.close();
  }, [integrity.dialog]);
  const intro = integrity.dialog === 'intro';
  function close() {
    if (intro) integrity.begin(false);
    else integrity.closeInfo();
  }
  return (
    <div className="my-5 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={integrity.openInfo}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-medium"
        >
          Quiz integrity · {integrity.flagCount} notes
        </button>
        <span className="text-xs text-muted-foreground">
          Notes are reviewed by your mentor; they do not change your score.
        </span>
      </div>
      {integrity.notice && (
        <p
          role="status"
          className="rounded-lg border border-border bg-muted p-3 text-sm"
        >
          {integrity.notice.text}
        </p>
      )}
      {integrity.fullscreenPrompt && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted p-3 text-sm">
          <span>Return to full screen when you’re ready.</span>
          <button className="underline" onClick={integrity.returnToFullscreen}>
            Full screen
          </button>
          <button
            className="underline"
            onClick={integrity.dismissFullscreenPrompt}
          >
            Not now
          </button>
        </div>
      )}
      {integrity.camera.status === 'ON' && (
        <div className="flex items-center gap-3">
          <video
            ref={integrity.camera.attachVideo}
            muted
            autoPlay
            playsInline
            className="w-32 rounded-lg"
          />
          <button
            onClick={integrity.camera.turnOff}
            className="text-sm underline"
          >
            Turn camera off
          </button>
        </div>
      )}
      {integrity.camera.issue && (
        <p role="status" className="text-sm text-muted-foreground">
          {integrity.camera.issue}
        </p>
      )}
      <dialog
        ref={dialog}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        className="m-auto w-[min(92vw,560px)] rounded-2xl border border-border bg-card p-7 text-foreground shadow-xl backdrop:bg-black/50"
      >
        <h2 className="text-2xl font-semibold">Before you start</h2>
        <p className="mt-3 leading-7">
          Your mentor can review window switches, leaving full screen,
          copy/paste attempts, screenshot keys, extra screens, and unusually
          fast answers. These signals are advisory; they never automatically
          fail or lock your quiz.
        </p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Copy, paste, and right-click are disabled within the quiz. Screenshot
          detection is best effort. You can leave full screen with Esc.
        </p>
        {integrity.camera.enabled && (
          <div className="mt-5 rounded-xl bg-muted p-4">
            <h3 className="font-semibold">Camera photos are your choice</h3>
            <p className="mt-2 text-sm leading-6">
              This course requests small 320 × 240 still photos about once a
              minute. No sound or video is recorded. Course mentors and admins
              can view them; photos are deleted after{' '}
              {integrity.session?.camera.retentionDays || 30} days. You can
              continue without a camera.
            </p>
          </div>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            onClick={close}
            className="rounded-lg border border-border px-4 py-2"
          >
            {intro
              ? integrity.camera.enabled
                ? 'Start without camera'
                : 'Start quiz'
              : 'Close'}
          </button>
          {integrity.camera.enabled && integrity.camera.status !== 'ON' && (
            <button
              onClick={() => {
                if (intro) integrity.begin(true);
                else {
                  void integrity.camera.start();
                  integrity.closeInfo();
                }
              }}
              className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
            >
              Turn on camera{intro ? ' and start' : ''}
            </button>
          )}
        </div>
      </dialog>
    </div>
  );
}
