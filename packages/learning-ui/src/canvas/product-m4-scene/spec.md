# Canvas spec: product-m4-scene

- **Course and chapter:** product-sense, 4.1 "Set the scene: it looks fine", beat 1 ("Same page, two verdicts, no reasons").
- **Renderer:** custom, on the reusable specimen compare (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the scene is about two people looking at one screen, so the picture must be a screen the reader can switch and look at, not a diagram about it.
- **Claim:** Two fellows can look at one screen and say "fine" and "cheap" without being able to say why. When a second version with other choices sits next to the first, the reader can point at what is different, and pointing is where a reason starts.
- **Model:** two versions of the group page of Halaqa (fictional). Version A is the page as Huda and Saeed saw it: a title, three plain lines of equal weight (time, place, seats left), three small chips for chat, files and polls, and a small Join button. Version B has the same facts with other choices: a larger title, the number of seats left as the biggest figure, the time and place on one line, one wide button labelled "Join this group", and one short line saying chat, files and polls open after joining.
- **Inputs:** a two-way switch with the labels "Version A" and "Version B". Version A shows first.
- **What changes:** the whole screen, and the verdict banner. Version A: "Huda: fine. Saeed: cheap." Version B: "Same page. What changed?" Both are neutral (accent) because the scene judges nothing.
- **What the learner should notice:** the seats-left number, the size and wording of the Join button, and the extra chips that are gone. The chapter's open question asks for two differences in the learner's own words.
- **Accessibility:** the switch is a real two-button control with a polite live region that reads the version, the screen's description and the verdict; the SVG has a title with the same text; text at least 11 units.
- **Limits (in the data):** a picture cannot show how a page feels in a hand, and two versions are not a test with people. Halaqa, Huda and Saeed are fictional.
- **Sources:** none needed; the chapter makes no research claim. The comparison of the two screens is the course's own.
