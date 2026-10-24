import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 6.2 beat 2: one GraphQL query from the phone; the server follows the links
// inside EU West, where each trip is about 0.25 ms, and replies once.
export const sysdesignM6GraphqlOneTrip: SceneSpec = {
  kind: "scene",
  title: "GraphQL: one query, one long trip",
  purpose: "The phone sends one query naming the fields it needs; the GraphQL server collects them from nearby services and sends one reply.",
  limits: "The long trip is 160 ms (EU West to Singapore) and each trip inside the region about 0.25 ms, both from napkin-math. The picture leaves out the server's own work, and it slows the short trips down so you can see them.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "phone", label: "Phone", kind: "phone", sub: "in Singapore", x: 60, y: 160 },
      { id: "gql", label: "GraphQL", kind: "server", sub: "in EU West", x: 210, y: 160 },
      { id: "books", label: "Books", kind: "database", sub: "service", x: 360, y: 90 },
      { id: "sellers", label: "Sellers", kind: "database", sub: "service", x: 360, y: 160 },
      { id: "reviews", label: "Reviews", kind: "database", sub: "service", x: 360, y: 230 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 1.0, from: "phone", to: "gql", label: "one query" },
      { kind: "fly", at: 1.3, dur: 0.4, from: "gql", to: "books", label: "book 42" },
      { kind: "fly", at: 1.7, dur: 0.4, from: "books", to: "gql", label: "seller 7" },
      { kind: "fly", at: 2.2, dur: 0.4, from: "gql", to: "sellers", label: "seller 7" },
      { kind: "fly", at: 2.2, dur: 0.4, from: "gql", to: "reviews", label: "reviews" },
      { kind: "fly", at: 2.6, dur: 0.4, from: "sellers", to: "gql", label: "name" },
      { kind: "fly", at: 2.6, dur: 0.4, from: "reviews", to: "gql", label: "stars" },
      { kind: "say", at: 3.0, actor: "gql", text: "about 1 ms here" },
      { kind: "fly", at: 3.2, dur: 1.0, from: "gql", to: "phone", label: "just those fields" },
      { kind: "say", at: 4.2, actor: "phone", text: "1 trip: 160 ms", tone: "good" },
      { kind: "verdict", at: 4.4, text: "One round trip from the phone", tone: "good" },
    ],
    loop: 7.4,
  },
};
