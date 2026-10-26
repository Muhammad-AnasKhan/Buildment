"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import type {
  MascotEyes,
  MascotExpression,
  MascotFace,
  MascotMouth,
  MascotRig as MascotRigId,
} from "@/shared/engagement/mascots";

// Every mascot drawn from parts, so its face can change while it is on screen: it blinks, glances
// or goes "hmm" before settling (`opening`), winks once, and moves its mouth while it talks. Which
// parts to show comes from the registry (shared/engagement/mascots.ts); this file only knows how to
// draw them. Each character is a `Look` with its own silhouette, palette and details; eyes, mouth,
// arms and props are shared, so a pose reads the same on every character. Mount it with a fresh
// `key` per reaction. With `animate` off (reduced motion, still images) it draws the settled pose
// and nothing moves.

const BLUSH = "#f9a8d4";
const PAPER = "#ffffff";

const OPENING_MS = 900;
const BLINK_MS = 140;
const TALK_FRAME_MS = 110;

const EYE_X = [51, 69] as const;
const EYE_Y = 58;

type Look = {
  ink: string;
  accent: string;
  /** Arm colour, with an optional darker outline so light arms read on a light page. */
  arm: { color: string; outline?: string; width?: number };
  /** Moves the arms down and shrinks them toward the middle, for short arms on shoulders below a big head. */
  armPlace?: { drop: number; scale: number };
  /** "open": a big open smile (dark inside, coral tongue) instead of a line smile. */
  mouthStyle?: "open";
  /** Moves (`dy`) and resizes (`scale`) the mouth, for a face that sits higher or lower. */
  mouth?: { dy: number; scale: number };
  /** Light plate behind the face; omit when the body itself is light enough. */
  facePlate?: string;
  /** Bigger eyes with a second highlight. */
  glossy?: boolean;
  /** Large storybook eyes with a coloured iris, instead of dots. */
  iris?: string;
  /** Moves the eyes apart (`spread`) and up (`lift`), for a face with bigger eyes. */
  eyes?: { spread: number; lift: number };
  /** Radius of large round glossy eyes (no coloured iris). */
  bigEyes?: number;
  /** Where the cheeks sit (distance from the middle, height), and optionally their size and colour. */
  cheeks?: { spread: number; y: number; rx?: number; ry?: number; color?: string };
  /** A bird's beak in place of the mouth: closed for smiles, open to cheer or talk. */
  beak?: { fill: string; stroke: string };
  /** Open mouths show this tongue colour. */
  tongue?: string;
  /** Rosy cheeks in every pose. */
  blush?: boolean;
  /** Arms drawn over the body (for a body whose top would hide them). */
  armsInFront?: boolean;
  /** Gradients the parts below refer to. */
  defs?: ReactNode;
  /** Behind the arms and body: legs, a tail. */
  back?: ReactNode;
  /** The body itself. */
  shape: ReactNode;
  /** On top of the head; hidden under a graduation cap. */
  head?: ReactNode;
  /** Over the face: glasses. */
  front?: ReactNode;
};

/** Each look gets a function that turns a local gradient name into an id unique to this drawing. */
type LookFactory = (id: (name: string) => string) => Look;
const fill = (id: (name: string) => string, name: string) => `url(#${id(name)})`;

/** A star outline with `points` tips between radius `outer` and `inner`, first tip straight up. */
function starPath(cx: number, cy: number, outer: number, inner: number, points: number): string {
  const corners = Array.from({ length: points * 2 }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI) / points;
    const radius = index % 2 === 0 ? outer : inner;
    return `${(cx + radius * Math.cos(angle)).toFixed(1)} ${(cy + radius * Math.sin(angle)).toFixed(1)}`;
  });
  return `M${corners.join(" ")}Z`;
}

// Mossy's artwork is drawn on a 658×746 canvas; this places its hood top at y 3 and centre at x 60.
const MOSSY_ART = "translate(60 3) scale(0.175) translate(-329 -66)";
const MOSSY_HOOD =
  "M327 66C344 63 359 76 379 87L493 145C548 173 586 211 601 254C620 310 601 371 563 415C528 456 472 477 410 484L329 491L247 484C185 477 129 456 94 415C56 371 37 310 56 254C71 211 109 173 164 145L278 112C298 101 310 69 327 66Z";

// Zip's sun-star: seven soft points around a round face.
const STAR = starPath(60, 61, 41, 31, 7);
const TWINKLE = (x: number, y: number, size: number) =>
  `M${x} ${y - size}q${size * 0.2} ${size * 0.8} ${size} ${size}q${-size * 0.8} ${size * 0.2} ${-size} ${size}q${-size * 0.2} ${-size * 0.8} ${-size} ${-size}q${size * 0.8} ${-size * 0.2} ${size} ${-size}z`;
