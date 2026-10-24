# Canvas spec: sysdesign-m18-blue-green

- **Course and chapter:** system-design, 18.6 beat 2 (Blue-green: switch the router).
- **Renderer:** `scene` (data only).
- **Claim:** Blue-green gives a fast, simple rollback: change where the router points.
- **Story:** Users reach blue. The router switches to green. Green returns errors. The router switches back to blue.
- **Numbers:** None.
- **Limits shown under the picture:** You pay for two full environments during the switch. A database shared by both must work with both versions, so schema changes are deployed separately. Users with open requests at the moment of the switch can see errors.
- **Sources:** Fowler, Blue Green Deployment [S109].
