"use client";

import { useState } from "react";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { buildLagScene } from "../models/replica-lag-scene";
import { ROUTING_LABEL, type Routing } from "../models/replica-lag";
import { ScenePlayer } from "../renderers/scene/ScenePlayer";

const ORDER: Routing[] = ["any", "leader", "token"];

/** Beat 3 of 8.4: the same three refreshes under three routing rules. */
export function ReadRoutingCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const [routing, setRouting] = useState<Routing>("any");
  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint="Pick where Amna's reads go and watch the same three refreshes."
      controls={
        <div role="group" aria-label="Where do Amna's reads go?" className="flex flex-wrap gap-2">
          {ORDER.map((r) => (
            <BeatButton key={r} pressed={routing === r} onClick={() => setRouting(r)}>
              {ROUTING_LABEL[r]}
            </BeatButton>
          ))}
        </div>
      }
    >
      <ScenePlayer scene={buildLagScene(routing)} title={`${title}: ${ROUTING_LABEL[routing]}`} replayKey={routing} />
    </BeatFrame>
  );
}
