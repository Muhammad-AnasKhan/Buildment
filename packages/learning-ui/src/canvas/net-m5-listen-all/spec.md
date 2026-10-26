# Canvas spec: net-m5-listen-all

Course and chapter: networking, 5.3 beat 5 (playable). Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas.tsx` in `net-step/`), used in place of the planned network lab (`[netlab]`). Model and schema: `models/net-step.ts`.

## Claim

An app that listens on `0.0.0.0` answers on every address the computer has. After the app is moved from `127.0.0.1` to `0.0.0.0`, the laptop itself and the phone both connect. The change is only in the listening address.

## Touch

**Next** plays the next step; **Start over** goes back to the first. Five steps: the old listening row, `127.0.0.1:3000`; the app is started again and the row changes to `0.0.0.0:3000`; the laptop's own request still works; the phone's request arrives; the page comes back. The changed row carries the word "changed". No pick: the chapter's Predict and the end quiz carry the assessment.

## Limits

Two made-up devices on one Wi-Fi network. The table is a model of what `ss -tlnp` lists, not a recording; the real output from the course lab is in chapter 5.6. `0.0.0.0` is a listening promise and appears only in the listening column. The laptop's firewall and the Wi-Fi's client isolation can still block a correctly bound server on a real network, and neither is drawn.