// Pip's cloud: overlapping puffs on a soft base.
const CLOUD = (
  <>
    <circle cx={42} cy={56} r={17} />
    <circle cx={62} cy={45} r={21} />
    <circle cx={81} cy={57} r={16} />
    <circle cx={33} cy={79} r={15} />
    <circle cx={87} cy={79} r={15} />
    <rect x={26} y={58} width={68} height={48} rx={22} />
  </>
);

const LOOKS: Record<MascotRigId, LookFactory> = {
  // Bimo, the guide: a friendly indigo robot with an antenna.
  bimo: () => ({
    ink: "#1e1b4b",
    accent: "#f59e0b",
    arm: { color: "#6366f1" },
    facePlate: "#eef2ff",
    shape: <rect x={29} y={30} width={62} height={76} rx={30} fill="#6366f1" />,
    head: (
      <>
        <line x1={60} y1={31} x2={60} y2={19} stroke="#6366f1" strokeWidth={4} strokeLinecap="round" />
        <circle cx={60} cy={16} r={5} fill="#f59e0b" />
      </>
    ),
  }),

  // Zip, the celebrator: a glossy golden sun-star with big shining eyes, chubby arms and little legs.
  zip: (id) => ({
    ink: "#5b2a0c",
    accent: "#fbbf24",
    arm: { color: "#fde047", outline: "#eab308", width: 11 },
    armsInFront: true,
    iris: "#d97706",
    eyes: { spread: 3, lift: 3 },
    tongue: "#fb7185",
    blush: true,
    defs: (
      <>
        <radialGradient id={id("body")} cx="45%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="35%" stopColor="#fef08a" />
          <stop offset="80%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#facc15" />
        </radialGradient>
        <radialGradient id={id("face")} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#fffef5" stopOpacity={0.95} />
          <stop offset="75%" stopColor="#fffbeb" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#fffbeb" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={id("leg")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#facc15" />
        </linearGradient>
      </>
    ),
    back: (
      <g stroke="#eab308" strokeWidth={1.5} fill={fill(id, "leg")}>
        <rect x={40} y={92} width={16} height={20} rx={8} transform="rotate(12 48 102)" />
        <rect x={64} y={92} width={16} height={20} rx={8} transform="rotate(-12 72 102)" />
      </g>
    ),
    shape: (
      <>
        <path d={STAR} fill="#f59e0b" stroke="#f59e0b" strokeWidth={15} strokeLinejoin="round" />
        <path d={STAR} fill={fill(id, "body")} stroke={fill(id, "body")} strokeWidth={12} strokeLinejoin="round" />
        <circle cx={60} cy={62} r={28} fill={fill(id, "face")} />
        <path d="M38 38q8-12 22-15" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.75} />
        <g fill="#fff">
          <path d={TWINKLE(30, 52, 2.8)} opacity={0.9} />
          <path d={TWINKLE(84, 31, 2.4)} opacity={0.85} />
          <path d={TWINKLE(90, 76, 2)} opacity={0.8} />
          <path d={TWINKLE(60, 89, 2)} opacity={0.75} />
          <circle cx={41} cy={82} r={1.2} opacity={0.8} />
          <circle cx={77} cy={42} r={1} opacity={0.8} />
        </g>
      </>
    ),
    front: (
      <path d="M41 43q6-4 11-1.5M68 41.5q5-2.5 11 1.5" fill="none" stroke="#d97706" strokeWidth={2} strokeLinecap="round" />
    ),
  }),

  // Pip, the helper: a soft thinking cloud in mint, with round glasses.
  pip: (id) => ({
    ink: "#134e4a",
    accent: "#f59e0b",
    arm: { color: "#2dd4bf", outline: "#0f766e" },
    facePlate: "#f0fdfa",
    glossy: true,
    defs: (
      <linearGradient id={id("body")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#99f6e4" />
        <stop offset="100%" stopColor="#14b8a6" />
      </linearGradient>
    ),
    shape: (
      <>
        {/* Outlined underneath, filled on top, so only the cloud's outer edge shows a line. */}
        <g fill="#0f766e" stroke="#0f766e" strokeWidth={3}>
          {CLOUD}
        </g>
        <g fill={fill(id, "body")}>{CLOUD}</g>
        <ellipse cx={55} cy={33} rx={9} ry={4} transform="rotate(-12 55 33)" fill="#fff" opacity={0.6} />
      </>
    ),
    front: (
      <g fill="none" stroke="#134e4a" strokeWidth={1.8} opacity={0.9}>
        <circle cx={EYE_X[0]} cy={EYE_Y} r={7.5} />
        <circle cx={EYE_X[1]} cy={EYE_Y} r={7.5} />
        <path d="M58.5 57.5q1.5-1.5 3 0" />
      </g>
    ),
  }),

  // Mossy, the supporter: a gentle helper in a soft green bud-shaped hood and a white short-sleeved
  // coat, with a big round face, rosy cheeks and a wide open smile. The body is the supplied artwork
  // (drawn on a 658×746 canvas), scaled into this frame by MOSSY_ART; the face and arms stay live.
  mossy: (id) => ({
    ink: "#0b1012",
    accent: "#f59e0b",
    arm: { color: "#54b85f", outline: "#269b39", width: 13 },
    armPlace: { drop: 15, scale: 0.7 },
    armsInFront: true,
    bigEyes: 3.4,
    eyes: { spread: 4.1, lift: 7.4 },
    cheeks: { spread: 18.5, y: 56.2, rx: 7.9, ry: 7.5, color: fill(id, "cheek") },
    mouthStyle: "open",
    mouth: { dy: -11, scale: 1 },
    tongue: "#e66d83",
    blush: true,
    defs: (
      <>
        <radialGradient id={id("hood")} cx="38%" cy="25%" r="80%">
          <stop stopColor="#8bd18b" />
          <stop offset=".42" stopColor="#54b85f" />
          <stop offset=".78" stopColor="#32a744" />
          <stop offset="1" stopColor="#168b32" />
        </radialGradient>
        <radialGradient id={id("face")} cx="48%" cy="32%" r="78%">
          <stop stopColor="#fffefb" />
          <stop offset=".72" stopColor="#f8f7f4" />
          <stop offset="1" stopColor="#e9e8e5" />
        </radialGradient>
        <linearGradient id={id("coat")} x1="0" y1="0" x2="1" y2=".2">
          <stop stopColor="#fdfdfb" />
          <stop offset=".55" stopColor="#f4f5f2" />
          <stop offset="1" stopColor="#e7eae6" />
        </linearGradient>
        <radialGradient id={id("cheek")} cx="40%" cy="35%" r="70%">
          <stop stopColor="#ffc6cb" stopOpacity=".88" />
          <stop offset="1" stopColor="#f5a4b1" stopOpacity=".52" />
        </radialGradient>
        <filter id={id("soft")} x="-25%" y="-25%" width="150%" height="160%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </>
    ),
    back: (
      <g transform={MOSSY_ART}>
        <path d="M235 625C230 649 231 673 242 688C251 701 278 705 296 696C310 689 313 664 310 636Z" fill={fill(id, "hood")} />
        <path d="M348 636C345 664 348 689 362 696C380 705 407 701 416 688C427 673 428 649 423 625Z" fill={fill(id, "hood")} />
      </g>
    ),
    shape: (
      <g transform={MOSSY_ART}>
        <path d={MOSSY_HOOD} fill="#168f32" opacity={0.2} filter={`url(#${id("soft")})`} transform="translate(0 5)" />
        <path d={MOSSY_HOOD} fill={fill(id, "hood")} stroke="#5fbe6a" strokeWidth={2} />
        <path
          d="M328 79C344 76 357 88 376 98L486 153C536 178 572 214 586 256C603 306 586 361 551 402C518 440 466 459 407 466L329 473L251 466C192 459 140 440 107 402C72 361 55 306 72 256C86 214 122 178 172 153L282 120C301 109 312 82 328 79Z"
          fill="none"
          stroke="#a1e29b"
          strokeOpacity={0.25}
          strokeWidth={4}
        />
        <path
          d="M328 199C392 198 463 209 500 247C529 277 531 322 514 357C492 402 444 429 383 438C347 443 311 443 275 438C214 429 166 402 144 357C127 322 129 277 158 247C195 209 264 198 328 199Z"
          fill={fill(id, "face")}
          stroke="#e5e5e1"
          strokeWidth={2}
        />
        {/* Neck and collar */}
        <path d="M297 463L359 463L347 493L329 507L310 493Z" fill="#168f32" />
        <path d="M253 472L286 464L316 489L294 507L265 490Z" fill="#f5f7f4" stroke="#e1e5df" strokeWidth={2} />
        <path d="M405 472L372 464L342 489L364 507L393 490Z" fill="#f5f7f4" stroke="#e1e5df" strokeWidth={2} />
        {/* White short-sleeved coat */}
        <path
          d="M267 476L302 487L329 510L356 487L391 476C421 490 441 512 452 541L438 576L427 637C425 651 414 658 399 659L259 659C244 658 233 651 231 637L220 576L206 541C217 512 237 490 267 476Z"
          fill={fill(id, "coat")}
          stroke="#e2e5df"
          strokeWidth={2}
        />
        <path d="M267 477C247 482 229 500 216 521L205 548C218 560 234 563 248 554L269 513Z" fill="#f9faf7" />
        <path d="M391 477C411 482 429 500 442 521L453 548C440 560 424 563 410 554L389 513Z" fill="#f9faf7" />
        <path d="M267 478L287 470L315 490L294 509L266 491Z" fill="#f5f6f2" stroke="#e4e7e2" strokeWidth={1.5} />
        <path d="M391 478L371 470L343 490L364 509L392 491Z" fill="#f5f6f2" stroke="#e4e7e2" strokeWidth={1.5} />
        {/* Centre seam, pocket badge and hem */}
        <path d="M329 510L329 651" fill="none" stroke="#e0e4df" strokeWidth={2} />
        <path d="M363 523L405 523Q409 523 409 528L409 534Q409 538 405 538L363 538Q359 538 359 534L359 528Q359 523 363 523Z" fill="#42ad58" />
        <path d="M365 525L403 525" stroke="#81d18a" strokeWidth={2} strokeLinecap="round" opacity={0.75} />
        <path d="M235 635C276 644 382 644 423 635" fill="none" stroke="#e1e4df" strokeWidth={2} />
        {/* Highlights */}
        <path d="M90 264C106 217 142 184 186 163" fill="none" stroke="#b2e9a9" strokeOpacity={0.38} strokeWidth={5} strokeLinecap="round" />
        <path d="M569 266C580 303 573 341 555 369" fill="none" stroke="#147e2c" strokeOpacity={0.22} strokeWidth={5} strokeLinecap="round" />
        <ellipse cx={279} cy={218} rx={76} ry={9} fill="#fff" opacity={0.12} transform="rotate(-8 279 218)" />
      </g>
    ),
    front: (
      <g transform={MOSSY_ART}>
        <circle cx={328} cy={343} r={6.5} fill="#4bb45b" />
        <circle cx={326} cy={341} r={2} fill="#a7e6a0" opacity={0.8} />
      </g>
    ),
  }),

  // Dot, the messenger: a round little bluebird with a topknot curl, a soft belly, wing-hands and a
  // tiny beak that opens when Dot cheers or talks.
  dot: (id) => ({
    ink: "#0c2a43",
    accent: "#fb7185",
    arm: { color: "#38bdf8", outline: "#0369a1", width: 12 },
    armsInFront: true,
    bigEyes: 6,
    eyes: { spread: 5, lift: -4 },
    cheeks: { spread: 23, y: 72 },
    beak: { fill: "#fb923c", stroke: "#c2410c" },
    blush: true,
    defs: (
      <>
        <radialGradient id={id("body")} cx="40%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="45%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </radialGradient>
        <linearGradient id={id("belly")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id={id("feather")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </>
    ),
    back: (
      <path
        d="M28 92c-10 2-17-2-20-8 6 0 11-1 15-4z"
        fill={fill(id, "feather")}
        stroke="#0369a1"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    ),
    shape: (
      <>
        <g fill="#fdba74" stroke="#ea580c" strokeWidth={1.2}>
          <ellipse cx={50} cy={106} rx={6} ry={3.5} />
          <ellipse cx={70} cy={106} rx={6} ry={3.5} />
        </g>
        <path
          d="M60 24c25 0 38 20 38 44 0 23-16 38-38 38S22 91 22 68c0-24 13-44 38-44z"
          fill={fill(id, "body")}
          stroke="#0369a1"
          strokeWidth={2}
        />
        <ellipse cx={60} cy={84} rx={24} ry={18} fill={fill(id, "belly")} />
        <ellipse cx={45} cy={38} rx={10} ry={5} transform="rotate(-28 45 38)" fill="#fff" opacity={0.7} />
      </>
    ),
    head: (
      <path
        d="M58 25c-3-9 1-16 9-16-3 4-2 8 1 10-3 0-6 2-7 6z"
        fill={fill(id, "feather")}
        stroke="#0369a1"
        strokeWidth={1.3}
        strokeLinejoin="round"
      />
    ),
  }),
};

function Eye({
  x,
  y,
  shape,
  closed,
  ink,
  glossy,
  iris,
  big,
}: {
  x: number;
  y: number;
  shape: MascotEyes;
  closed: boolean;
  ink: string;
  glossy?: boolean;
  iris?: string;
  big?: number;
}) {
  const half = iris || big ? 5.5 : 4;
  const width = iris || big ? 2.8 : 2.5;
  if (closed) return <path d={`M${x - half} ${y}h${half * 2}`} stroke={ink} strokeWidth={width} strokeLinecap="round" />;
  if (shape === "happy") {
    return (
      <path
        d={`M${x - half} ${y + 1}q${half} ${-half * 1.25} ${half * 2} 0`}
        fill="none"
        stroke={ink}
        strokeWidth={width}
        strokeLinecap="round"
      />
    );
  }
  if (iris) {
    // Storybook eye: a tall dark eye with a warm iris glowing from below, two catch-lights and a lash.
    const r = shape === "wide" ? 6.8 : 6.2;
    const dy = shape === "look-up" ? -1.8 : shape === "look-down" ? 1.8 : 0;
    const dx = shape === "look-down" ? 0.8 : 0;
    const side = x < 60 ? -1 : 1;
    return (
      <g>
        <ellipse cx={x} cy={y} rx={r} ry={r * 1.18} fill={ink} />
        <ellipse cx={x + dx} cy={y + dy + r * 0.32} rx={r * 0.72} ry={r * 0.66} fill={iris} />
        <circle cx={x + dx} cy={y + dy + r * 0.12} r={r * 0.36} fill={ink} />
        <circle cx={x + dx + r * 0.32} cy={y + dy - r * 0.42} r={r * 0.4} fill="#fff" />
        <circle cx={x + dx - r * 0.38} cy={y + dy + r * 0.55} r={r * 0.15} fill="#fff" opacity={0.9} />
        <path d={`M${x + side * r * 0.82} ${y - r * 0.82}l${side * 2.4} -2`} stroke={ink} strokeWidth={1.5} strokeLinecap="round" />
      </g>
    );
  }
  if (big) {
    // Big glossy eye: tall and dark, one large catch-light up high and a small one below.
    const r = shape === "wide" ? big * 1.1 : big;
    const dy = shape === "look-up" ? -1.5 : shape === "look-down" ? 1.5 : 0;
    const dx = shape === "look-down" ? 0.8 : 0;
    return (
      <g>
        <ellipse cx={x} cy={y} rx={r} ry={r * 1.17} fill={ink} />
        <circle cx={x + dx + r * 0.36} cy={y + dy - r * 0.46} r={r * 0.4} fill="#fff" />
        <circle cx={x + dx - r * 0.33} cy={y + dy + r * 0.5} r={r * 0.17} fill="#fff" opacity={0.9} />
      </g>
    );
  }
  const r = (shape === "wide" ? 4.5 : 3.5) + (glossy ? 0.6 : 0);
  const dx = shape === "look-down" ? 1.5 : 0;
  const dy = shape === "look-up" ? -3 : shape === "look-down" ? 3 : 0;
  return (
    <g>
      <circle cx={x + dx} cy={y + dy} r={r} fill={ink} />
      <circle cx={x + dx + 1.2} cy={y + dy - 1.3} r={shape === "wide" ? 1.5 : 1.1} fill="#fff" />
      {glossy ? <circle cx={x + dx - 1.3} cy={y + dy + 1.5} r={0.6} fill="#fff" opacity={0.8} /> : null}
    </g>
  );
}

/** A small beak for bird mascots, set just under the eyes: open while cheering or talking. */
function Beak({ shape, talking, beak, ink }: { shape: MascotMouth; talking: boolean; beak: NonNullable<Look["beak"]>; ink: string }) {
  const open = talking ? shape !== "hmm" : shape === "grin" || shape === "yay" || shape === "ooh";
  if (!open) {
    return (
      <g transform={shape === "hmm" ? "rotate(-8 60 71)" : undefined}>
        <path
          d="M54.5 69c3.5-2.4 7.5-2.4 11 0-2 4.2-3.7 6-5.5 6s-3.5-1.8-5.5-6z"
          fill={beak.fill}
          stroke={beak.stroke}
          strokeWidth={1.1}
          strokeLinejoin="round"
        />
        <path d="M55.5 70.2h9" stroke={beak.stroke} strokeWidth={0.9} strokeLinecap="round" />
      </g>
    );
  }
  const gape = shape === "ooh" && !talking ? 2.4 : 3.2;
  return (
    <g>
      <ellipse cx={60} cy={71 + gape / 2} rx={4.2} ry={gape} fill={ink} />
      <ellipse cx={60} cy={72.4 + gape / 2} rx={2.3} ry={gape * 0.45} fill="#fb7185" />
      <path d="M54.5 68.5c3.5-2.4 7.5-2.4 11 0-1.6 1.9-3.6 2.8-5.5 2.8s-3.9-.9-5.5-2.8z" fill={beak.fill} stroke={beak.stroke} strokeWidth={1.1} strokeLinejoin="round" />
      <path
        d={`M56 ${71.5 + gape}c2.6 1 5.4 1 8 0-1 2.8-2.4 4.2-4 4.2s-3-1.4-4-4.2z`}
        fill={beak.fill}
        stroke={beak.stroke}
        strokeWidth={1.1}
        strokeLinejoin="round"
      />
    </g>
  );
}

/** A big open smile with a dark inside and a coral tongue; its size follows the mood. */
function OpenMouth({ shape, talking, ink, tongue }: { shape: MascotMouth; talking: boolean; ink: string; tongue: string }) {
  if (shape === "hmm" && !talking) {
    return <path d="M55 69.5q5-1.5 10 0" fill="none" stroke={ink} strokeWidth={2.4} strokeLinecap="round" />;
  }
  if (shape === "ooh" || talking) {
    return (
      <>
        <ellipse cx={60} cy={69} rx={talking ? 5 : 3.6} ry={talking ? 4.2 : 3.8} fill="#3b1d1d" />
        <ellipse cx={60} cy={71.2} rx={talking ? 3 : 2.2} ry={1.4} fill={tongue} />
      </>
    );
  }
  // Wider for a cheer, a little smaller for a gentle smile.
  const half = shape === "grin" || shape === "yay" || shape === "beam" ? 8 : 6.5;
  const depth = half * 1.15;
  return (
    <>
      <path d={`M${60 - half} 65.5h${half * 2}q0 ${depth} -${half} ${depth}q-${half} 0 -${half} -${depth}z`} fill="#3b1d1d" />
      <path
        d={`M${60 - half * 0.6} ${65.5 + depth * 0.82}q${half * 0.6} -${depth * 0.45} ${half * 1.2} 0q-${half * 0.6} ${depth * 0.28} -${half * 1.2} 0z`}
        fill={tongue}
      />
    </>
  );
}

function Mouth({ shape, talking, ink, tongue }: { shape: MascotMouth; talking: boolean; ink: string; tongue?: string }) {
  if (talking && shape !== "hmm") {
    return (
      <>
        <ellipse cx={60} cy={68} rx={4} ry={3.2} fill={ink} />
        {tongue ? <ellipse cx={60} cy={69.6} rx={2.4} ry={1.3} fill={tongue} /> : null}
      </>
    );
  }
  switch (shape) {
    case "grin":
      return (
        <>
          <path d="M50 65q10 12 20 0z" fill={ink} />
          {tongue ? <path d="M54.5 69.6q5.5-3.2 11 0q-5.5 2.6-11 0z" fill={tongue} /> : null}
        </>
      );
    case "beam":
      return <path d="M49 66q11 10 22 0" fill="none" stroke={ink} strokeWidth={2.5} strokeLinecap="round" />;
    case "yay":
      return (
        <>
          <path d="M50 64q10 15 20 0z" fill={ink} />
          <path d="M55 70.5q5 3.5 10 0q-5-2.5-10 0z" fill={tongue ?? BLUSH} />
        </>
      );
    case "hmm":
      return <path d="M56 69.5l9-1.5" fill="none" stroke={ink} strokeWidth={2.5} strokeLinecap="round" />;
    case "ooh":
      return <circle cx={60} cy={68} r={2.8} fill={ink} />;
    default:
      return <path d="M52 67q8 7 16 0" fill="none" stroke={ink} strokeWidth={2.5} strokeLinecap="round" />;
  }
}

function Arms({ pose, arm: style }: { pose: MascotExpression["arms"]; arm: Look["arm"] }) {
  const stroke = (d: string, width: number) => (
    <>
      {style.outline ? <path d={d} fill="none" stroke={style.outline} strokeWidth={width + 2.5} strokeLinecap="round" /> : null}
      <path d={d} fill="none" stroke={style.color} strokeWidth={width} strokeLinecap="round" />
    </>
  );
  const arm = (d: string) => stroke(d, style.width ?? 7);
  const leftDown = arm("M31 72q-10 8-8 18");
  switch (pose) {
    case "up":
      return (
        <>
          {arm("M32 60q-14-10-12-26")}
          {arm("M88 60q14-10 12-26")}
        </>
      );
    case "wave":
      return (
        <>
          {leftDown}
          <g className="mascot-part-wave">{arm("M88 62q14-8 14-24")}</g>
        </>
      );
    case "thumbs":
      return (
        <>
          {leftDown}
          {arm("M89 74q12-2 14-14")}
          {stroke("M100 56v-8q0-3 3-3t3 3v7", (style.width ?? 7) - 2)}
        </>
      );
    case "point":
      return (
        <>
          {leftDown}
          {arm("M89 66q14-6 16-20")}
        </>
      );
    case "stretch":
      return (
        <g className="mascot-part-stretch">
          {arm("M32 58q-16-4-21-21")}
          {arm("M88 58q16-4 21-21")}
        </g>
      );
    case "hold":
      return (
        <>
          {leftDown}
          {arm("M89 74q11 1 13-11")}
        </>
      );
    default:
      return (
        <>
          {leftDown}
          {arm("M89 72q10 8 8 18")}
        </>
      );
  }
}

const CONFETTI = [
  { x: 14, y: 30, w: 5, h: 3, r: 20, color: "#f43f5e", delay: 0 },
  { x: 24, y: 14, w: 4, h: 4, r: 45, color: "#22c55e", delay: 90 },
  { x: 38, y: 8, w: 5, h: 3, r: -15, color: "#3b82f6", delay: 160 },
  { x: 82, y: 8, w: 5, h: 3, r: 30, color: "#a855f7", delay: 60 },
  { x: 96, y: 16, w: 4, h: 4, r: 10, color: "#f59e0b", delay: 140 },
  { x: 106, y: 32, w: 5, h: 3, r: -30, color: "#22c55e", delay: 220 },
  { x: 8, y: 50, w: 4, h: 3, r: 60, color: "#3b82f6", delay: 260 },
  { x: 110, y: 52, w: 4, h: 3, r: -50, color: "#f43f5e", delay: 200 },
];

function Prop({ prop, look }: { prop: MascotExpression["prop"]; look: Look }) {
  switch (prop) {
    case "sparkles":
      return (
        <>
          <path className="mascot-part-twinkle" d="M16 22l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill={look.accent} />
          <path className="mascot-part-twinkle" d="M102 18l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill={look.accent} />
        </>
      );
    case "confetti":
      return (
        <>
          {CONFETTI.map((piece, index) => (
            <rect
              key={index}
              className="mascot-part-confetti"
              style={{ animationDelay: `${piece.delay}ms` }}
              x={piece.x}
              y={piece.y}
              width={piece.w}
              height={piece.h}
              rx={1}
              fill={piece.color}
              transform={`rotate(${piece.r} ${piece.x + piece.w / 2} ${piece.y + piece.h / 2})`}
            />
          ))}
        </>
      );
    case "cap":
      return (
        <>
          <path d="M34 26l26-11 26 11-26 11z" fill={look.ink} />
          <path d="M46 31v8q14 6 28 0v-8" fill={look.ink} />
          <path d="M86 26v14" stroke="#f59e0b" strokeWidth={2.5} />
          <circle cx={86} cy={42} r={3} fill="#f59e0b" />
        </>
      );
    case "bulb":
      return (
        <g className="mascot-part-glow">
          <circle cx={104} cy={26} r={9} fill="#f59e0b" />
          <rect x={100} y={34} width={8} height={5} rx={1.5} fill={look.ink} opacity={0.6} />
        </g>
      );
    case "letter":
      return (
        <g transform="rotate(-10 104 58)">
          <rect x={93} y={50} width={23} height={16} rx={2} fill={PAPER} stroke={look.ink} strokeWidth={1.5} />
          <path d="M93.5 51l11 8.5 11-8.5" fill="none" stroke={look.ink} strokeWidth={1.5} strokeLinejoin="round" />
          <circle cx={104.5} cy={60} r={2.2} fill="#f43f5e" />
        </g>
      );
    case "tea":
      return (
        <g>
          <g fill="none" stroke={look.ink} strokeWidth={1.4} strokeLinecap="round" opacity={0.45}>
            <path className="mascot-part-steam" d="M98 94q-2-3 0-6t0-6" />
            <path className="mascot-part-steam" d="M104 94q-2-3 0-6t0-6" style={{ animationDelay: "400ms" }} />
          </g>
          <path d="M93 97h16v6a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z" fill={PAPER} stroke={look.ink} strokeWidth={1.5} />
          <path d="M109 99q5 0 5 3.5t-5 3.5" fill="none" stroke={look.ink} strokeWidth={1.5} />
          <path d="M95 99h12" stroke="#a16207" strokeWidth={2} opacity={0.6} />
        </g>
      );
    default:
      return null;
  }
}

export function MascotRig({
  character,
  expression,
  talking,
  animate,
  label,
  className,
}: {
  character: MascotRigId;
  expression: MascotExpression;
  talking: boolean;
  animate: boolean;
  label: string;
  className?: string;
}) {
  // Gradient ids must be unique per drawing and safe inside url(#…).
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const look = LOOKS[character]((name) => `mascot-${uid}-${name}`);
  const [settled, setSettled] = useState(() => !animate || !expression.opening);
  const [blinking, setBlinking] = useState(false);
  const [winking, setWinking] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);

  // Opening beat (glance up / "hmm"), then the pose itself.
  useEffect(() => {
    if (settled) return;
    const timer = window.setTimeout(() => setSettled(true), OPENING_MS);
    return () => window.clearTimeout(timer);
  }, [settled]);

  // Blink at a natural, irregular pace.
  useEffect(() => {
    if (!animate) return;
    let timer: number;
    const schedule = () => {
      timer = window.setTimeout(() => {
        setBlinking(true);
        timer = window.setTimeout(() => {
          setBlinking(false);
          schedule();
        }, BLINK_MS);
      }, 2200 + Math.random() * 2800);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [animate]);

  // One wink shortly after settling.
  useEffect(() => {
    if (!animate || !settled || !expression.wink) return;
    const start = window.setTimeout(() => setWinking(true), 500);
    const end = window.setTimeout(() => setWinking(false), 800);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(end);
    };
  }, [animate, settled, expression.wink]);

  // Mouth flaps while the line is being "said".
  useEffect(() => {
    if (!animate || !talking) return;
    const timer = window.setInterval(() => setMouthOpen((open) => !open), TALK_FRAME_MS);
    return () => window.clearInterval(timer);
  }, [animate, talking]);

  const face: MascotFace = settled ? expression : { ...expression, ...expression.opening };
  const capped = expression.prop === "cap";
  const arms = look.armPlace ? (
    <g transform={`translate(60 ${72 + look.armPlace.drop}) scale(${look.armPlace.scale}) translate(-60 -72)`}>
      <Arms pose={expression.arms} arm={look.arm} />
    </g>
  ) : (
    <Arms pose={expression.arms} arm={look.arm} />
  );
  const spread = look.eyes?.spread ?? 0;
  const eyeY = EYE_Y - (look.eyes?.lift ?? 0);
  const cheeks = look.cheeks;

  return (
    <svg viewBox="0 0 120 120" role="img" aria-label={label} className={className}>
      {look.defs ? <defs>{look.defs}</defs> : null}
      <ellipse cx={60} cy={113} rx={30} ry={4.5} fill={look.ink} opacity={0.12} />
      {look.back}
      {look.armsInFront ? null : arms}
      {look.shape}
      {look.armsInFront ? arms : null}
      {capped ? null : look.head}
      {look.facePlate ? <ellipse cx={60} cy={62} rx={23} ry={19} fill={look.facePlate} /> : null}
      {face.brows === "kind" ? (
        <path d="M46 51l9-2M65 49l9 2" stroke={look.ink} strokeWidth={2} strokeLinecap="round" opacity={0.85} />
      ) : null}
      <Eye
        x={EYE_X[0] - spread}
        y={eyeY}
        shape={face.eyes}
        closed={blinking}
        ink={look.ink}
        glossy={look.glossy}
        iris={look.iris}
        big={look.bigEyes}
      />
      <Eye
        x={EYE_X[1] + spread}
        y={eyeY}
        shape={winking ? "happy" : face.eyes}
        closed={blinking && !winking}
        ink={look.ink}
        glossy={look.glossy}
        iris={look.iris}
        big={look.bigEyes}
      />
      {look.front}
      {face.blush || look.blush ? (
        cheeks ? (
          <>
            {[-1, 1].map((side) => (
              <ellipse
                key={side}
                cx={60 + side * cheeks.spread}
                cy={cheeks.y}
                rx={cheeks.rx ?? 5}
                ry={cheeks.ry ?? 3}
                fill={cheeks.color ?? BLUSH}
                opacity={0.85}
              />
            ))}
          </>
        ) : (
          <>
            <circle cx={44} cy={66} r={3.5} fill={BLUSH} opacity={0.8} />
            <circle cx={76} cy={66} r={3.5} fill={BLUSH} opacity={0.8} />
          </>
        )
      ) : null}
      <g transform={look.mouth ? `translate(60 ${69 + look.mouth.dy}) scale(${look.mouth.scale}) translate(-60 -69)` : undefined}>
        {look.beak ? (
          <Beak shape={face.mouth} talking={talking && mouthOpen && animate} beak={look.beak} ink={look.ink} />
        ) : look.mouthStyle === "open" ? (
          <OpenMouth shape={face.mouth} talking={talking && mouthOpen && animate} ink={look.ink} tongue={look.tongue ?? "#f28b82"} />
        ) : (
          <Mouth shape={face.mouth} talking={talking && mouthOpen && animate} ink={look.ink} tongue={look.tongue} />
        )}
      </g>
      <Prop prop={expression.prop} look={look} />
    </svg>
  );
}
