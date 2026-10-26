# Canvas spec: net-m5-listen-loopback

Course and chapter: networking, 5.3 beat 4 (playable). Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas.tsx` in `net-step/`), used in place of the planned network lab (`[netlab]`). Model and schema: `models/net-step.ts`.

## Claim

A listening address is a promise about which of the computer's addresses will answer. An app that listens on `127.0.0.1` answers only the computer it runs on. A request from the phone to the laptop's real address reaches the laptop, finds nobody listening there, and is refused at once.

## Touch

**Next** plays the next step; **Start over** goes back to the first. Four steps: the app starts on `127.0.0.1:3000` and the table of listening sockets shows it; the laptop's own request works; the phone's request arrives; the laptop answers "refused". The chapter's Predict sits just before this beat, so the picture has no pick of its own.

## Limits

Two made-up devices on one Wi-Fi network. The table is a model of what `ss -tlnp` lists; the real output from the course lab is in chapter 5.6. A refusal is a quick no, which is different from a firewall that drops the request silently (a long wait); no firewall is drawn. The step to the phone's address uses a private range.
