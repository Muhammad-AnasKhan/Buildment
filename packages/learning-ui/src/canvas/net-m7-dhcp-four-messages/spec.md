# Canvas spec: net-m7-dhcp-four-messages

Course and chapter: networking, 7.2 beat 2 (step through). Renderer: the existing `sequence` renderer, data only (`SequenceSpec`, `renderers/sequence/`). No new component.

## Claim

A device with no address gets one in four messages: DISCOVER, OFFER, REQUEST and ACK. The client uses port 68 and the server port 67 [S23]. The address comes with a mask, a gateway, a DNS server and a lease time.

## Touch

**Next** and **Back** step through four messages between a phone and a DHCP server. DISCOVER and REQUEST go out from 0.0.0.0 to 255.255.255.255, as the recorded lab capture shows. OFFER carries 10.5.0.84 from the pool 10.5.0.50 to 10.5.0.200 with a lease of 3600 s (dnsmasq's default is one hour [S64]). ACK starts the lease; its chips name the two timers, 1800 s and 3150 s [S23].

## Limits

One phone, one server, one link, in a made-up café network (10.5.0.0/24). No relay, no second server, no timing, and the lease timers are named but not drawn: the next beats draw them. The step names and ports come from RFC 2131 [S23]; the broadcast addresses come from a recorded capture of the lab, not from the RFC text.
