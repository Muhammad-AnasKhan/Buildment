"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Volume2, VolumeX, X } from "lucide-react";
import type { MascotReaction } from "@/shared/engagement/engine";
import { useMascotReactions } from "@/lib/engagement/use-mascot";
import { requestAskHelp } from "@/lib/engagement/ask-help";
import { MascotRig } from "@/components/mascot/mascot-rig";

// The one place mascot reactions are drawn. Everything above it (rules, cooldowns, which mascot
// plays which role) lives in shared/engagement; swapping the drawing for a Rive animation later
// only touches this folder. The bubble is non-modal, never takes focus, and sits bottom-centre: the
// corners already hold toasts, the reader's focus dock, the quiz camera preview and sidebars.
//
// Mascots with a rig are drawn live (blinking, glancing, talking while their line types out
// and for as long as its voice clip plays);
// others show their still image. With reduced motion the pose and line simply appear.
//
// Reactions often land together with a modal (the chapter-complete <dialog> opens right after
// "Mark complete"). A modal <dialog> lives in the browser's top layer, above any z-index, so the
// bubble is a manual popover — also top layer — and is re-raised whenever a dialog opens after it.
// A centred modal would crowd a bottom bubble onto its backdrop, so while one is open the bubble
// moves to the top-centre. It stays up meanwhile; its 3.5 s only count once the modal closes.
// A modal <dialog> also makes everything outside it inert, top layer included, so while one is
// open the bubble is rendered inside it; otherwise its close and voice buttons could not be used.
//
// A reaction can offer one next step (ask a mentor, open a reply, continue a chapter). It stays a
// little longer so there is time to take it, and taking it closes the bubble.

const VISIBLE_MS = 3_500;
const VISIBLE_WITH_ACTION_MS = 8_000;
const TICK_MS = 250;
/** The line types out over at most this long, so short and long lines both feel spoken. */
const TYPE_MAX_MS = 1_100;
const TYPE_STEP_MS = 28;
const MODAL_SELECTOR = "dialog[open], [role='dialog'][aria-modal='true']";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/** Voice is on unless the learner mutes it with the speaker button on a voiced reaction. */
const VOICE_PREFERENCE_KEY = "buildment:mascot:voice";
const voiceListeners = new Set<() => void>();

function voiceEnabled(): boolean {
  try {
    return window.localStorage.getItem(VOICE_PREFERENCE_KEY) !== "off";
  } catch {
    return true;
  }
}

function setVoiceEnabled(on: boolean) {
  try {
    window.localStorage.setItem(VOICE_PREFERENCE_KEY, on ? "on" : "off");
  } catch {
    // Storage blocked: the choice lasts until the page reloads.
  }
  voiceListeners.forEach((listener) => listener());
}

function subscribeToVoicePreference(onChange: () => void) {
  voiceListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    voiceListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Starts a reaction's clip as the current one and reports while it is audible, so the mouth moves
 * with the sound. A missing file or a blocked autoplay just stays silent.
 */
function playClip(
  voice: string,
  current: RefObject<HTMLAudioElement | null>,
  onSpeaking: (speaking: boolean) => void
) {
  current.current?.pause();
  const audio = new Audio(`/mascots/voice/${voice.split("/").map(encodeURIComponent).join("/")}.mp3`);
  current.current = audio;
  const report = () => {
    if (current.current === audio) onSpeaking(!audio.paused && !audio.ended);
  };
  for (const type of ["playing", "pause", "ended", "error"]) audio.addEventListener(type, report);
  audio.play().catch(() => undefined);
}

function stopClip(current: RefObject<HTMLAudioElement | null>, onSpeaking: (speaking: boolean) => void) {
  current.current?.pause();
  current.current = null;
  onSpeaking(false);
}

function modalOpen(): boolean {
  return document.querySelector(MODAL_SELECTOR) !== null;
}

/** The open modal <dialog>, which makes the rest of the page inert, or null. */
function modalDialog(): HTMLDialogElement | null {
  try {
    return [...document.querySelectorAll<HTMLDialogElement>("dialog:modal")].at(-1) ?? null;
  } catch {
    // :modal unsupported: the bubble stays where it is and only its buttons are out of reach.
    return null;
  }
}

/** Top-centre while a modal holds the middle of the screen, bottom-centre otherwise. */
function place(element: HTMLElement) {
  element.dataset.placement = modalOpen() ? "top" : "bottom";
}

/** Shows the popover, or moves it back to the top of the top layer if it is already showing. */
function raise(element: HTMLElement) {
  if (typeof element.showPopover !== "function") return;
  try {
    if (element.matches(":popover-open")) element.hidePopover();
    element.showPopover();
  } catch {
    // Popover API unavailable or the element is detached: the fixed-position fallback still shows.
  }
}

function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToMotionPreference,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true
  );
}

