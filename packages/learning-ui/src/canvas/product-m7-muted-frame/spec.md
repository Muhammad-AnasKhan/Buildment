# Canvas spec: product-m7-muted-frame

- **Course and chapter:** product-sense, 7.2 "A demo that shows the core in 60 to 90 seconds", beat 2.
- **Renderer:** custom, on the reusable specimen compare (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data. Reason: the claim is about what one frame of a video gives a viewer with and without sound, so the picture should be that frame in three states.
- **Claim:** Many feeds start a video with the sound off. A voice then carries nothing, and the words on the screen must carry the story. A demo that works muted needs large words and large controls on the screen, and captions for anything said.
- **Model:** three versions of one frame of Halaqa's demo (fictional). "Sound on": the group card "Data structures, exam Thursday", "Tonight 8 pm, library room 2", "2 seats left" and a Join button, a "Sound: on" pill and a box with the voice's words. "Sound off": the same card, a "Sound: off" pill and a box that says the voice is silent and nothing on screen says what to do. "Words": the same card, the pill and a dark caption bar "Tap Join. You are in a group for tonight."
- **Inputs:** touch one of three buttons (Sound on, Sound off, Words).
- **What changes:** the box under the card and the verdict: "The voice tells the story" (accent), "A muted viewer gets no words" (bad), "Words on screen carry it" (good).
- **Numbers on screen:** none besides the group card (2 seats left).
- **What the learner should notice:** the card, the button and the sound-off pill do not change between the second and third versions. Only the caption bar is added, and it is enough to carry the story.
- **Accessibility:** a real button group with a name ("Sound and words"); a polite live region reads the version and the verdict; the SVG has a title with the screen's description; text at least 13 units.
- **Limits (fold):** one frame of a plan, not a video. Feeds differ. Halaqa is fictional.
- **Sources:** muted feed video [B66, B70, B71]; captions help comprehension and WCAG 1.2.2 asks for them [B64, B65].
