# Canvas spec: sysdesign-m11-reply-first

- **Course and chapter:** system-design, 11.4 beat 3 ("A reply before its question").
- **Renderer:** `scene` (data only).
- **Claim:** Two writes that are causally related can be copied to different places at different speeds, so a reader can see the effect without its cause.
- **Story:** The asker posts a question. The replier reads it and posts a reply. The reply's copy is up to date at once; the question's copy is not. The reader sees the reply, then finds no question. Verdict: "Reply shown before its question".
- **Numbers:** Course numbers.
- **Sources:** Consistent prefix defined by Terry 2011 [S51]; the forum is a course example; chapter 8.4 introduces the idea.
