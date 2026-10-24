# Canvas spec: sysdesign-m11-two-devices

- **Course and chapter:** system-design, 11.5 beat 4 ("The token stayed on her phone").
- **Renderer:** `scene` (data only).
- **Claim:** A token that lives in one browser or app protects only that device. A second device starts with no token and can read a stale copy.
- **Story:** Amna posts from her phone and gets token 1. Her laptop asks the router to read. With no token, the router picks the replica, which is still at 0, and the laptop shows no comment. Verdict: "The token stayed on her phone".
- **Numbers:** Course numbers.
- **Sources:** Chapter 8.4 for position tokens; Terry et al. 1994 [S50] for read-your-writes within a session.
