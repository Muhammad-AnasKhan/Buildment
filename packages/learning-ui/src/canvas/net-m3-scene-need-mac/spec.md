# Canvas spec: net-m3-scene-need-mac

Course and chapter: networking, 3.3 beat 1 (watch only). Renderer: the existing `scene` renderer, data only (`SceneSpec`, `renderers/scene/`). No new component.

## Claim

A device can know the IP address it wants to reach and still lack what the link needs to deliver the frame: the destination MAC.

## Touch

None. The scene plays by itself; **Replay** plays it again. The laptop wants to send, the frame shows its destination IP (`.40`) filled in, then its destination MAC shown as `?`, and the Wi-Fi says it needs a MAC. The verdict reads "IP known. MAC missing."

## Limits

Three made-up devices (laptop `192.168.1.23`, friend `192.168.1.40`, a Wi-Fi link) and no MAC values yet. The scene stops on the missing field. It shows no failed transfer, no timeout and no measured delay. How the laptop finds the MAC (ARP) is the next beat.
