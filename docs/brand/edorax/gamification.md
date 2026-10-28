# Gamification and leaderboards

Progress pieces for Edorax. They exist to help a learner come back and finish, not to make
them anxious. Designs: the "Gamification items" and "Leaderboard types" boards on the
[brand canvas](https://claude.ai/artifact/B87M3KgGaP3j1jh9Gp5B7A).

## Principles

1. Reward finishing, never speed. No XP for answering fast.
2. Forgive. A missed day is covered by a streak freeze; coming back is celebrated.
3. Let the learner choose how competitive it is, including off.
4. Compare people with their own cohort or their own past, never the whole world.
5. One celebration per win, short, skippable.

## The pieces

| Piece | Rule | Visual |
| --- | --- | --- |
| XP | +20 finish a lesson, +50 pass a quiz, +10 hit the daily goal | Cobalt ring with the level number in Unbounded |
| Levels | Starter, Builder, Maker, Shipper, Mentor | Five rising bars; the current one cobalt with a yellow dot on top |
| Streak | A day counts when one lesson is finished | Seven week bars: done cobalt, today yellow, ahead Line grey |
| Streak freeze | Covers one missed day; the learner holds at most one | "Missed a day? A freeze keeps it going." |
| Badges | Earned by doing, never bought; one locked shown in grey | Six flat shapes (hexagon, circle, shield, ring, arch, diamond) |
| Daily goal | Light 5 min, Steady 10 min, Strong 20 min; counts offline | Three square chips, selected one solid cobalt |
| Finish screen | Dot cheers once, says what was earned, points to the next lesson | Tint panel, Dot cheer, one cobalt button |

## Leaderboard types

The learner picks in settings: My cohort, Just me vs last week, or Nothing. Default for new
learners: Just me vs last week.

| Type | Who is on it | Resets | Notes |
| --- | --- | --- | --- |
| Cohort board | The learner's own cohort only | Every Monday | Nobody falls behind for good |
| Rung league | 30 people per rung | Weekly | Top five climb; nobody drops, they stay put |
| Streak board | Cohort | Live | Rewards showing up; the learner's bar is yellow |
| Helper board | Cohort | Weekly | Counts answers a classmate marked as helpful |
| You vs last week | Just the learner | Weekly | Six weeks of their own XP and one line comparing |
| Study groups | Groups of four | Per goal | Everyone moves one shared bar |

Display rules: the learner's own row is on Tint with bold name. Avatars are initials on brand
colours. Show at most five rows; the learner is always visible. Never show a last place label.

## Where this connects in code

- Engagement rules and the mascot casting: `server/src/shared/engagement/` (synced to
  `frontend/src/shared/engagement/`). Celebrations such as level up, weekly goal met and course
  graduation already exist there.
- Dot's moods for each engagement state: `frontend/src/components/mascot/dot-mood.ts`.
- Landing preview of the leaderboard choice: `frontend/src/components/marketing/edorax/leaderboard-preview.tsx`.
