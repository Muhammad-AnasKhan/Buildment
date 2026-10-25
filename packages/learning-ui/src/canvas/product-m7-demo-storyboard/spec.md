# Canvas spec: product-m7-demo-storyboard

- **Course and chapter:** product-sense, 7.2 "A demo that shows the core in 60 to 90 seconds", the playable beat.
- **Renderer:** custom, on the reusable specimen compare (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: a storyboard is a list of timed shots, which the kit can draw as a screen, and the learner needs to switch plans and see when the main moment comes.
- **Claim:** A demo is one story, not a tour. A tour follows the app's menus and reaches the main moment late; a story starts with the person, shows the job and puts the main moment within the first seconds. A story that carries its words on screen still works with the sound off.
- **Model:** three versions. "Tour": a storyboard of five shots over 2 minutes 10 seconds (title card 0:00, sign-up 0:10, settings 0:35, menu 1:05, search and join 1:40). "Story": a storyboard of five shots over 1 minute 10 seconds (tonight's groups with a caption 0:00, tap Join 0:10, "You are in" caption 0:25, the result as a caption 0:40, end card 1:00). "One frame": one frame of the story with the sound off, a large group card, a Join button and a caption bar.
- **Inputs:** touch one of three buttons (Tour, Story, One frame).
- **What changes:** the storyboard, the "join happens at" number and the verdict: "The join comes at 1:40" (bad), "The join comes at 0:10" (good), "Clear with the sound off" (good).
- **Numbers on screen:** 1:40 of 2:10 (tour); 0:10 of 1:10 (story); 4 of 5 classmates (Maryam's check, from module 1). The story is 70 seconds, inside the course's 60 to 90 second target.
- **What the learner should notice:** in the tour, a viewer sees a sign-up page, settings and menus before anything happens; in the story, the join is the second shot. In the third version, every important word is on screen, so a muted viewer loses nothing.
- **Accessibility:** a real switch or button group with a name ("Demo plan"); a polite live region reads the version and the verdict; the SVG has a title with the screen's description; text at least 12 units.
- **Limits (fold):** the times and captions are a plan for a fictional app, not a rule. Real stories have other shots. Halaqa is fictional.
- **Sources:** muted feed video and captions [B64, B65, B66, B70, B71]; short videos hold attention in lecture videos [B63]; the 60 to 90 second target and the first 15 seconds are the course's own targets, supported only by the general finding that users decide fast whether to stay [B58].
