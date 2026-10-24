import type { SceneFrame, TagState } from "./frame";
import type { Scene } from "./types";

// Where the strip, its tags and the actor boxes sit. Shared by SceneView and
// the tests, so a test that says "no two tags overlap" checks what is drawn.

export const BOX_W = 112;
/** The longest second line an actor box holds at 12px. */
export const MAX_SUB_CHARS = 15;
export const BOX_H = 60;
export const TAG_H = 24;
const PAD = 30;

export function stripX(scene: Scene) {
  const strip = scene.strip;
  const x0 = PAD;
  const x1 = scene.width - PAD;
  const span = strip ? strip.to - strip.from || 1 : 1;
  return { x0, x1, X: (v: number) => (strip ? x0 + ((v - strip.from) / span) * (x1 - x0) : x0) };
}

export function tagRowY(scene: Scene, row: 0 | 1): number {
  return scene.strip ? scene.strip.y - 62 + row * 30 : 0;
}

export type Box = { left: number; right: number; top: number; bottom: number; label: string };

export function tagBox(scene: Scene, tag: TagState): Box {
  const { x0, x1, X } = stripX(scene);
  const w = Math.max(78, tag.label.length * 7.6 + 16);
  const cx = Math.max(x0 + w / 2, Math.min(x1 - w / 2, X(tag.value)));
  const top = tagRowY(scene, tag.row);
  return { left: cx - w / 2, right: cx + w / 2, top, bottom: top + TAG_H, label: tag.label };
}

export function actorBox(actor: { x: number; y: number; label: string }): Box {
  return { left: actor.x - BOX_W / 2, right: actor.x + BOX_W / 2, top: actor.y - BOX_H / 2, bottom: actor.y + BOX_H / 2, label: actor.label };
}

const overlaps = (a: Box, b: Box) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

/** Text width of a wait label at 12px semibold. */
export const waitTextWidth = (label: string) => label.length * 7;

/** The pill behind a wait label: opaque, so no link line runs through the text. */
export function waitPillBox(actor: { x: number; y: number }, label: string): Box {
  const left = actor.x + BOX_W / 2 + 29;
  return { left, right: left + waitTextWidth(label) + 14, top: actor.y - 11, bottom: actor.y + 11, label };
}

/** The longest text an actor's wait ring ever shows, so its pill keeps one width while the count runs. */
export function longestWaitLabel(scene: Scene, actorId: string, fallback = ""): string {
  let best = fallback;
  for (const e of scene.events) {
    if (e.kind !== "wait" || e.actor !== actorId) continue;
    for (const text of [e.label.replace("{n}", (e.total ?? 0).toFixed(1)), e.doneLabel]) if (text.length > best.length) best = text;
  }
  return best;
}

/** The label beside a wait ring, which sits just right of its actor box. */
export function waitLabelBox(actor: { x: number; y: number }, label: string): Box {
  const left = actor.x + BOX_W / 2 + 34;
  return { left, right: left + waitTextWidth(label), top: actor.y - 8, bottom: actor.y + 6, label };
}

/** The chip that names a message while it travels: width from its text at 11.5px semibold. */
export const chipWidth = (label: string) => label.length * 6.6 + 16;
export const CHIP_H = 20;
/** Where a chip sits against its message, as the chip's top edge: above first, then below. */
const CHIP_TOPS = [-33, 13];

export function chipBox(packet: { x: number; y: number; label: string }, top: number): Box {
  const w = chipWidth(packet.label);
  return { left: packet.x - w / 2, right: packet.x + w / 2, top: packet.y + top, bottom: packet.y + top + CHIP_H, label: packet.label };
}

/** The verdict banner across the top of the picture (same width rule as VerdictBanner). */
export function bannerBox(scene: Scene, text: string): Box {
  const w = Math.min(scene.width - 16, text.length * 8.3 + 46);
  const left = (scene.width - w) / 2;
  return { left, right: left + w, top: 8, bottom: 38, label: text };
}

/** How visible a message's label chip is: it shows mid-trip only, so it never peeks out from behind a card. */
export const chipFade = (packet: { progress: number }) => Math.max(0, Math.min(1, (Math.min(packet.progress, 1 - packet.progress) - 0.12) / 0.1));

/**
 * The top edge (relative to its message) of each message's label chip, in
 * the order of frame.packets, or null where neither above nor below the
 * message is clear of every card, tag, wait pill, the verdict banner and the
 * chips already placed. A chip that cannot be placed clear is not drawn, so
 * no label ever sits under a card, a line of text or another label.
 */
export function chipTops(scene: Scene, frame: SceneFrame): (number | null)[] {
  const blockers: Box[] = [
    ...frame.actors.map(actorBox),
    ...frame.tags.map((t) => tagBox(scene, t)),
    ...frame.waits.flatMap((w) => {
      const actor = frame.actors.find((a) => a.id === w.actor);
      return actor ? [waitPillBox(actor, longestWaitLabel(scene, w.actor, w.label))] : [];
    }),
    ...(frame.verdict ? [bannerBox(scene, frame.verdict.text)] : []),
  ];
  return frame.packets.map((packet) => {
    for (const top of CHIP_TOPS) {
      const box = chipBox(packet, top);
      if (box.left < 0 || box.right > scene.width || box.top < 0 || box.bottom > scene.height) continue;
      if (blockers.some((b) => overlaps(b, box))) continue;
      // A chip that is on screen keeps its place from the next ones; a faded-out chip does not.
      if (chipFade(packet) > 0) blockers.push(box);
      return top;
    }
    return null;
  });
}

/** Pairs of tags, actor boxes or wait labels that would be drawn over each other in this frame. */
export function frameCollisions(scene: Scene, frame: SceneFrame): [string, string][] {
  const waitBoxes = frame.waits.flatMap((w) => {
    const actor = frame.actors.find((a) => a.id === w.actor);
    return actor ? [waitPillBox(actor, longestWaitLabel(scene, w.actor, w.label))] : [];
  });
  const boxes = [...frame.tags.map((t) => tagBox(scene, t)), ...frame.actors.map(actorBox), ...waitBoxes];
  const out: [string, string][] = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) if (overlaps(boxes[i], boxes[j])) out.push([boxes[i].label, boxes[j].label]);
  return out;
}

/** True when every actor box sits fully inside the picture. */
export function actorsInside(scene: Scene): boolean {
  return scene.actors.every((a) => {
    const b = actorBox(a);
    return b.left >= 0 && b.right <= scene.width && b.top >= 0 && b.bottom <= scene.height;
  });
}
