# Canvas spec: net-m2-address-bits

- **Course and chapter:** networking, 2.2. Full spec: `agent-ip/work/networking/canvas-specs/net-m2-address-bits.md`, section 2.
- **Renderer:** custom beat canvas on `BeatFrame`, `DotGrid`, `VerdictBanner` and `SvgButton`. One component, `AddressBitsCanvas.tsx` in this folder, `mode="address"`, with the byte view and the drill view in `bit-parts.tsx` and `DrillView.tsx`. Model: `models/net-address.ts`.
- **Claim:** An IPv4 address is 32 bits: four bytes, written as four numbers with dots for people, and the same bits read as one number from 0 to 4,294,967,295.
- **Input:** tap any of the 32 bits (four rows of eight, one row per byte); or type an address in the field under the picture; **Reset**.
- **Rule:** `ipToNumber` and `numberToIp`, unsigned 32-bit (`>>> 0`). Typed input: exactly four parts, digits only, each 0 to 255, no leading zero unless the part is `0`. Invalid input never changes the picture and shows a plain-words error ("256 is more than one byte can hold", "An address has four parts", "Leading zeros are not used in this course", "Each part is digits only"). "Four parts" waits for Enter or leaving the field, because it is expected while typing.
- **Default:** the bits of `192.168.1.23` = 3,232,235,799.
- **Picture:** dotted form above, a value chip left of each row, the single number in a card below; a flip highlights its row, the dotted form and the number.
- **Verdict:** "192.168.1.23 is the number 3,232,235,799", updated with every change.
- **Edge cases:** `0.0.0.0` (0), `255.255.255.255` (4,294,967,295, never negative), `128.0.0.0` (2,147,483,648).
- **Accessibility:** card names like "Byte 1, bit worth 128, on"; live summary; labelled text field with an error message tied to it by `aria-describedby`.
- **Limits (in the fold):** IPv4 only; the picture shows how an address is stored, not whether it is private or public (that is 2.4).
