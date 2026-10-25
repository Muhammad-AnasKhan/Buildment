# Canvas spec: product-m3-four-states

- **Course and chapter:** product-sense, 3.2 "Empty, loading, error: the states nobody draws", beat 2 (the playable beat).
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the claim is about what a screen says in each state, so the picture must be four versions of one real screen.
- **Claim:** Every screen has four states: empty, loading, error and full. A blank or a bare spinner tells the person nothing; each state should say what is happening and, where it can, offer a next step [A21, A22, A23].
- **Model:** Halaqa's study groups screen for the course "Data structures" in four versions. Empty: a heading, a line about what a group is, a Start a group button. Loading: a spinner with words, a bar "Loaded 3 of 8 groups" and a line that the search is kept. Error: a message that groups did not load because the connection dropped, the search kept, and a Try again button. Full: two groups with time, place and seats left.
- **Versions:** "Empty" (good: "Says why and how to start"), "Loading" (good: "Shows it is working"), "Error" (good: "Names the cause, gives a step"), "Full" (accent: "The state most apps draw").
- **Inputs:** four pills under the picture; the first version shown is Empty.
- **What changes:** the screen and the verdict banner.
- **What the learner should notice:** three of the four screens are about the moments when nothing can be listed yet, and each one still gives the person a fact and a next step. Only the last is the screen people usually design.
- **Accessibility:** the pills are a real button group; a polite live region reads the state, its screen description and the verdict; text at least 11 units.
- **Limits (fold):** wording and numbers belong to this fictional screen; a real app needs its own loading times. Halaqa is fictional.
- **Sources:** NN/g on empty states [A22], response times [A21] and error messages [A23]; the four-state frame is the course's own.
