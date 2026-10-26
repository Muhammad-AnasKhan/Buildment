# Canvas spec: net-m5-phone-localhost

Course and chapter: networking, 5.3 beat 1 (playable). Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas.tsx` in `net-step/`), used in place of the planned network lab (`[netlab]`). Model and schema: `models/net-step.ts`.

## Claim

The name `localhost` always means the computer that uses it. On the phone, `http://localhost:3000` is a request to the phone itself, because the loopback block `127.0.0.0/8` is never forwarded to another computer (IANA special-purpose registry, S9).

## Touch

**Next** plays the next step; **Start over** goes back to the first. At step 2 the learner first taps where the request for `localhost:3000` goes (the laptop, the phone itself, or the router), and the feedback says why. The table "On the phone" then fills with what `localhost` means, the loopback block, and the fact that nothing on the phone listens on port 3000.

## Limits

Two made-up devices (laptop `192.168.1.23`, phone `192.168.1.57`) on one Wi-Fi network. The table is a model of what the name means, not a recording from a phone. No firewall and no client isolation are drawn, and the laptop's address and listening address come in the next beats.
