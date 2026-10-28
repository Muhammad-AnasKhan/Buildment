"use client";

import { useState } from "react";

const OPTIONS = ["My cohort", "Just me vs last week", "Nothing"];

// The landing's leaderboard preference, shown as a working control.
export function ChoiceGroup() {
  const [picked, setPicked] = useState(1);
  return (
    <div role="group" aria-label="Leaderboard setting" style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {OPTIONS.map((label, i) => {
        const on = i === picked;
        return (
          <button
            key={label}
            type="button"
            aria-pressed={on}
            onClick={() => setPicked(i)}
            style={{
              minHeight: "44px", padding: "0 18px", fontSize: "15px", fontWeight: 700,
              background: on ? "#2434E0" : "#FFFFFF", color: on ? "#F6F7FB" : "#0A0F2C", border: `2px solid ${on ? "#2434E0" : "#DCE0F2"}`,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
