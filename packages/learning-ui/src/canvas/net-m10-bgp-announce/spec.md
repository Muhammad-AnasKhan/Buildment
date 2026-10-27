# Canvas spec: net-m10-bgp-announce

Course and chapter: networking, 10.3 (BGP: how networks tell each other what they can reach), beat 3. Renderer: the existing `[sequence]` renderer (`renderers/sequence/`). Data only, no new component.

## Claim

A BGP announcement travels from network to network, and each network puts its own AS number at the front of the AS path before it passes the route on. A network leaves out any route whose AS path already holds its own number, so a route cannot go round in a circle (RFC 4271, sections 5.1.2 and 9.1.2).

## Touch

**Next** and **Start over**, one step at a time, six steps across four lanes: AS64498 announces `203.0.113.0/24` (path `64498`); AS64497 passes it to AS64496 and to AS64499 (path `64497 64498`); AS64496 passes its copy to AS64499 (path `64496 64497 64498`); the link from AS64497 to AS64499 goes down and that way is withdrawn; AS64499 passes its last way on, and AS64496 refuses the copy with the path `64499 64496 64497 64498`. The chapter puts a Predict about the last step right before this beat.

## Limits

Four made-up networks with documentation AS numbers (RFC 5398) and a documentation block (RFC 5737), one router each. The order in which copies arrive is a model, and the copy sent back to AS64496 is drawn so that the check can be seen. How a network chooses among several ways is left to chapter 10.4. Timers, KEEPALIVE messages and the opening of a session are not drawn. The lab in 10.7 cannot show the refusal, because BIRD drops such a route without a message.
