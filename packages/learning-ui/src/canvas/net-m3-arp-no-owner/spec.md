# Canvas spec: net-m3-arp-no-owner

Course and chapter: networking, 3.3 beat 5 (playable). Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas`, model `models/net-step.ts`). Spec of the renderer: `agent-ip/work/networking/canvas-specs/netstep-renderer.md`.

## Claim

An ARP request for an address nobody owns still reaches every device on the link, but nobody answers. The sender asks again, then gives up with an empty ARP table. In the lab this is the ping to `192.168.1.99`: 2 sent, 0 received, 100% packet loss.

## Touch

**Next** plays the next step; **Start over** goes back to the first. At step 4 the learner picks what the laptop gets back after the broadcast (an error from the switch, a reply from the router, or nothing at all). The step plays after the pick and the feedback says why.

## Limits

Three made-up devices and made-up MACs (`02:...`) on one switch. The ARP table is a simplified model view. The picture explains one controlled case, where nobody owns the address; a ping with no answer can have other causes. The course does not promise a "Destination Host Unreachable" line, because it was not seen with `-c2 -W1`. How many times and for how long a real laptop asks is not drawn.
