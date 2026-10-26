# Canvas spec: net-m6-scene-quiet-chat

Course and chapter: networking, 6.5 beat 1 (watch only). Renderer: the existing `scene` renderer, data only (`SceneSpec`, `renderers/scene/`). No new component.

## Claim

A chat app that has been quiet for an hour can miss a message that the server sends, because the router's NAT row for the conversation expired while nothing passed. Opening the app sends a packet, which makes a new row, and messages arrive again.

## Touch

None. The scene plays by itself; **Replay** plays it again. The phone says hello and gets a message, then goes quiet while a clock fills to 60 minutes. A dashed line at 5 minutes marks the model timeout, the router says the row expired, the server's message at minute 60 is stopped at the router, and opening the app brings messages back.

## Limits

Three made-up devices and a model timer of 5 minutes (300 s), chosen for teaching; a real router's timer is different [S18, S51]. Many chat apps send keepalives or reconnect on their own, so this shows one cause and not every chat problem. The picture does not say whether the router drops the message or answers with a reset; both leave it undelivered. The beats after this one explain the row and its timer.
