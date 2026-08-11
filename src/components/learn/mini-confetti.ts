/** Tiny burst of confetti — fires once when a checklist is fully completed. */
export function fireMiniConfetti(anchor: HTMLElement) {
  if (typeof window === "undefined") return;

  const rect = anchor.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height * 0.35;

  const colors = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#0ea5e9"];
  const container = document.createElement("div");
  container.setAttribute("aria-hidden", "true");
  container.style.cssText =
    "pointer-events:none;position:fixed;inset:0;z-index:9999;overflow:hidden;";
  document.body.appendChild(container);

  const particleCount = 22;

  for (let i = 0; i < particleCount; i++) {
    const el = document.createElement("span");
    const size = 4 + Math.random() * 4;
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.4;
    const velocity = 48 + Math.random() * 56;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity - 40;
    const color = colors[i % colors.length]!;
    const rotate = Math.random() * 360;

    el.style.cssText = [
      "position:absolute",
      `left:${originX}px`,
      `top:${originY}px`,
      `width:${size}px`,
      `height:${size}px`,
      `background:${color}`,
      "border-radius:1px",
      "opacity:0.95",
      "transform:translate(-50%,-50%)",
      "animation:buildment-confetti 720ms cubic-bezier(0.22,1,0.36,1) forwards",
      `--dx:${dx}px`,
      `--dy:${dy}px`,
      `--rot:${rotate}deg`,
    ].join(";");

    container.appendChild(el);
  }

  window.setTimeout(() => container.remove(), 800);
}
