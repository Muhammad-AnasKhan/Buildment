"use client";

import { useState } from "react";
import { BeatButton, BeatFrame } from "../../primitives/beat-frame";
import { ScenePlayer } from "./ScenePlayer";
import type { Scene } from "./types";

export type SceneSpec = {
  kind: "scene";
  title: string;
  purpose: string;
  limits: string;
  /** One line under the picture, if the learner should do something. */
  hint?: string;
  scene: Scene;
};

/** A data-only beat canvas: the scene plays inside a BeatFrame with Replay. */
export function SceneCanvas({ spec }: { spec: SceneSpec }) {
  const [replay, setReplay] = useState(0);
  return (
    <BeatFrame
      label={spec.title}
      limits={spec.limits}
      hint={spec.hint}
      controls={<BeatButton onClick={() => setReplay((n) => n + 1)}>Replay</BeatButton>}
    >
      <ScenePlayer scene={spec.scene} title={spec.title} replayKey={replay} />
    </BeatFrame>
  );
}