const ACTION_BUTTON =
  "inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

const BUBBLE_BUTTON =
  "grid size-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** One reaction: the character and its speech bubble. Mounted fresh (keyed) for every reaction. */
function ReactionBubble({
  reaction,
  animate,
  speaking,
  voiceOn,
  onToggleVoice,
  onPause,
  onDismiss,
}: {
  reaction: MascotReaction;
  animate: boolean;
  /** The line's clip is playing; the mouth keeps moving until it ends. */
  speaking: boolean;
  voiceOn: boolean;
  onToggleVoice: () => void;
  onPause: (paused: boolean) => void;
  onDismiss: () => void;
}) {
  const line = reaction.message;
  const [typed, setTyped] = useState(() => (animate ? 0 : line.length));
  const typing = typed < line.length;
  const talking = typing || speaking;

  useEffect(() => {
    if (!typing) return;
    const step = Math.max(1, Math.ceil(line.length / (TYPE_MAX_MS / TYPE_STEP_MS)));
    const timer = window.setInterval(() => setTyped((count) => Math.min(line.length, count + step)), TYPE_STEP_MS);
    return () => window.clearInterval(timer);
  }, [typing, line.length]);

  const expression = reaction.asset.expression;
  const action = reaction.action;
  const motion = animate && expression?.motion && expression.motion !== "none" ? `mascot-motion-${expression.motion}` : "";

  return (
    <div
      className="mascot-enter pointer-events-auto flex max-w-[min(22rem,calc(100vw-2rem))] items-end gap-2"
      onMouseEnter={() => onPause(true)}
      onMouseLeave={() => onPause(false)}
      onFocus={() => onPause(true)}
      onBlur={() => onPause(false)}
    >
      <div className={`mascot-body size-16 shrink-0 drop-shadow-sm sm:size-18 ${motion}`}>
        {reaction.rig && expression ? (
          <MascotRig
            character={reaction.rig}
            expression={expression}
            talking={talking}
            animate={animate}
            label={reaction.asset.alt}
            className="size-full"
          />
        ) : (
          <Image src={reaction.asset.image} alt={reaction.asset.alt} width={72} height={72} unoptimized className="size-full" />
        )}
      </div>
      <div
        className={`relative mb-2 rounded-2xl rounded-bl-sm border bg-card py-2 pl-3 ${reaction.voice ? "pr-14" : "pr-8"} text-sm font-medium text-card-foreground shadow-lg`}
      >
        {/* The full line reserves the bubble's size so it does not grow while typing. */}
        <span aria-hidden className="grid">
          <span className="invisible [grid-area:1/1]">{line}</span>
          <span className="[grid-area:1/1]">{line.slice(0, typed)}</span>
        </span>
        {reaction.xp || action ? (
          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {reaction.xp ? (
              <span
                aria-hidden
                className={`inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold tabular-nums text-primary-foreground ${animate ? "mascot-enter" : ""}`}
              >
                +{reaction.xp} XP
              </span>
            ) : null}
            {action && "href" in action ? (
              <Link href={action.href} onClick={onDismiss} className={ACTION_BUTTON}>
                {action.label}
                <ArrowRight className="size-3" aria-hidden />
              </Link>
            ) : null}
            {action && "intent" in action ? (
              <button
                type="button"
                onClick={() => {
                  onDismiss();
                  requestAskHelp();
                }}
                className={ACTION_BUTTON}
              >
                {action.label}
                <ArrowRight className="size-3" aria-hidden />
              </button>
            ) : null}
          </span>
        ) : null}
        <div className="absolute right-1.5 top-1.5 flex">
          {reaction.voice ? (
            <button
              type="button"
              onClick={onToggleVoice}
              aria-label={`${reaction.mascotName}'s voice`}
              aria-pressed={voiceOn}
              className={BUBBLE_BUTTON}
            >
              {voiceOn ? <Volume2 className="size-3.5" aria-hidden /> : <VolumeX className="size-3.5" aria-hidden />}
            </button>
          ) : null}
          <button type="button" onClick={onDismiss} aria-label="Dismiss" className={BUBBLE_BUTTON}>
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

export function MascotPlayer() {
  const [shown, setShown] = useState<{ reaction: MascotReaction; seq: number } | null>(null);
  const [paused, setPaused] = useState(false);
  const [modalHost, setModalHost] = useState<HTMLDialogElement | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const speakingRef = useRef(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);
  const voiceOn = useSyncExternalStore(subscribeToVoicePreference, voiceEnabled, () => true);

  useMascotReactions((reaction, seq) => {
    setPaused(false);
    setShown({ reaction, seq });
  });

  // Count down only while nothing modal is open and the learner is not hovering the bubble.
  useEffect(() => {
    if (!shown || paused) return;
    const visibleMs = shown.reaction.action ? VISIBLE_WITH_ACTION_MS : VISIBLE_MS;
    let remaining = visibleMs;
    const timer = window.setInterval(() => {
      if (modalOpen()) {
        remaining = visibleMs;
        return;
      }
      // A calm voice can outlast the bubble's time; it never cuts the mascot off mid-sentence.
      if (speakingRef.current) return;
      remaining -= TICK_MS;
      if (remaining <= 0) setShown(null);
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [shown, paused]);

  // Keep the bubble in the top layer, above any dialog that opens while it is showing, and out of
  // the way of a modal as it opens or closes. Moving into or out of a modal remounts the layer, so
  // this runs again for the new element.
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || !shown) return;
    place(layer);
    raise(layer);
    setModalHost(modalDialog());
    const observer = new MutationObserver((mutations) => {
      place(layer);
      setModalHost(modalDialog());
      if (mutations.some((mutation) => mutation.target instanceof HTMLDialogElement && mutation.target.open)) {
        raise(layer);
      }
    });
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });
    return () => {
      observer.disconnect();
      try {
        if (layer.matches(":popover-open")) layer.hidePopover();
      } catch {
        // Already hidden.
      }
    };
  }, [shown, modalHost]);

  // Each reaction speaks once as it appears; it falls silent when the bubble goes.
  useEffect(() => {
    const voice = shown?.reaction.voice;
    if (voice && voiceEnabled()) playClip(voice, audioRef, setSpeaking);
    return () => stopClip(audioRef, setSpeaking);
  }, [shown]);

  /** Turning the voice on says the current line, so the learner hears what they chose. */
  function toggleVoice() {
    const on = !voiceEnabled();
    setVoiceEnabled(on);
    if (on && shown?.reaction.voice) playClip(shown.reaction.voice, audioRef, setSpeaking);
    else stopClip(audioRef, setSpeaking);
  }

  const reaction = shown?.reaction;

  const layer = (
    <div
      ref={layerRef}
      popover="manual"
      data-placement="bottom"
      className="pointer-events-none fixed inset-x-0 top-auto bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-45 m-0 flex h-auto w-full justify-center overflow-visible border-0 bg-transparent px-4 data-[placement=top]:bottom-auto data-[placement=top]:top-[max(1.5rem,env(safe-area-inset-top))] not-[&:popover-open]:hidden"
    >
      {shown ? (
        <ReactionBubble
          key={shown.seq}
          reaction={shown.reaction}
          animate={!reducedMotion}
          speaking={speaking}
          voiceOn={voiceOn}
          onToggleVoice={toggleVoice}
          onPause={setPaused}
          onDismiss={() => {
            setPaused(false);
            setShown(null);
          }}
        />
      ) : null}
    </div>
  );

  return (
    <>
      {/* Announced from outside the popover: a hidden popover is display:none and would not be read. */}
      <p aria-live="polite" className="sr-only">
        {reaction
          ? `${reaction.mascotName} says: ${reaction.message}${reaction.xp ? ` You earned ${reaction.xp} XP.` : ""}`
          : ""}
      </p>
      {shown && modalHost?.open ? createPortal(layer, modalHost) : layer}
    </>
  );
}
