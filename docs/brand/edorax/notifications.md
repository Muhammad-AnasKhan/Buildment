# Emails and push notifications

Designs: the "Emails" board on the [brand canvas](https://claude.ai/artifact/B87M3KgGaP3j1jh9Gp5B7A).

## Emails (live)

Sent through Resend (`server/src/services/email/send.ts`), rendered from EJS templates in
`server/src/services/email/templates/`:

- `layout.ejs`: Paper ground, the wordmark PNG, one white card with a 1px Line border, an
  Unbounded heading, and a short footer.
- `button.ejs`: one solid cobalt, square button.
- `dot.ejs`: Dot at the top of the card. Use `<%- include('dot', { mood: 'wave' }) %>`;
  moods match `frontend/public/brand/dot/<mood>.png`. Unknown moods fall back to `happy`.

Images load from `APP_URL/brand/...`, so the web app must serve `frontend/public/brand`.

| Template | Dot | Purpose |
| --- | --- | --- |
| `request-magic-link` | wave | Sign in link, 15 minutes |
| `send-verification-email` | happy | Confirm the email, 24 hours |
| `send-inactivity-nudges-for-course` | miss | "I missed you!" with the course they left |
| `nudge-mentee` | wave | A mentor checked in |
| `run-weekly-goal-reminders` | happy | Progress toward the weekly goal |
| `notify-mentee-course-enrollment` | cheer | Added to a course |

Email rules: one heading and one button per email; everything else is a plain link. Short
sentences. Works without images (alt text on Dot and the wordmark). No guilt, no fake urgency.

Sender: `EMAIL_FROM` is still Resend's test sender. To send as `Edorax <hello@edorax.com>`,
verify edorax.com in Resend (it adds SPF and DKIM records in Cloudflare) and set `EMAIL_FROM`.

Designed but not built yet (copy on the canvas): streak at risk, quiz retry with the two ideas
to review, and course finished.

## Push notifications (to build)

No push channel exists yet. When it is added, use this copy and these rules.

| Trigger | Title | Body | Dot |
| --- | --- | --- | --- |
| Daily reminder at the learner's chosen time | Time for your 5 minutes | Chapter 4 is ready when you are. | happy |
| Streak at risk (evening, streak of 3 days or more, nothing done today) | Keep your 12 day streak | A 5 minute lesson keeps it going. | wink |
| Back after 3 or more days away | Dot misses you | Computer networking is right where you left it. | miss |
| Quiz below the pass line (next day) | Two ideas to look at again | Then try the chapter 3 quiz once more. | determined |
| Mentor replied | Your mentor replied | First line of the reply | wave |
| Streak milestone (7, 30, 100) | Seven days in a row! | That's a habit now. | cheer |
| Course finished | You did it! | Show someone what you built. | cheer |

Rules:

1. At most one push a day, and none between 21:00 and 08:00 local time.
2. If two pushes in a row are ignored, pause that kind for a week.
3. Every kind has its own switch in notification settings.
4. Use the Dot PNG for the mood as the notification image; the app icon stays the brand icon.
5. Titles under 40 characters, bodies under 90. Never shame, never invent urgency.
