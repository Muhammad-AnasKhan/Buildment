# Canvas spec: sysdesign-m6-revoke-timeline

- **Course and chapter:** system-design, 6.7 ("Authentication and authorization at scale"), beat 4 "Ban a seller: who notices, and when?". New slug.
- **Renderer:** custom beat canvas on `BeatFrame`, with `PictureSlider` and `SliderRail` (drag anywhere on the picture to change the token lifetime), `DotGrid`, `VerdictBanner` and `BeatButton` ("Ban the seller", which replays the run).
- **Claim:** How fast a ban takes effect depends on where the proof is checked: sessions at once, signed tokens only at expiry, a denylist within its refresh time.
- **Model** (`models/revoke-timeline.ts`): the seller is banned at t = 0 and keeps sending requests; worst case, the token was issued just before the ban. Sessions: gap 0 s, 1 lookup per request. Signed tokens only: gap = L, the token lifetime, no lookup. Signed tokens plus a denylist refreshed every 10 s (made up): gap 10 s whatever L is, no lookup per request, one list fetch per service every 10 s.
- **Inputs:** token lifetime L on a rail, 1 to 60 minutes, snaps at 1, 5, 15 and 60, default 15. The rail sits under the one-minute to one-hour part of the time axis, so its handle matches where the red dots start in the tokens lane.
- **Worked values:** L = 15: gaps 0 s / 15 min / 10 s. L = 60: 0 s / 60 min / 10 s. L = 1: 0 s / 1 min / 10 s.
- **Picture:** three lanes on a log time axis from 1 second to 1 hour, with a dashed ban line at the left. The seller's requests are dots along each lane (24 dots, evenly spread on the log axis); green while the design accepts them, red from the moment it refuses. An amber band marks the gap. Each lane carries its own label and its lookups per request.
- **Verdicts:** L <= 5 "Short tokens: gap of 5 min or less"; L > 5 "Tokens alone: up to {L} min after ban" (at most 38 characters). Lane labels: "Sessions: refused at once", "Denylist: within 10 s".
- **Playback:** a dashed playhead sweeps the axis in 4.5 seconds of an 8.5 second loop; after a change the finished picture shows and the replay starts 1.2 seconds later. Under reduced motion the finished picture shows.
- **Accessibility:** the picture is one `role="slider"` with value text "15 minutes" plus the verdict; arrow keys step by one minute.
- **Sources:** [S3] lookup cost (500 microseconds). JWT and OAuth refresh tokens are source-needed notes in the chapter.
