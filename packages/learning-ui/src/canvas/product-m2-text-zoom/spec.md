# Canvas spec: product-m2-text-zoom

- **Course and chapter:** product-sense, 2.3 "Type that reads on a phone", the third beat (an extra canvas).
- **Renderer:** custom, on the reusable specimen compare beat. This folder holds only data. Reason: "scale text to 200 percent without losing anything" is a check on a screen, so the learner should see the same card at both sizes.
- **Claim:** When a reader sets text to 200 percent, a well-built page gets taller and its words wrap onto more lines, but no content or function is lost: the title, the time and the Join button are all still there.
- **Model:** a Halaqa group card (title, time, Join button) with every text size at 1 times (20, 16, 16) and at 2 times (40, 32, 32). Verdicts: "The card as designed" (accent) and "Bigger, and nothing is lost" (good). At 200 percent the title wraps onto two lines ("Statistics", "101") and the page grows from 194 to 330 units.
- **Inputs:** two buttons (100%, 200%).
- **What changes:** the text sizes, the wrapping and the verdict.
- **What the learner should notice:** everything is still reachable at the larger size.
- **Accessibility:** the two buttons form a labelled group; a polite live region reads each version and verdict; the SVG has a title; text at least 11 units.
- **Limits (fold):** a three-line card is the easy case; a real page must be checked at 200 percent on a real phone, with menus and forms; the units are not pixels; Halaqa is fictional.
- **Sources:** WCAG 1.4.4 Resize Text, Level AA [A15].
