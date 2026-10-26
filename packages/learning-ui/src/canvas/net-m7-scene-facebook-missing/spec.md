# Canvas spec: net-m7-scene-facebook-missing

Course and chapter: networking, 7.4 beat 1 (watch only). Renderer: the existing `scene` renderer, data only (`SceneSpec`, `renderers/scene/`). No new component.

## Claim

On 4 October 2021 Facebook, Instagram and WhatsApp could not be found by anyone on the internet, because their DNS servers withdrew their route announcements when a maintenance command cut the links to the data centres. The servers existed; the world had no route to them [S48].

## Touch

None. The scene plays by itself; **Replay** plays it again. The data centres lose their links, the DNS servers cannot reach them and withdraw their routes, then a phone asks its resolver for the address and the resolver finds no route. The verdict reads "Servers exist, no route to them".

## Limits

A simplified retelling of the company's own account [S48]: four boxes stand for many systems, and the account gives no total duration, so none is drawn. A maintenance command meant to assess backbone capacity started it, and a bug in the audit tool let the command run; the scene shows only the part that matters for DNS. Route announcements (BGP) are not taught in this course (4.5 shows the idea); they appear only to show that a name needs a route to its servers.
