# Canvas spec: net-m5-scene-late-audio

Course and chapter: networking, 5.5 beat 1 (watch only). Renderer: the existing `scene` renderer, data only (`SceneSpec`, `renderers/scene/`). No new component.

## Claim

In a voice call, a packet that arrives too late has no use. The friend skips it and plays the next packet.

## Touch

None. The scene plays by itself; **Replay** plays it again. You send small audio packets, one every 20 ms. Packets 1 to 3 arrive and play. Packet 4 is held up: a tag marks it due at 100 ms, and a second tag shows it arriving at 560 ms. The friend skips packet 4 and plays packet 5. The verdict reads "Too late to use, so it is skipped."

## Limits

Model numbers, not measurements: a packet every 20 ms, one packet due at 100 ms that arrives at 560 ms. The time strip at the bottom is a model axis in milliseconds. Real call apps are more careful and keep a short buffer; the scene shows only that a packet that comes too late has no use.
