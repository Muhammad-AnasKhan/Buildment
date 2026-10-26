# Canvas spec: net-m5-scene-lossy-link

Course and chapter: networking, 5.4 beat 1 (watch only). Renderer: the existing `scene` renderer, data only (`SceneSpec`, `renderers/scene/`). No new component.

## Claim

A link can lose a packet, yet the receiver can still end up with the whole file, because the lost part is sent again.

## Touch

None. The scene plays by itself; **Replay** plays it again. The sender sends a file in three parts. The link drops part 2, and the phone says it has part 1 and then parts 1 and 3. The sender sends part 2 again, and the phone has all three. The verdict reads "Part 2 was lost. The file is whole."

## Limits

Three made-up devices and a file of three parts. The picture shows one drop and one second try. It shows no timer, no loss rate and no count of tries, and it does not say how the sender notices the loss; the next beats do. How often real links lose packets is not drawn.
