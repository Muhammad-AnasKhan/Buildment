// Step state for every step-through canvas: which step is lit, and whether
// Play is advancing on its own. Pure, so the rules are unit tested without a
// browser. Any manual move pauses Play, and Play stops on the last step.

export type StepperState = { active: number; playing: boolean };

export type StepperAction =
  | { type: "next" }
  | { type: "prev" }
  | { type: "go"; index: number }
  | { type: "first" }
  | { type: "last" }
  | { type: "togglePlay" }
  | { type: "tick" };

export const INITIAL_STEPPER: StepperState = { active: 0, playing: false };

function clamp(index: number, count: number): number {
  if (count <= 0) return 0;
  return Math.max(0, Math.min(count - 1, Math.trunc(index)));
}

export function stepperReducer(count: number) {
  const last = Math.max(count - 1, 0);
  return (state: StepperState, action: StepperAction): StepperState => {
    switch (action.type) {
      case "next":
        return { active: clamp(state.active + 1, count), playing: false };
      case "prev":
        return { active: clamp(state.active - 1, count), playing: false };
      case "go":
        return { active: clamp(action.index, count), playing: false };
      case "first":
        return { active: 0, playing: false };
      case "last":
        return { active: last, playing: false };
      case "togglePlay":
        if (state.playing) return { ...state, playing: false };
        // Play from the end starts over, so the button never does nothing.
        return { active: state.active >= last ? 0 : state.active, playing: count > 1 };
      case "tick": {
        if (!state.playing) return state;
        const active = clamp(state.active + 1, count);
        return { active, playing: active < last };
      }
    }
  };
}

/** Keys a step-through answers to while it has focus. */
export function stepperActionForKey(key: string): StepperAction | null {
  switch (key) {
    case "ArrowRight":
      return { type: "next" };
    case "ArrowLeft":
      return { type: "prev" };
    case "Home":
      return { type: "first" };
    case "End":
      return { type: "last" };
    default:
      return null;
  }
}
