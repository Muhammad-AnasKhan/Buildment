# Canvas spec: sysdesign-m18-volume-survives

- **Course and chapter:** system-design, 18.3 beat 6 (Data outlives the container).
- **Renderer:** `scene` (data only).
- **Claim:** Containers are replaceable, so anything worth keeping lives outside them.
- **Story:** Container 1 writes notes.db to a volume, then is removed. Container 2 starts new, reads from the same volume and has the notes.
- **Numbers:** None.
- **Limits shown under the picture:** A container's own writable layer is deleted with the container. A named volume (or a database service) is stored outside it. On a cluster, a pod that moves to another machine needs storage that moves with it, which this picture does not show.
- **Sources:** Docker documentation on volumes (add to dossier).
