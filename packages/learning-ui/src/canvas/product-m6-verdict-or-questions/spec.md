# Canvas spec: product-m6-verdict-or-questions

- **Course and chapter:** product-sense, 6.3 "AI as a critic: several opinions, then you decide", beat 2.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, two versions shown as a switch). This folder holds only data. Reason: the learner should read the two replies side by side and see which one gives something to check.
- **Claim:** Do not ask whether a screen is good. Ask what a student might struggle with, which rule it touches and what you could measure. Questions are safe to receive; verdicts are not, because AI critiques can sound sure and still be wrong [B19].
- **Model:** a short chat on the create-group screen of Halaqa (fictional). A verdict: "You: Is this screen good?" and a reply "7 out of 10. It looks clean but could be more modern. Add a bold header and make the button stand out." Questions: a request that names the five checks and asks for no score, and a reply with two points, each with a rule and a check, and one honest "I am not sure" about the number of fields.
- **Versions:** A verdict, Questions. Verdicts: "A score and a mood to follow" (bad), "Points you can check" (good).
- **Inputs:** tap the switch (or Tab and Enter).
- **What changes:** the request and the reply.
- **What the learner should notice:** the verdict reply has no rule, no number and no way to check it. The questions reply gives each point a rule or a person to ask, and says where the tool is unsure.
- **Accessibility:** each version has a one-sentence alt; a polite live region reads the version, the alt and the verdict; the switch buttons are real buttons.
- **Limits (fold):** both replies are invented for the lesson, not tool output. Halaqa is fictional.
- **Sources:** NN/g on AI critique [B19]; the five checks are taught in modules 2, 3 and 5.
