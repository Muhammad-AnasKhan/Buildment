# Canvas spec: product-m2-arabic-size

- **Course and chapter:** product-sense, 2.3 "Type that reads on a phone", the fourth beat (an extra canvas).
- **Renderer:** custom, on the reusable specimen ladder, with a right-to-left screen (`dir: "rtl"`, `models/ui-specimen.ts`). This folder holds only data. Reason: the sources for body size and line height are written for Latin letters, and the learners read Arabic first. A learner who is a native reader can judge Arabic text on the screen, and the chapter's rule (check with a native reader on a real phone) gets a picture.
- **Claim:** The numbers in this chapter are for Latin letters. For Arabic, the reader decides: read the text for a minute at each size and ask whether it is easy to read.
- **Model:** one Halaqa group page in Arabic, right to left: the title "مراجعة الإحصاء 101" (Statistics 101 revision, 20 bold), a three-sentence description ("We solve past exam questions together. Bring your notebooks and a pen. We stop for ten minutes in the middle.") at 12, 14, 16, 18 and 20 with line height 1.5, the time line "غدًا الساعة 5 مساءً، عبر الإنترنت" (tomorrow at 5 pm, online) at 13 in grey, and a full-width button "انضم إلى الحلقة" (Join the group). Every verdict is the neutral question "N: is it easy to read?" in the accent tone, because no source gives an Arabic size.
- **Inputs:** drag anywhere across the picture, or use the arrow keys on the slider; five stops, starting at 16.
- **What changes:** the size of the Arabic description and the verdict.
- **What the learner should notice:** the learner is the native reader; the picture gives no answer, and the chapter's rule is to decide with a real reader on a real phone.
- **Accessibility:** the wrapper is a real slider with a value text ("Arabic body text 16"); a polite live region reads the verdict; the SVG has a title with the screen's description in English; text at least 12 units.
- **Limits (fold):** no opened source gives Arabic sizes or line height; the sizes are drawn units, not pixels; the letters are drawn in the reader's own font; Halaqa is fictional. A native Arabic reader should check the Arabic text before the course ships.
- **Sources:** none for the numbers; the check by a native reader is the course's own rule. Right-to-left layout is taught in module 3.
