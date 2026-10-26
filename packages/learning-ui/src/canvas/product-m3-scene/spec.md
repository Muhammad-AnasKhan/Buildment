# Canvas spec: product-m3-scene

- **Course and chapter:** product-sense, 3.1 "Set the scene: a blank screen on weak data", beat 1.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the scene is about what a person sees, so the picture must be the screen itself.
- **Claim:** A screen with a title and nothing else could mean loading, empty or broken, and the person cannot tell which. One line of words about what is happening turns a blank into a wait.
- **Model:** two versions of Halaqa's study groups screen as Bashar meets it on a slow library connection: blank below the title, and the same moment with a spinner, "Finding groups..." and one line about the slow connection and about 12 seconds. Halaqa and Bashar are fictional.
- **Cards or versions:** "Blank" (bad: "Blank. What is happening?") and "With words" (good: "It says what is happening").
- **Inputs:** the two-way switch under the picture.
- **What changes:** the screen and the verdict banner.
- **What the learner should notice:** the second screen is not faster. It is only honest about the wait.
- **Accessibility:** the switch is a real two-button group; a polite live region reads the version, its screen description and the verdict; text at least 11 units.
- **Limits (fold):** real slow loads have many causes, and words do not shorten the wait. Halaqa and Bashar are fictional.
- **Sources:** NN/g on empty states and on response times [A22, A21].
