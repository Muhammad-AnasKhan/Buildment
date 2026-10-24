# Canvas spec: sysdesign-m18-same-image

- **Course and chapter:** system-design, 18.1 beat 2 (Ship the kitchen, not the recipe).
- **Renderer:** `scene` (data only).
- **Claim:** Packaging the code with everything it needs removes 'works on my machine' differences.
- **Story:** The laptop builds one image. The laptop, the CI machine and the server each run it. All three say 'works' and the verdict says same image, same result.
- **Numbers:** None.
- **Limits shown under the picture:** An image carries the program and its files, not the machine's kernel or hardware. A container still needs a compatible kernel and CPU type, and settings and secrets still come in from outside.
- **Sources:** None needed for the idea; chapter 18.3 covers images.
