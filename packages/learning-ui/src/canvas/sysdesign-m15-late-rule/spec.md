# Canvas spec: sysdesign-m15-late-rule

- **Course and chapter:** system-design, 15.6 beat 5 ("A late event: fix it, or set it aside").
- **Renderer:** `scene` (data only).
- **Claim:** A late event is either added to a window that is still allowed to change, or set aside once it is too late.
- **Story:** The window 0 to 60 shows 12. A late event arrives while the watermark is 75, which is inside 30 seconds of the window's end, so the count becomes 13. A very late event arrives at watermark 95 and goes to a side bin. Verdict: "Late data fixed, or set aside".
- **Numbers:** Course numbers: count 12, allowed lateness 30 s.
- **Sources:** S87 (Flink: allowed lateness; default 0; late firings; late data can be sent to a side output).
