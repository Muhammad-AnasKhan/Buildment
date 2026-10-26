# Canvas spec: product-m3-four-states

- **Course and chapter:** product-sense, 3.2 "Empty, loading, error: the states nobody draws", beat 1 (the playable beat).
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the claim is about what a screen says in each state, so the picture must be four versions of one real screen.
- **Claim:** Every screen has four states: empty, loading, error and full. A blank or a bare spinner tells the person nothing. Each state should say what is happening and, where it can, offer a next step [A21, A22, A23].
- **Model:** Halaqa's study groups screen, "Showing: all courses", in four versions. Empty: "No groups yet", a line about what a group is, and a Start a group button. Loading: a spinner with words, a bar "Loaded 3 of 8 groups" and a line that this can take about 12 seconds. Error: a message that groups did not load because the connection dropped, and a Try again button. Full: the course's three canon groups ("Data structures, exam Thursday", Tonight 8 pm, library room 2, 2 seats left; "Statistics 101 revision", Tomorrow 5 pm, online, 4 seats left; "Arabic literature reading", Saturday 10 am, cafe, Full). The word Full is red and also written.
- **Versions:** "Empty" (good: "Says why and how to start"), "Loading" (good: "Shows it is working"), "Error" (good: "Names the cause, gives a step"), "Full" (accent: "The state most apps draw").
- **Inputs:** four pills under the picture; the first version shown is Empty.
- **What changes:** the screen and the verdict banner.
- **What the learner should notice:** three of the four screens are about the moments when nothing can be listed yet, and each one still gives the person a fact and a next step. Only the last is the screen people usually design.
- **Accessibility:** the pills are a real button group; a polite live region reads the state, its screen description and the verdict; text at least 11 units.
- **Limits (fold):** wording and numbers belong to this fictional screen. A real app needs its own loading times. Halaqa is fictional.
- **Sources:** NN/g on empty states [A22], response times [A21] and error messages [A23]. The four-state frame is the course's own.
