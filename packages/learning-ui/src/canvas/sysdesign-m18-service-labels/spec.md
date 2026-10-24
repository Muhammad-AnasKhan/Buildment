# Canvas spec: sysdesign-m18-service-labels

- **Course and chapter:** system-design, 18.4 beat 3 (A Service finds pods by label).
- **Renderer:** `scene` (data only).
- **Claim:** A Service is a stable address plus a label selector. It finds its pods by label, not by name.
- **Story:** A request reaches the Service, which sends it to Pod A. The next goes to Pod B. Pod C, labelled app=cleanup, gets nothing.
- **Numbers:** None.
- **Limits shown under the picture:** Only pods that are ready are in the list. The Service has one stable name and address; the pods behind it come and go. Traffic is spread over the pods, not always in strict turns.
- **Sources:** Kubernetes Service and DNS documentation [S147].
