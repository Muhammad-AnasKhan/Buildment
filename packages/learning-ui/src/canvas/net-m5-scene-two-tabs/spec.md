# Canvas spec: net-m5-scene-two-tabs

Course and chapter: networking, 5.2 beat 1 (watch only). Renderer: the existing `scene` renderer, data only (`SceneSpec`, `renderers/scene/`). No new component.

## Claim

Two tabs on one laptop can talk to the same website at the same moment. Both replies come back to the one laptop address, `192.168.1.23`, and a number in each reply, the port, sends it to the right tab.

## Touch

None. The scene plays by itself; **Replay** plays it again. Tab 1 and tab 2 each ask the website for a page, marked "from 51234" and "from 51236". The website sends two replies, marked "to 51234" and "to 51236", and each tab gets its own page. The verdict reads "One address. The port finds the tab."

## Limits

One made-up laptop with two tabs and one website at a documentation address (`203.0.113.80`). The ports are chosen for the picture; a real computer picks its own. A real browser may send both tabs' requests down one connection, which is not drawn. The scene shows that the port picks the tab but does not explain how the laptop keeps its table; that is the next beats.
