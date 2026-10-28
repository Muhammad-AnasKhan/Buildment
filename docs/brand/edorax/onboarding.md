# First visit

Designs: the "First visit" board on the [brand canvas](https://claude.ai/artifact/B87M3KgGaP3j1jh9Gp5B7A).

A new learner meets Dot, learns what Dot does, picks a small goal, and answers a real
question before making an account.

| Step | Screen | Dot | Voice | Motion |
| --- | --- | --- | --- | --- |
| 1. Welcome | "Hey, welcome to Edorax!" and one line about the product; button "Hi, Dot!" | cheer | `welcome` | Dot drops in and bounces twice; confetti once |
| 2. Meet Dot | "I'm Dot, your learning buddy!" and four cards: help when stuck, read lessons aloud, keep your streak, cheer your wins | wave | (continues `welcome`) | Bubble types in; cards slide up 80 ms apart |
| 3. Daily goal | "How much time a day?" Light 5, Steady 10, Strong 20 (Steady preselected) | happy | none | Chosen chip pops; Dot nods |
| 4. First question | The chapter 1 sample question; no account yet | think, then cheer on a right answer | `yep` on a right answer | Dot leans in; pop on success |

## First-day dashboard

- Greeting in Unbounded: "Welcome to Edorax, Amal!" with Dot waving on a Tint panel.
- One line and one button: "I picked a first lesson for you. It takes about 5 minutes." then "Start chapter 1".
- A "Day 1" streak card with today's bar glowing yellow until the first lesson is done.
- Today's goal with an empty progress bar.

Only the first visit animates like this. Later visits get a calm greeting with no animation,
and "You're back! I missed you!" (mood `miss`, voice `missed-you`) after three or more days away.
