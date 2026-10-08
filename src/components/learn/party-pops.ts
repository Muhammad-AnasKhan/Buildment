"use client";

import { playFeedback, type FeedbackKind } from "@/lib/sound-feedback";

export type PartyPopOptions = {
  anchor?: HTMLElement | null;
  particleCount?: number;
  withSound?: boolean;
  soundEffect?: FeedbackKind;
  dualPoppers?: boolean;
};

const VIBRANT_CONFETTI_COLORS = [
  "#f43f5e", // Rose / Crimson
  "#ec4899", // Hot Pink
  "#8b5cf6", // Violet
  "#6366f1", // Indigo
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#eab308", // Golden Yellow
  "#f97316", // Bright Orange
  "#ffffff", // Shimmering White
];

interface Particle {
  type: "rectangle" | "ribbon" | "circle";
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  rotX: number;
  rotXSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  opacity: number;
  decay: number;
  // Ribbon-specific
  ribbonLength?: number;
  waveFreq?: number;
}

interface PopperCannon {
  x: number;
  y: number;
  targetY: number;
  angle: number; // in radians
  recoilAngle: number;
  speed: number;
  state: "rising" | "popping" | "falling" | "done";
  recoilTimer: number;
  alpha: number;
  side: "center" | "left" | "right";
}

let activeCanvas: HTMLCanvasElement | null = null;
let animationFrameId: number | null = null;

/**
 * High-performance, studio-grade Party Popper Cannon animation:
 * - The party popper rocket launches from the bottom of the screen up to the middle.
 * - At the middle, it POPS with a muzzle flash, plays the stored audio file (/sounds/correct.wav),
 *   and blasts an explosion of 3D fluttering confetti, curly spiral streamers, and sparkles!
 * - The party popper cone recoils, tilts, and drops back down under gravity.
 */
