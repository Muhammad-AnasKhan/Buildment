# Canvas spec: net-m5-replay-conversation

Course and chapter: networking, 5.6 (the phone-only section). Renderer: the terminal replay `ReplayCanvas` in `net-m1-replay-setup-checker/`, with the model in `models/net-replay.ts`. Data only; no new component.

## Claim

Where a server listens decides whether a conversation can start. With the server on `127.0.0.1` the laptop is refused at once (curl exit 7). With the server on `0.0.0.0` the laptop gets the page, the capture shows the three packets of the handshake (`[S]`, `[S.]`, `[.]`), and `ss -tn` shows the same four numbers on both sides, in mirror order.

## Touch

**Next** shows the next recorded step; **Start over** goes back. Two steps from the real run of challenge 3 part 1, `conversation.sh` and `test.sh`. Each step hides its output until the learner picks one of three answers: what curl does when the server listens on `127.0.0.1` only, and what the test expects from that refusal. The picked step then shows the full recorded output.

## Limits

A recording of one real run in the course lab, with the finished solution of the challenge, made on 2026-10-26. Every output line is copied from the recording. The laptop's port in the capture (48158) and in the open conversation (48172) belong to two different conversations of the same run, so they differ. Process numbers and times are those of the run and will differ in a learner's run.
