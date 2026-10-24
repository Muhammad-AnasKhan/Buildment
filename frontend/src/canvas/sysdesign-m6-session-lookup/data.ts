import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 6.7 beat 2: sessions. Every request's cookie is looked up in a shared
// store. Support deletes the session, and the next request gets 401.
export const sysdesignM6SessionLookup: SceneSpec = {
  kind: "scene",
  title: "Sessions: the server looks you up",
  purpose: "Each request sends a session id that the API looks up in a shared store; once support deletes the session, the very next request is refused.",
  limits: "A lookup in the same region takes about half a millisecond (napkin-math); the picture slows it down. One API server is drawn; every server uses the same store.",
  scene: {
    width: 420,
    height: 260,
    actors: [
      { id: "seller", label: "Seller", kind: "phone", sub: "sid=a91", x: 60, y: 200 },
      { id: "api", label: "Kitabi API", kind: "server", sub: "stateless", x: 210, y: 100 },
      { id: "store", label: "Sessions", kind: "cache", sub: "in Valkey", x: 360, y: 200 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "seller", to: "api", label: "cookie sid=a91" },
      { kind: "fly", at: 0.9, dur: 0.5, from: "api", to: "store", label: "GET a91" },
      { kind: "fly", at: 1.4, dur: 0.5, from: "store", to: "api", label: "seller 7" },
      { kind: "say", at: 1.9, actor: "api", text: "seller 7: OK", tone: "good" },
      { kind: "fly", at: 2.0, dur: 0.6, from: "api", to: "seller", label: "200", tone: "good" },
      { kind: "say", at: 2.8, actor: "store", text: "a91 deleted", tone: "bad" },
      { kind: "fly", at: 3.2, dur: 0.7, from: "seller", to: "api", label: "cookie sid=a91" },
      { kind: "fly", at: 3.9, dur: 0.5, from: "api", to: "store", label: "GET a91" },
      { kind: "fly", at: 4.4, dur: 0.5, from: "store", to: "api", label: "not found", tone: "bad" },
      { kind: "fly", at: 4.9, dur: 0.6, from: "api", to: "seller", label: "401", tone: "bad" },
      { kind: "say", at: 5.5, actor: "seller", text: "logged out", tone: "bad" },
      { kind: "verdict", at: 5.7, text: "Session deleted: refused at once", tone: "good" },
    ],
    loop: 8.7,
  },
};