export function firePartyPops(options?: PartyPopOptions) {
  if (typeof window === "undefined") return;

  const {
    withSound = true,
    soundEffect = "success",
    particleCount = 240,
    dualPoppers = true,
  } = options ?? {};

  let feedbackPlayed = false;
  const playPopSound = () => {
    if (!withSound || feedbackPlayed) return;
    feedbackPlayed = true;
    playFeedback(soundEffect);
  };

  // Check prefers-reduced-motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    playPopSound();
    return;
  }

  // Cancel any ongoing animation and recreate canvas
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (activeCanvas && activeCanvas.parentNode) {
    activeCanvas.parentNode.removeChild(activeCanvas);
    activeCanvas = null;
  }

  const canvas = document.createElement("canvas");
  activeCanvas = canvas;
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "pointer-events:none;position:fixed;inset:0;width:100vw;height:100vh;z-index:999999;";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = window.innerWidth;
  let h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  const particles: Particle[] = [];
  const poppers: PopperCannon[] = [];

  const midY = h * 0.48;

  if (dualPoppers) {
    // Twin Party Poppers from bottom-left and bottom-right aiming upwards to mid-screen
    poppers.push({
      x: w * 0.32,
      y: h + 80,
      targetY: midY + 40,
      angle: -Math.PI * 0.38, // aiming up-right
      recoilAngle: -Math.PI * 0.38,
      speed: 28,
      state: "rising",
      recoilTimer: 0,
      alpha: 1,
      side: "left",
    });

    poppers.push({
      x: w * 0.68,
      y: h + 80,
      targetY: midY + 40,
      angle: -Math.PI * 0.62, // aiming up-left
      recoilAngle: -Math.PI * 0.62,
      speed: 28,
      state: "rising",
      recoilTimer: 0,
      alpha: 1,
      side: "right",
    });

    if (particleCount >= 360) {
      poppers.push({
        x: w * 0.5,
        y: h + 90,
        targetY: midY + 20,
        angle: -Math.PI * 0.5,
        recoilAngle: -Math.PI * 0.5,
        speed: 32,
        state: "rising",
        recoilTimer: 0,
        alpha: 1,
        side: "center",
      });
    }
  } else {
    // Central Party Popper shooting straight up from bottom to mid
    poppers.push({
      x: w * 0.5,
      y: h + 80,
      targetY: midY,
      angle: -Math.PI * 0.5, // aiming straight up
      recoilAngle: -Math.PI * 0.5,
      speed: 30,
      state: "rising",
      recoilTimer: 0,
      alpha: 1,
      side: "center",
    });
  }

  // Explosion flash pulses
  const flashes: Array<{ x: number; y: number; radius: number; maxRadius: number; alpha: number }> = [];

  function spawnConfettiExplosion(originX: number, originY: number, baseAngle: number) {
    playPopSound();

    flashes.push({
      x: originX,
      y: originY,
      radius: 10,
      maxRadius: 120,
      alpha: 0.95,
    });

    const count = Math.floor(particleCount / poppers.length);

    for (let i = 0; i < count; i++) {
      // 60% rectangles, 25% spiral curly ribbons, 15% stars/circles
      const rand = Math.random();
      const type: Particle["type"] = rand < 0.6 ? "rectangle" : rand < 0.85 ? "ribbon" : "circle";

      // Spread angle around cannon direction with wide celebratory spray
      const spread = (Math.random() - 0.5) * 1.6;
      const angle = baseAngle + spread;
      const speed = 14 + Math.random() * 32;

      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const color = VIBRANT_CONFETTI_COLORS[Math.floor(Math.random() * VIBRANT_CONFETTI_COLORS.length)]!;

      particles.push({
        type,
        x: originX,
        y: originY,
        vx,
        vy,
        width: type === "ribbon" ? 4 + Math.random() * 3 : 8 + Math.random() * 6,
        height: type === "ribbon" ? 22 + Math.random() * 20 : 12 + Math.random() * 8,
        color,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.25,
        rotX: Math.random() * Math.PI,
        rotXSpeed: 0.08 + Math.random() * 0.16,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.04 + Math.random() * 0.08,
        opacity: 1,
        decay: 0.003 + Math.random() * 0.003,
        ribbonLength: type === "ribbon" ? 30 + Math.random() * 25 : undefined,
        waveFreq: type === "ribbon" ? 0.2 + Math.random() * 0.15 : undefined,
      });
    }
  }

  // Draw stylized party popper cone with festive stripes
  function drawPopper(p: PopperCannon) {
    if (p.alpha <= 0.02) return;
    ctx!.save();
    ctx!.translate(p.x, p.y);
    ctx!.rotate(p.recoilAngle + Math.PI * 0.5); // align tip to angle
    ctx!.globalAlpha = p.alpha;

    const coneLength = 54;
    const coneTopWidth = 28;
    const coneBottomWidth = 8;

    // Body shadow
    ctx!.shadowColor = "rgba(0,0,0,0.25)";
    ctx!.shadowBlur = 12;
    ctx!.shadowOffsetY = 6;

    // Striped cone segments
    const stripes = ["#f59e0b", "#ec4899", "#10b981", "#6366f1", "#fbbf24"];
    const segmentCount = stripes.length;
    const segmentH = coneLength / segmentCount;

    for (let i = 0; i < segmentCount; i++) {
      const y1 = -coneLength * 0.5 + i * segmentH;
      const y2 = y1 + segmentH;
      const t1 = i / segmentCount;
      const t2 = (i + 1) / segmentCount;
      const w1 = coneTopWidth * (1 - t1) + coneBottomWidth * t1;
      const w2 = coneTopWidth * (1 - t2) + coneBottomWidth * t2;

      ctx!.fillStyle = stripes[i % stripes.length]!;
      ctx!.beginPath();
      ctx!.moveTo(-w1 * 0.5, y1);
      ctx!.lineTo(w1 * 0.5, y1);
      ctx!.lineTo(w2 * 0.5, y2);
      ctx!.lineTo(-w2 * 0.5, y2);
      ctx!.closePath();
      ctx!.fill();
    }

    // Top rim mouth
    ctx!.fillStyle = "#fbbf24";
    ctx!.strokeStyle = "#ffffff";
    ctx!.lineWidth = 2;
    ctx!.beginPath();
    ctx!.ellipse(0, -coneLength * 0.5, coneTopWidth * 0.5, 6, 0, 0, Math.PI * 2);
    ctx!.fill();
    ctx!.stroke();

    ctx!.restore();
  }

  let startTime = performance.now();

  function render(time: number) {
    ctx!.clearRect(0, 0, w, h);

    // 1. Update and draw Popper Cannons
    for (const popper of poppers) {
      if (popper.state === "rising") {
        popper.y -= popper.speed;
        popper.speed *= 0.95; // ease as it nears mid

        // Check if reached mid-screen
        if (popper.y <= popper.targetY || popper.speed < 4.5) {
          popper.state = "popping";
          // Muzzle tip position in world coordinates
          const tipDistance = 35;
          const tipX = popper.x + Math.cos(popper.angle) * tipDistance;
          const tipY = popper.y + Math.sin(popper.angle) * tipDistance;
          spawnConfettiExplosion(tipX, tipY, popper.angle);
        }
      } else if (popper.state === "popping") {
        popper.recoilTimer += 1;
        // Recoil back and rotate
        popper.y += 2.5;
        popper.recoilAngle += popper.side === "left" ? 0.08 : popper.side === "right" ? -0.08 : 0.06;
        if (popper.recoilTimer > 6) {
          popper.state = "falling";
          popper.speed = 1;
        }
      } else if (popper.state === "falling") {
        // Tumble down off screen under gravity
        popper.speed += 0.85;
        popper.y += popper.speed;
        popper.recoilAngle += popper.side === "left" ? 0.045 : -0.045;
        if (popper.y > h + 150) {
          popper.state = "done";
          popper.alpha = 0;
        }
      }

      drawPopper(popper);
    }

    // 2. Draw Flash explosions
    for (let i = flashes.length - 1; i >= 0; i--) {
      const f = flashes[i]!;
      f.radius += (f.maxRadius - f.radius) * 0.25;
      f.alpha *= 0.82;

      ctx!.save();
      const grad = ctx!.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius);
      grad.addColorStop(0, `rgba(255, 255, 255, ${f.alpha})`);
      grad.addColorStop(0.4, `rgba(251, 191, 36, ${f.alpha * 0.7})`);
      grad.addColorStop(1, "rgba(251, 191, 36, 0)");
      ctx!.fillStyle = grad;
      ctx!.beginPath();
      ctx!.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.restore();

      if (f.alpha < 0.02) {
        flashes.splice(i, 1);
      }
    }

    // 3. Update and draw Confetti Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]!;

      // Physics: drag + gravity + gentle flutter
      p.vx *= 0.965;
      p.vy *= 0.965;
      p.vy += 0.22; // gravity

      p.wobble += p.wobbleSpeed;
      const drift = Math.sin(p.wobble) * 1.2;

      p.x += p.vx + drift;
      p.y += p.vy;

      p.rotation += p.rotSpeed;
      p.rotX += p.rotXSpeed;

      // Slow fade out as it reaches bottom
      if (p.y > h * 0.7) {
        p.opacity -= p.decay;
      }

      if (p.y > h + 40 || p.opacity <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rotation);
      ctx!.scale(Math.cos(p.rotX), 1); // 3D flip effect
      ctx!.globalAlpha = Math.max(0, p.opacity);

      if (p.type === "ribbon") {
        // Curly serpentine spiral ribbon streamer
        ctx!.strokeStyle = p.color;
        ctx!.lineWidth = p.width;
        ctx!.lineCap = "round";
        ctx!.beginPath();
        const rLen = p.ribbonLength || 35;
        const freq = p.waveFreq || 0.2;
        ctx!.moveTo(0, -rLen * 0.5);
        for (let s = 0; s < rLen; s += 4) {
          const waveX = Math.sin(s * freq + p.wobble) * 6;
          ctx!.lineTo(waveX, -rLen * 0.5 + s);
        }
        ctx!.stroke();
      } else if (p.type === "circle") {
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(0, 0, p.width * 0.5, 0, Math.PI * 2);
        ctx!.fill();
      } else {
        // 3D Flipping rectangular card
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.width * 0.5, -p.height * 0.5, p.width, p.height);

        // Highlight sheen on face
        if (Math.cos(p.rotX) > 0) {
          ctx!.fillStyle = "rgba(255,255,255,0.2)";
          ctx!.fillRect(-p.width * 0.5, -p.height * 0.5, p.width, p.height * 0.4);
        }
      }

      ctx!.restore();
    }

    // Continue loop if active particles or poppers remain
    const poppersAlive = poppers.some((p) => p.state !== "done");
    if (particles.length > 0 || poppersAlive || flashes.length > 0) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      // Done: clean up canvas
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      activeCanvas = null;
      animationFrameId = null;
    }
  }

  animationFrameId = requestAnimationFrame(render);
}
