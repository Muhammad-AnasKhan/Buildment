# Canvas spec: sysdesign-m18-managed-failover

- **Course and chapter:** system-design, 18.7 beat 5 (Managed means the provider repairs it).
- **Renderer:** `scene` (data only).
- **Claim:** A managed database includes backups, patching and failover. You pay for that and give up some control.
- **Story:** The app queries the primary. Zone a goes down and the app gets errors. The provider promotes the standby and the app reconnects and works.
- **Numbers:** None. No failover time is claimed.
- **Limits shown under the picture:** Failover is not instant and in-flight writes can fail. Managed also means less control: you cannot log in to the machine or tune everything. The picture shows the idea, not a failover time.
- **Sources:** Amazon RDS Multi-AZ documentation (add to dossier); Aurora replicas [S39].
