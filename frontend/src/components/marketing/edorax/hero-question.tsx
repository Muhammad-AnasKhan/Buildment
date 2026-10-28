"use client";

import { useState } from "react";
import { Dot } from "./dot";
import s from "./edorax-landing.module.css";

type Answer = { key: "A" | "B" | "C"; label: string; feedback: string };

const ANSWERS: Answer[] = [
  { key: "A", label: "Asks a name server where edorax.com lives", feedback: "Right. Your phone asks DNS for the address first. Chapter 3 shows you every step after that." },
  { key: "B", label: "Connects straight to the website", feedback: "Not quite. To connect, your phone first needs an address, and it only knows the name." },
  { key: "C", label: "Downloads the page from Google", feedback: "Not quite. Google is not involved here. Your phone first needs the address for the name." },
];

const HEADING = "var(--font-unbounded), sans-serif";

// The hero's sample question: answer it, see why, and Dot reacts. No account needed.
export function HeroQuestion() {
  const [picked, setPicked] = useState<Answer["key"] | null>(null);
  const answer = ANSWERS.find(a => a.key === picked);
  const right = picked === "A";

  return (
    <div style={{ flex: "1 1 460px", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: "540px", display: "flex", alignItems: "flex-end", gap: "4px", paddingLeft: "12px", boxSizing: "border-box" }}>
        <Dot mood={right ? "cheer" : "think"} size={132} />
        <div style={{ marginBottom: "26px", background: "#FFFFFF", border: "1px solid #DCE0F2", padding: "10px 14px", fontSize: "15px", lineHeight: 1.4, maxWidth: "260px" }}>
          {right ? "You got it." : "Take a guess. No account needed for this one."}
        </div>
      </div>
      <div style={{ width: "100%", maxWidth: "540px", background: "#FFFFFF", border: "1px solid #DCE0F2", boxSizing: "border-box", padding: "26px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <div>
          <div style={{ fontSize: "14px", color: "#46507A" }}>Computer networking, chapter 3</div>
          <h2 style={{ margin: "6px 0 0", fontFamily: HEADING, fontWeight: 700, fontSize: "22px", lineHeight: 1.3, letterSpacing: "-0.02em" }}>
            You type edorax.com and press Go. What does your phone do first?
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {ANSWERS.map(a => {
            const chosen = a.key === picked;
            return (
              <button
                key={a.key}
                type="button"
                className={s.answer}
                aria-pressed={chosen}
                onClick={() => setPicked(a.key)}
                style={{
                  minHeight: "54px", padding: "12px 16px", textAlign: "left", fontSize: "16px", display: "flex", gap: "14px", alignItems: "center", color: "#0A0F2C",
                  background: chosen ? (right ? "#E8EBFF" : "#F6F7FB") : "#FFFFFF",
                  border: `2px solid ${chosen ? (right ? "#2434E0" : "#0A0F2C") : "#DCE0F2"}`,
                }}
              >
                <span style={{ fontWeight: 700, color: "#2434E0" }}>{a.key}</span>
                {a.label}
              </button>
            );
          })}
        </div>
        <p role="status" aria-live="polite" style={{ margin: 0, fontSize: "16px", lineHeight: 1.5, minHeight: "24px", color: right ? "#0A0F2C" : "#46507A" }}>
          {answer?.feedback ?? ""}
        </p>
      </div>
    </div>
  );
}
