# Canvas spec: sysdesign-m12-log-overwritten

- **Course and chapter:** system-design, 12.6 beat 3 (Healing overwrites the old entry).
- **Renderer:** `scene` (data only).
- **Claim:** An entry that was never committed can be overwritten by the new leader. Nobody was told it was saved, so nothing promised is lost.
- **Story:** The link returns. S3's append for term 2 does not match S1 and S2, which then drop y = 9 and copy z = 7. All five logs now match.
- **Numbers:** 5 servers; the old leader's entry was on 2 of 5.
- **Sources:** S68.
