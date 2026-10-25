# Canvas spec: product-m3-rtl-card

- **Course and chapter:** product-sense, 3.4 "Everyone can use it: access and small screens", beat 5.
- **Renderer:** custom, on the reusable specimen compare beat (`primitives/specimen-beats.tsx`, model `models/ui-specimen.ts`). This folder holds only data, using the screen option `dir: "rtl"`, which mirrors the layout and shapes the text right to left. Reason: the course's learners read Arabic first, and right to left is easiest to understand when the same card is shown both ways.
- **Claim:** A page that reads from right to left is mirrored, not only translated. The text starts and aligns on the right, and a button at the end of a row moves to the left. Direction belongs in the markup (`dir`) and the layout should use start and end instead of left and right [A78, A79].
- **Model:** one Halaqa group card in two versions. English (ltr): the heading "Tonight at your university", the card "Data structures, exam Thursday", "Tonight 8 pm, library room 2", "2 seats left", and a Join button at the right end. Arabic (rtl): the title حلقة (Halaqa), the heading الليلة في جامعتك, the card هياكل البيانات، اختبار الخميس, الليلة 8 مساءً، غرفة المكتبة 2, بقي مقعدان, and a button انضم, mirrored: the text is aligned right and the button is at the left end. The Arabic is written in Arabic script and is short on purpose.
- **Versions:** "English" (accent: "Text left, Join on the right"), "Arabic" (good: "Text right, Join moved left").
- **Inputs:** the two-way switch under the picture; the first version shown is English.
- **What changes:** the side the text starts on, the side the button sits on, and the verdict banner.
- **What the learner should notice:** the card is a mirror image. The words are translated, and every position also flips. A margin set with `left` would stay on the wrong side.
- **Accessibility:** the switch is a real two-button group; a polite live region reads the version, its screen description and the verdict; text at least 11 units.
- **Limits (fold):** one card is not a full check. The Arabic should be read by a native reader on a real phone. The course's sources give no Arabic numbers for text size or line length, and no rule for which icons to mirror. Halaqa is fictional.
- **Sources:** W3C Internationalization, structural markup and right-to-left text [A78]; MDN, CSS logical properties [A79].
