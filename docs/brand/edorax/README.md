# Edorax brand kit

Everything needed to build Edorax experiences the same way every time: the logo, Dot the
mascot, Dot's voice, colours, type, motion, and the specs for gamification, leaderboards,
emails, push notifications and the first visit.

The full design canvas (logo work, icons, Dot's moods and moments, voice board with playable
clips, gamification, leaderboards, emails, first visit and four landing page versions):
https://claude.ai/artifact/B87M3KgGaP3j1jh9Gp5B7A

| Read next | What it covers |
| --- | --- |
| [gamification.md](gamification.md) | XP, levels, streaks, badges, daily goal, the six leaderboard types |
| [notifications.md](notifications.md) | Emails (live templates) and push notification copy and rules |
| [onboarding.md](onboarding.md) | First visit flow and the first-day dashboard |

## Colours

| Token | Hex | Use |
| --- | --- | --- |
| Cobalt | `#2434E0` | Primary actions, links, progress, selected states |
| Ink | `#0A0F2C` | Text, dark sections, outlines |
| Paper | `#F6F7FB` | Page ground |
| Marker | `#FFC933` | Dot, highlights, today's streak bar, celebration accents |
| Light cobalt | `#7A8BFF` | Cobalt on dark grounds |
| Line | `#DCE0F2` | Card borders, empty bars |
| Muted | `#46507A` | Secondary text (passes 4.5:1 on white and paper) |
| Tint | `#E8EBFF` | Panels, the learner's own row |

Rules: flat colour, no gradients, no glows. Cards are white with a 1px Line border and square
corners. No coloured left or top accent borders on cards or quotes.

## Type

- Headings: Unbounded 700, tracking from -0.02em (small) to -0.035em (display).
- Body: DM Sans 400 / 500 / 700.
- Short sentences, one idea at a time: many learners read English as a second language.

## Logo

The wordmark is "edora" with a built-in x: a cobalt stroke rising left to right, an ink stroke
falling, and a yellow dot at the top right. It is the logo everywhere; there is no separate symbol.

| File | Use |
| --- | --- |
| `frontend/public/brand/edorax-wordmark.svg` / `.png` | On light grounds |
| `frontend/public/brand/edorax-wordmark-dark.svg` / `.png` | On ink or dark grounds |
| `frontend/src/components/brand/wordmark.tsx` | In the app (tone `light` or `dark`) |

Smallest size: 100 px wide. Keep clear space of one x-height around it.

## Dot, the mascot

Dot is the only mascot: a yellow circle with white eyes, ink features and cobalt feet. Dot is a
learning buddy, not a teacher and not a judge.

| Mood | File | When |
| --- | --- | --- |
| happy | `brand/dot/happy` | Default, greetings, goals |
| wave | `brand/dot/wave` | Hello, sign in, "want to listen?" |
| think | `brand/dot/think` | Stuck, hints, loading |
| determined | `brand/dot/determined` | Quiz below the pass mark, try again |
| cheer | `brand/dot/cheer` | Lesson done, quiz passed, course finished |
| wink | `brand/dot/wink` | Right answer, streak milestones |
| oops | `brand/dot/oops` | Errors ("that did not load") |
| sleep | `brand/dot/sleep` | Empty states, leaderboards off |
| miss | `brand/dot/miss` | Back after days away (happy tears, open arms, a heart) |

Each mood exists as SVG (in the app) and as a 192 px PNG (emails, push, social). In React use
`<Dot mood="cheer" size={96} />` from `@/components/brand/dot`. The engagement system maps its
states to moods in `frontend/src/components/mascot/dot-mood.ts`.

Dot's rules:

1. One short line at a time. The screen carries the detail.
2. Never during a quiz.
3. One nudge per moment, then silence. Every nudge can be dismissed for good.
4. Honest: praise what happened, never a wrong answer. No fake urgency, no streak shaming.
5. Warm when someone comes back ("I missed you!"), never guilt.

## Dot's voice

Voice: Kai on ElevenLabs (model `eleven_v3`, voice id `S0ypc51SmsvcKXTWvjqJ`), with emotion
cues such as `[excited]` and `[gasps]` in the script. Lines are two to five words, except the
first-visit welcome.

All clips and their text live in `frontend/public/brand/dot/voice/` with
`frontend/public/brand/dot/manifest.json` (key, text, when, mood, file). Play a clip by its key.

| Key | Line | When |
| --- | --- | --- |
| welcome | Hey, welcome to Edorax! I'm Dot, your learning buddy! | First visit |
| yep | Yep! | Right on the first try |
| got-it | You got it! | Right after two or more misses |
| not-quite | Hmm, not quite! | First wrong try |
| need-a-hint | Need a hint? | Stuck |
| want-to-listen | Want to listen? | Long time on one page |
| look-again | Let's look again! | Quiz under the pass line |
| you-passed | You passed! | Quiz passed |
| lesson-done | Lesson done! | Lesson finished |
| streak-7 | Seven days! Wow! | Streak milestone |
| missed-you | You're back! I missed you! | Back after three or more days |
| you-did-it | You did it! | Course finished |

Sound rules: off until the learner turns it on, follows the phone's silent mode, never during a
quiz, plays once per moment, words always on screen too.

To record a new line: keep it under six words, write the emotion cue, generate with the same
voice and model, save as 64 kbps mono mp3, and add it to the manifest. Keep the API key in the
`ELEVENLABS_API_KEY` environment variable, never in the repo.

Note: the engagement rules in `server/src/shared/engagement/` still carry the older, longer
lines and the player does not play voice yet. Next step: shorten those lines to Dot's style,
record them with Kai, and play the clip when sound is on.

## Motion

- Small and purposeful: Dot bobs gently, pops on a win, bars grow in, panels fade up 6 px.
- 200 to 600 ms, ease out. One celebration per win, skippable with a tap.
- Everything stops under `prefers-reduced-motion`.

## Where things are used today

- Landing page: `frontend/src/components/marketing/edorax/` (hero question, Play, Listen, leaderboard preview).
- Learner app: `frontend/src/components/brand/` and `frontend/src/components/mascot/`.
- Emails: `server/src/services/email/templates/` (layout, button and the `dot` partial).
