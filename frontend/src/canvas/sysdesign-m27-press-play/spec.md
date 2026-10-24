# Canvas spec: sysdesign-m27-press-play

- **Course and chapter:** system-design, 27.1 beat 1 ("Play is many small downloads").
- **Renderer:** `scene` (data only).
- **Claim:** Playing a video is a page request followed by a stream of small piece requests, not one big download.
- **Story:** The phone asks Lamha for the watch page and gets a title and links. It then asks the CDN edge for piece 1, plays it, and asks for piece 2. Verdict: "Play is many small downloads".
- **Numbers:** Pieces are 6 seconds long (course choice, chapter 27.4). Lamha and its numbers are made up.
- **Sources:** none beyond the course assumptions. HLS (RFC 8216) and DASH (ISO/IEC 23009-1) describe this idea (source needed in the chapter).
