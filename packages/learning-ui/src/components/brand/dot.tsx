// Dot, the Edorax mascot. Generated from the brand canvas; keep the shapes as they are.

export type DotMood = "happy" | "wave" | "think" | "determined" | "cheer" | "wink" | "oops" | "sleep" | "miss";

export function Dot({ mood, size }: { mood: DotMood; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`Dot, ${mood}`}>
      <DotParts mood={mood} />
    </svg>
  );
}

function DotParts({ mood }: { mood: DotMood }) {
  switch (mood) {
    case "happy":
      return (
        <>
          <path d="M17 58 L8 72 M83 58 L92 72" stroke="#FFC933" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="38" cy="92" r="6" fill="#2434E0" />
          <circle cx="62" cy="92" r="6" fill="#2434E0" />
          <circle cx="50" cy="56" r="34" fill="#FFC933" />
          <circle cx="40" cy="50" r="7" fill="#FFFFFF" />
          <circle cx="40.0" cy="50.0" r="3.5" fill="#0A0F2C" />
          <circle cx="60" cy="50" r="7" fill="#FFFFFF" />
          <circle cx="60.0" cy="50.0" r="3.5" fill="#0A0F2C" />
          <path d="M42 66 Q50 75 58 66" stroke="#0A0F2C" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </>
      );
    case "wave":
      return (
        <>
          <path d="M17 58 L8 72 M83 58 L92 34" stroke="#FFC933" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="38" cy="92" r="6" fill="#2434E0" />
          <circle cx="62" cy="92" r="6" fill="#2434E0" />
          <circle cx="50" cy="56" r="34" fill="#FFC933" />
          <circle cx="40" cy="50" r="7" fill="#FFFFFF" />
          <circle cx="40.0" cy="50.0" r="3.5" fill="#0A0F2C" />
          <circle cx="60" cy="50" r="7" fill="#FFFFFF" />
          <circle cx="60.0" cy="50.0" r="3.5" fill="#0A0F2C" />
          <path d="M42 66 Q50 75 58 66" stroke="#0A0F2C" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M93 22 L96 18" stroke="#0A0F2C" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M97 29 L100 28" stroke="#0A0F2C" strokeWidth="2.5" strokeLinecap="round" />
        </>
      );
    case "think":
      return (
        <>
          <path d="M17 58 L8 72 M83 58 L88 46" stroke="#FFC933" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="38" cy="92" r="6" fill="#2434E0" />
          <circle cx="62" cy="92" r="6" fill="#2434E0" />
          <circle cx="50" cy="56" r="34" fill="#FFC933" />
          <circle cx="40" cy="50" r="7" fill="#FFFFFF" />
          <circle cx="42" cy="47.5" r="3.5" fill="#0A0F2C" />
          <circle cx="60" cy="50" r="7" fill="#FFFFFF" />
          <circle cx="62" cy="47.5" r="3.5" fill="#0A0F2C" />
          <path d="M54 39 L66 36" stroke="#0A0F2C" strokeWidth="3" strokeLinecap="round" />
          <path d="M45 69 L55 69" stroke="#0A0F2C" strokeWidth="3.5" strokeLinecap="round" />
        </>
      );
    case "determined":
      return (
        <>
          <path d="M17 58 L8 46 M83 58 L92 46" stroke="#FFC933" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="7" cy="44" r="5.5" fill="#FFC933" />
          <circle cx="93" cy="44" r="5.5" fill="#FFC933" />
          <circle cx="38" cy="92" r="6" fill="#2434E0" />
          <circle cx="62" cy="92" r="6" fill="#2434E0" />
          <circle cx="50" cy="56" r="34" fill="#FFC933" />
          <circle cx="40" cy="50" r="7" fill="#FFFFFF" />
          <circle cx="40" cy="51" r="3.5" fill="#0A0F2C" />
          <circle cx="60" cy="50" r="7" fill="#FFFFFF" />
          <circle cx="60" cy="51" r="3.5" fill="#0A0F2C" />
          <path d="M32 39 L46 45" stroke="#0A0F2C" strokeWidth="3" strokeLinecap="round" />
          <path d="M68 39 L54 45" stroke="#0A0F2C" strokeWidth="3" strokeLinecap="round" />
          <path d="M43 68 Q50 72 57 67" stroke="#0A0F2C" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </>
      );
    case "cheer":
      return (
        <>
          <path d="M17 58 L6 36 M83 58 L94 36" stroke="#FFC933" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="38" cy="92" r="6" fill="#2434E0" />
          <circle cx="62" cy="92" r="6" fill="#2434E0" />
          <circle cx="50" cy="56" r="34" fill="#FFC933" />
          <path d="M34 52 Q40 43 46 52" stroke="#0A0F2C" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M54 52 Q60 43 66 52" stroke="#0A0F2C" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M41 64 Q50 82 59 64 Z" fill="#0A0F2C" />
          <circle cx="10" cy="22" r="3" fill="#2434E0" />
          <circle cx="90" cy="14" r="3.5" fill="#FFC933" />
          <rect x="84" y="36" width="6" height="6" fill="#2434E0" transform="rotate(25 87 39)" />
        </>
      );
    case "wink":
      return (
        <>
          <path d="M17 58 L8 72 M83 58 L92 72" stroke="#FFC933" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="38" cy="92" r="6" fill="#2434E0" />
          <circle cx="62" cy="92" r="6" fill="#2434E0" />
          <circle cx="50" cy="56" r="34" fill="#FFC933" />
          <circle cx="40" cy="50" r="7" fill="#FFFFFF" />
          <circle cx="40.0" cy="50.0" r="3.5" fill="#0A0F2C" />
          <path d="M54 52 Q60 43 66 52" stroke="#0A0F2C" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M40 64 Q50 78 60 64 Z" fill="#0A0F2C" />
        </>
      );
    case "oops":
      return (
        <>
          <path d="M17 58 L12 74 M83 58 L88 74" stroke="#FFC933" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="38" cy="92" r="6" fill="#2434E0" />
          <circle cx="62" cy="92" r="6" fill="#2434E0" />
          <circle cx="50" cy="56" r="34" fill="#FFC933" />
          <circle cx="40" cy="51" r="7" fill="#FFFFFF" />
          <circle cx="40" cy="53" r="3.5" fill="#0A0F2C" />
          <circle cx="60" cy="51" r="7" fill="#FFFFFF" />
          <circle cx="60" cy="53" r="3.5" fill="#0A0F2C" />
          <path d="M33 40 L45 43" stroke="#0A0F2C" strokeWidth="3" strokeLinecap="round" />
          <path d="M67 40 L55 43" stroke="#0A0F2C" strokeWidth="3" strokeLinecap="round" />
          <path d="M42 71 Q50 63 58 71" stroke="#0A0F2C" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M80 32 Q84 40 80 45 Q76 40 80 32 Z" fill="#2434E0" />
        </>
      );
    case "sleep":
      return (
        <>
          <path d="M17 58 L8 72 M83 58 L92 72" stroke="#FFC933" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="38" cy="92" r="6" fill="#2434E0" />
          <circle cx="62" cy="92" r="6" fill="#2434E0" />
          <circle cx="50" cy="56" r="34" fill="#FFC933" />
          <path d="M34 52 Q40 59 46 52" stroke="#0A0F2C" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M54 52 Q60 59 66 52" stroke="#0A0F2C" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <circle cx="50" cy="68" r="3" fill="#0A0F2C" />
          <text x="74" y="30" fontWeight="700" fontSize="15" fill="#2434E0" style={{ fontFamily: "var(--font-unbounded), sans-serif" }}>z</text>
          <text x="85" y="18" fontWeight="700" fontSize="10" fill="#2434E0" style={{ fontFamily: "var(--font-unbounded), sans-serif" }}>z</text>
        </>
      );
    case "miss":
      return (
        <>
          <path d="M17 58 L4 47 M83 58 L96 47" stroke="#FFC933" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="38" cy="92" r="6" fill="#2434E0" />
          <circle cx="62" cy="92" r="6" fill="#2434E0" />
          <circle cx="50" cy="56" r="34" fill="#FFC933" />
          <path d="M34 52 Q40 43 46 52" stroke="#0A0F2C" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M54 52 Q60 43 66 52" stroke="#0A0F2C" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M33 55 Q35.5 61 33 64 Q30.5 61 33 55 Z" fill="#2434E0" />
          <path d="M67 55 Q69.5 61 67 64 Q64.5 61 67 55 Z" fill="#2434E0" />
          <path d="M41 64 Q50 80 59 64 Z" fill="#0A0F2C" />
          <path d="M86 31 L79 24 A4 4 0 0 1 86 18 A4 4 0 0 1 93 24 Z" fill="#2434E0" />
        </>
      );
  }
}
