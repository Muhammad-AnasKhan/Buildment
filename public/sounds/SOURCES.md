# Learner feedback sounds

Mapped in `src/lib/sound-feedback.ts` → `FEEDBACK_AUDIO`. One line there swaps any cue.

These are **short, trimmed, peak-normalized** clips chosen for a quiet tactile feel (not musical stingers).

## Files

| File | Role | Source (CC0) |
|------|------|----------------|
| `tick.wav` | Checklist item (~48ms) | OwlishMedia [87 Clickety Clips](https://opengameart.org/content/87-clickety-clips) — `click84` |
| `check.wav` | Read / mandatory ack | Clickety Clips — `click21` |
| `submit.wav` | Submit cue | Clickety Clips — `click82` |
| `notification.wav` | Open question / softer quiz result | Clickety Clips — `click85` |
| `success.wav` | Correct block | Clickety Clips — `click81` |
| `celebration.wav` | Full checklist / perfect quiz | Clickety Clips — `click27` |
| `completion.wav` | Chapter complete (~240ms soft thud) | Robin Lamb UI pack ([OpenGameArt](https://opengameart.org/content/ui-sound-effects-button-clicks-user-feedback-notifications)) — `dum.wav` (VCSL/VSCO-derived) |
| `error.wav` | Wrong / validation | Generated in-repo (short low sine, non-cartoon) |

## Replace a sound

Drop a new `.wav` in this folder and change the matching path in `FEEDBACK_AUDIO`.

## Licenses

- **OwlishMedia Clickety Clips**: CC0 (OpenGameArt)
- **Robin Lamb UI pack**: CC0 (OpenGameArt; VCSL / VSCO 2 CE samples)
