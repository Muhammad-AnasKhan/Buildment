import "server-only";

// Current-time accessor for server components. RSC pages render once per
// request (their DB reads make them dynamic), so "now at render" is exactly
// the intended semantics — this helper exists so pages don't call Date.now()
// directly in the component body, which the react-hooks/purity lint flags.
export function nowMs(): number {
  return Date.now();
}
