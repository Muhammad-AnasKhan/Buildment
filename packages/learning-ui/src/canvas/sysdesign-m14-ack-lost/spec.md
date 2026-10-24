# Canvas spec: sysdesign-m14-ack-lost

- **Course and chapter:** system-design, 14.5 beat 1 (Why a message comes twice).
- **Renderer:** `scene` (data only).
- **Claim:** A broker cannot tell 'the consumer did not get it' from 'the consumer did it but could not say so'. To be safe it sends again.
- **Story:** Broker sends m-7. Consumer adds 18 (balance 18). Consumer crashes before the ack. Broker times out and resends. Consumer adds 18 again (balance 36).
- **Numbers:** S84: SQS visibility timeout default 30 seconds. Other numbers are made up.
- **Sources:** S83 (SQS standard queues deliver at least once), S84 (visibility timeout).
