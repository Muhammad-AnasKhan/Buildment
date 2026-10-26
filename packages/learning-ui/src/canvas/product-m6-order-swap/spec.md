# Canvas spec: product-m6-order-swap

- **Course and chapter:** product-sense, 6.3 "AI as a critic: several opinions, then you decide", beat 3 (right after the predict).
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, two versions shown as a switch). This folder holds only data. Reason: the surprise is that nothing but the order changed, and a switch shows that at once.
- **Claim:** AI judges can favour the answer they see first. In one test, swapping the order of two answers changed the ranking, so a pick from one order says little about the screens. Ask in both orders [B53, B56]. The studies tested text answers, not screens.
- **Model:** a short chat on Halaqa (fictional). Two critiques of similar quality: A ("The Join button looks small. Check its height.") and B ("The hint text looks light. Check its contrast."). Each version shows them in one order, with a "Shown first" and a "Shown second" tag, and the judge's answer: A when A is first, B when B is first.
- **Versions:** A first, B first. Verdicts: "A first: judge picks A" (accent), "B first: judge picks B" (warn).
- **Inputs:** tap the switch (or Tab and Enter).
- **What changes:** the order of the two cards and the judge's pick.
- **What the learner should notice:** the critiques did not change and the winner did. The pick follows the order, so it is a habit of the judge, not a measure of the screen.
- **Accessibility:** each version has a one-sentence alt; a polite live region reads the version, the alt and the verdict; the switch buttons are real buttons. Order is stated in words on each card.
- **Limits (fold):** invented critiques and answers, not tool output; a real judge does not always flip. Halaqa is fictional.
- **Sources:** Zheng et al. on LLM judges [B53]; Wang et al. on position bias (preprint) [B56].
