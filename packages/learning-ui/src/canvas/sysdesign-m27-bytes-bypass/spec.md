# Canvas spec: sysdesign-m27-bytes-bypass

- **Course and chapter:** system-design, 27.2 beat 3 ("The bytes skip the API servers").
- **Renderer:** `scene` (data only).
- **Claim:** With a signed address, the file goes from the phone to storage and never through the API servers, which keeps the API fleet small.
- **Story:** The phone asks to start an upload and receives a signed address. The API says "no video here". The phone sends 300 MB in chunks to storage. Storage tells the API the upload is done and the API queues a job. Verdict: "Bytes skip the API servers".
- **Numbers:** 300 MB is the average source video (5 minutes at 8 Mbit/s, course number). Through the API at the peak of 17.4 uploads a second this would be about 42 Gbit/s (fold in the chapter).
- **Sources:** Signed URLs are chapter 5.7. The tus protocol and S3 multipart limits are listed as "source needed" in the chapter.
