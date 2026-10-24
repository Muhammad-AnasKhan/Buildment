import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 6.7 beat 3: a JWT. The login server signed it earlier; the orders service
// checks the signature with the public key and the expiry, and asks nobody.
export const sysdesignM6JwtVerify: SceneSpec = {
  kind: "scene",
  title: "JWT: a signed note, checked alone",
  purpose: "Huda's app holds a token signed by the login server; the orders service checks its signature and expiry on its own, without a call to anyone.",
  limits: "The 15-minute lifetime is a made-up Kitabi setting. The picture leaves out the token's other claims, such as who issued it and which API it is for, which a service must also check.",
  scene: {
    width: 420,
    height: 260,
    actors: [
      { id: "phone", label: "Huda", kind: "phone", sub: "logging in", x: 60, y: 200 },
      { id: "orders", label: "Orders", kind: "server", sub: "has public key", x: 210, y: 100 },
      { id: "login", label: "Login", kind: "server", sub: "signs tokens", x: 360, y: 200 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.9, from: "login", to: "phone", label: "JWT: huda, 15 min" },
      { kind: "say", at: 1.1, actor: "phone", text: "has a JWT" },
      { kind: "fly", at: 1.4, dur: 0.7, from: "phone", to: "orders", label: "Bearer JWT" },
      { kind: "say", at: 2.1, actor: "orders", text: "signature OK", tone: "good" },
      { kind: "say", at: 2.6, actor: "orders", text: "exp OK: huda", tone: "good" },
      { kind: "say", at: 2.6, actor: "login", text: "not asked" },
      { kind: "fly", at: 2.9, dur: 0.7, from: "orders", to: "phone", label: "200 orders", tone: "good" },
      { kind: "say", at: 3.6, actor: "phone", text: "sees orders", tone: "good" },
      { kind: "verdict", at: 3.8, text: "Checked alone: no lookup needed", tone: "good" },
    ],
    loop: 6.8,
  },
};
