# Canvas spec: sysdesign-m3-port-door

- **Course and chapter:** system-design, 3.6 beat 2.
- **Renderer:** `scene` (data only).
- **Claim:** A port number tells the operating system which listening process gets a connection; the process receives the connection as a new socket, which is a file descriptor; a connection to a port with no listener is refused.
- **Story:** The client connects to port 443; the kernel hands a new socket to the web app ("fd 12 opened"). The client connects to port 8080; nothing listens; the kernel answers "refused". Verdict: "The port number picks the process".
- **Numbers:** None. The descriptor number 12 is an example.
- **Sources:** None in the research dossier yet: `{/* source needed */}` notes in chapter 3.6 ask for RFC 9293 (ports, refused connections) and the Linux socket(2), accept(2) and open(2) man pages (sockets are file descriptors). Listed in the writer's reply.
