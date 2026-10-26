# Canvas spec: product-m7-where-links-go

- **Course and chapter:** product-sense, 7.4 "Show it where people look, open in one click", beat 3.
- **Renderer:** custom, on the reusable specimen compare (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the claim is about where a link sits, so the picture should be the three places a reviewer might meet it.
- **Claim:** People meet your work in a message, on a resume or on a profile. Each place should put the result next to the same link to the same case study page, and that page leads to the guest demo. The words of a resume and a profile belong to course 16.
- **Model:** three versions. "Message": a short message with the result (4 of 5 joined, up from 2) and one link line. "Resume": the top of a resume with a name, a Projects heading, a project line with the result and the link line. "Profile": a profile page with a Featured section and a picture card for the Halaqa case study, a result line and the link line. No web address is drawn.
- **Inputs:** touch one of three buttons (Message, Resume, Profile).
- **What changes:** the screen and the verdict: "A result and one link", "The link sits by the project", "Featured leads to the page" (all good).
- **Numbers on screen:** 4 of 5 and 2 (Maryam's check, from module 1).
- **What the learner should notice:** the three places look different, and each has the same two things: the result and the one link. Nothing asks the reviewer to find the work.
- **Accessibility:** a real button group with a name ("Where the link sits"); a polite live region reads the version and the verdict; the SVG has a title with the screen's description; text at least 12.5 units.
- **Limits (fold):** the drawings are not the real screens of any product. The best place is the one your reviewers look at, and only you can find that out. Maryam, Dalia and Halaqa are fictional.
- **Sources:** LinkedIn Featured can hold posts, links and uploaded media [B69]; the first lines of a resume and the profile words are course 16's job.
