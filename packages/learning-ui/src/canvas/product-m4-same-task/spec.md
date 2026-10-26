# Canvas spec: product-m4-same-task

- **Course and chapter:** product-sense, 4.4 "Study real products: collect, compare, critique", beat 1 ("Collect the first screen of one task").
- **Renderer:** custom, on the reusable specimen compare (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`) with three pills. This folder holds only data. Reason: the habit being taught is to collect screens of one task and look before judging, so the learner must be able to flip between them.
- **Claim:** To compare products, keep the task the same and write what you see before you judge. The first screens of three apps for the same task differ in ways that can be seen and dated.
- **Model:** three made-up room-booking apps, all for the task "book a group room for tomorrow at 4 pm". App A: a form of five fields that have placeholders only, and a small Submit button. App B: tomorrow's free hours as chips with 4 pm chosen, a summary of Room 2 from 4 pm to 5 pm, and one wide button. App C: a floor map with a line to tap a room, and a note that times appear after a room is picked.
- **Inputs:** three pills labelled "App A", "App B" and "App C". App A shows first.
- **What changes:** the screen and a neutral verdict that states only what is seen: "5 fields, placeholders only", "Free hours first, then confirm", "Map first, times come later".
- **What the learner should notice:** the number of fields, the words on the buttons, what is largest, and whether the times appear. These facts are the ones the critique sorter in the next beats uses.
- **Accessibility:** a real segmented control with a polite live region that reads the app, the screen's description and the verdict; the SVG has a title with the same text; text at least 11 units.
- **Limits (in the data):** a first screen is not a whole flow; a real comparison opens every step and dates what it saw. The apps are made up.
- **Sources:** critique against objectives and the same task [A31, A66]; GOV.UK on labels [A74].
