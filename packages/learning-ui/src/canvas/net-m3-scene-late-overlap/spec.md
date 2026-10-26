# Canvas spec: net-m3-scene-late-overlap

Course and chapter: networking, 3.6 beat 4 (watch only). Renderer: the existing `scene` renderer, data only (`SceneSpec`, `renderers/scene/`). No new component.

## Claim

Two networks can reuse the same private range and work fine alone. The overlap only shows up when they must talk, for example over a VPN. A laptop then treats the other side's address as part of its own network.

## Touch

None. The scene plays by itself; **Replay** plays it again. Home and office each work alone, a VPN joins them, both claim `192.168.1.0/24`, the home laptop sends to `.50` and the home side keeps it local. The verdict reads "Same range on both sides."

## Limits

Two made-up networks with private addresses. The picture shows the conflict, not a fix. It does not model route priority, packet loss or any VPN product, and finding an overlap on paper does not replace looking at the real routes.
