# Canvas spec: net-m7-scene-no-address

Course and chapter: networking, 7.2 beat 1 (watch only). Renderer: the existing `scene` renderer, data only (`SceneSpec`, `renderers/scene/`). No new component.

## Claim

A device that has joined a network but has no address cannot talk to anyone by number, so its first message goes to everyone on the link, and a DHCP server answers.

## Touch

None. The scene plays by itself; **Replay** plays it again. The phone says "no address", then "asks everyone". Three messages leave it at once, labelled "from 0.0.0.0", the source address the lab capture shows for a DHCP client with no address. The server says it gives out addresses, the laptop and the tablet say the message is not for them, and the verdict reads "Everyone hears. One server helps."

## Limits

A made-up café network, 10.5.0.0/24, with four made-up devices on one link. The scene ends before the four DHCP messages, which are the next beat. It shows no access point or switch, no second DHCP server and no timing. The source address 0.0.0.0 is taken from the recorded lease (the capture line `0.0.0.0.68 > 255.255.255.255.67`).
