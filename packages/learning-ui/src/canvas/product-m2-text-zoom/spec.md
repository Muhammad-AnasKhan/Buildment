# Canvas spec: product-m2-text-zoom

- **Course and chapter:** product-sense, 2.3 "Type that reads on a phone", the third beat (an extra canvas).
- **Renderer:** custom, on the reusable specimen compare beat. This folder holds only data. Reason: the 200 percent rule is about what happens to a screen, and the failure (a fixed height that hides a button) is easier to see than to describe.
- **Claim:** A page must keep all its content and function when the reader scales text to 200 percent. If boxes grow with their text, the words wrap and the page gets taller, and nothing is lost. If a box has a fixed height, text and buttons are cut off.
- **Model:** one Halaqa group card in three versions. 100%: the title "Statistics 101 revision" at 20 bold, the time "Tomorrow 5 pm, online" at 16, a full-width Join button at 16. 200% grows: every size doubled, the card grows taller, everything still there. 200% cut: the doubled title and time fill a header box, and where the Join button should be the picture shows a blank strip with the note "The Join button is cut off here". Verdicts: "The card as designed" (accent), "Bigger, and nothing is lost" (good), "Join is cut off: it fails" (bad).
- **Inputs:** three pills (100%, 200% grows, 200% cut).
- **What changes:** the text size, whether the card can grow, and the verdict.
- **What the learner should notice:** the same 200 percent is fine or a failure depending on whether the box grows with its text.
- **Accessibility:** the pills form a labelled group; a polite live region reads each version, its description and verdict; the SVG has a title; text at least 11 units.
- **Limits (fold):** a card with three lines is the easy case; a real page needs a check at 200 percent on a real phone; the drawn units are not pixels; the cut-off button is drawn as a blank strip with a note.
- **Sources:** WCAG 1.4.4 Resize Text, Level AA [A15].
