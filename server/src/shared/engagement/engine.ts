import type {
  EngagementEventType,
  EngagementPlatform,
  RecordedEngagementEvent,
  TrackEventRequest,
  TrackEventResult,
} from "../api/engagement.js";
import {
  resolveMascot,
  type MascotAsset,
  type MascotDefinition,
  type MascotRole,
  type MascotState,
  type PageArea,
} from "./mascots.js";
import { dotClipUrl } from "./dot-voice.js";
import { ENGAGEMENT_RULES, matchingRules, type EngagementRule, type MascotAction } from "./rules.js";

// The engagement engine. track(event) reports the event (the server verifies it and fills in the
// facts), picks the reaction the rules give, applies cooldowns, and hands the reaction to
// `present`. react(events) does the same for moments the client already holds verified data for
// (a live notification), without reporting them. No UI or platform code lives here: the web app and
// a mobile app plug in their own transport, storage and presenter.
//
// Neither method throws or needs awaiting. A tracking problem must not break the action that
// triggered it, so every failure goes to `onError` and the result is simply "no reaction".

export type EngagementTrackInput = { type: EngagementEventType; courseId?: string; chapterId?: string };

export type MascotReaction = {
  ruleId: string;
  mascotId: string;
  mascotName: string;
  /** Live renderer for this mascot, when it has one (see MascotDefinition.rig). */
  rig?: MascotDefinition["rig"];
  role: MascotRole;
  state: MascotState;
  asset: MascotAsset;
  message: string;
  /** App-relative URL of Dot's recorded clip of this line ("/brand/dot/voice/lesson-done.mp3"), when the rule has one. */
  voice?: string;
  /** XP the moment earned, shown beside the line; absent when XP is off or hidden. */
  xp?: number;
  /** A next step the learner may take from the bubble. */
  action?: MascotAction;
};

/** Small key/value store for cooldowns (localStorage on the web, AsyncStorage-backed on mobile). */
export type EngagementStore = {
  get(key: string): string | null;
  set(key: string, value: string): void;
};

export type EngagementEngineOptions = {
  platform: EngagementPlatform;
  transport: (request: TrackEventRequest) => Promise<TrackEventResult>;
  present: (reaction: MascotReaction) => void;
  storage?: EngagementStore;
  now?: () => number;
  /** Picks among a rule's lines; injectable so tests are deterministic. */
  random?: () => number;
  /** True while the learner is reading; ambient reactions wait for another page. */
  isReading?: () => boolean;
  /** The part of the app the learner is in, so MASCOT_AREA_MAP can cast for it. */
  area?: () => PageArea | null;
  onError?: (error: unknown) => void;
  rules?: readonly EngagementRule[];
  registry?: Record<string, MascotDefinition>;
  roleMap?: Record<MascotRole, string>;
  areaMap?: Partial<Record<PageArea, string>>;
  defaultMascotId?: string;
};

export type EngagementEngine = {
  track(input: EngagementTrackInput): Promise<MascotReaction | null>;
  react(events: readonly RecordedEngagementEvent[]): MascotReaction | null;
};

const COOLDOWN_PREFIX = "buildment:engagement:cooldown:";

export function memoryStore(): EngagementStore {
  const values = new Map<string, string>();
  return { get: (key) => values.get(key) ?? null, set: (key, value) => void values.set(key, value) };
}

export function createEngagementEngine(options: EngagementEngineOptions): EngagementEngine {
  const storage = options.storage ?? memoryStore();
  const now = options.now ?? (() => Date.now());
  const random = options.random ?? Math.random;
  const lastLine = new Map<string, number>();
  const report = (error: unknown) => {
    try {
      options.onError?.(error);
    } catch {
      // An error reporter that fails has nowhere left to report to.
    }
  };

  function coolingDown(rule: EngagementRule): boolean {
    if (!rule.cooldownMs) return false;
    const last = Number(storage.get(COOLDOWN_PREFIX + rule.id));
    return Number.isFinite(last) && last > 0 && now() - last < rule.cooldownMs;
  }

  function pickRule(rules: EngagementRule[]): EngagementRule | null {
    const reading = options.isReading?.() ?? false;
    return rules.find((rule) => !(rule.ambient && reading) && !coolingDown(rule)) ?? null;
  }

  /** The index of a random line from the rule, never the same one twice in a row. */
  function pickLine(rule: EngagementRule): number {
    const count = rule.messages.length;
    const previous = lastLine.get(rule.id);
    let index = Math.min(Math.floor(random() * count), count - 1);
    if (count > 1 && index === previous) index = (index + 1) % count;
    lastLine.set(rule.id, index);
    return index;
  }

  /** Picks, casts and presents the reaction to a batch of events, or returns null for none. */
  function respond(events: readonly RecordedEngagementEvent[], rewards?: TrackEventResult["rewards"]): MascotReaction | null {
    const rules = options.rules ?? ENGAGEMENT_RULES;
    const rule = pickRule(matchingRules(events, rules));
    if (!rule) return null;
    if (rule.cooldownMs) storage.set(COOLDOWN_PREFIX + rule.id, String(now()));

    const { mascot, state, asset } = resolveMascot(
      { role: rule.role, state: rule.state, mascot: rule.mascot, area: options.area?.() ?? null },
      {
        registry: options.registry,
        roleMap: options.roleMap,
        areaMap: options.areaMap,
        defaultMascotId: options.defaultMascotId,
      }
    );
    const event = events.find((candidate) => candidate.isNew && rule.matches(candidate));
    const action = event && rule.action?.(event);
    const line = pickLine(rule);
    const reaction: MascotReaction = {
      ruleId: rule.id,
      mascotId: mascot.id,
      mascotName: mascot.name,
      ...(mascot.rig ? { rig: mascot.rig } : {}),
      role: rule.role,
      state,
      asset,
      message: rule.messages[line]!,
      ...(rule.clip ? { voice: dotClipUrl(rule.clip) } : {}),
      ...(rewards?.xp ? { xp: rewards.xp } : {}),
      ...(action ? { action } : {}),
    };
    options.present(reaction);
    return reaction;
  }

  return {
    async track(input) {
      try {
        const result = await options.transport({ ...input, platform: options.platform });
        return respond(result.events, result.rewards);
      } catch (error) {
        report(error);
        return null;
      }
    },
    react(events) {
      try {
        return respond(events);
      } catch (error) {
        report(error);
        return null;
      }
    },
  };
}
