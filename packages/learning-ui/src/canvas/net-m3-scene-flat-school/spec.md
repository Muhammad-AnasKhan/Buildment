# Canvas spec: net-m3-scene-flat-school

Course and chapter: networking, 3.4 beat 1 (watch only). Renderer: the existing `scene` renderer, data only (`SceneSpec`, `renderers/scene/`). No new component.

## Claim

On one flat network, staff laptops, guest phones and the exam server share the same path. Unwanted traffic from a guest phone reaches the exam server, because nothing on the network sits in the way.

## Touch

None. The scene plays by itself; **Replay** plays it again. Staff and guest traffic mix on one network, a guest phone sends unwanted traffic to the exam server, it arrives, and the verdict reads "A guest can reach the exam server."

## Limits

A fictional school with made-up counts (100 staff laptops, 1 exam server, 499 guest phones); each group is one card. Arriving means the model lets the traffic reach the server. It does not mean a login works or that data is taken, and it is not an attack demonstration.
