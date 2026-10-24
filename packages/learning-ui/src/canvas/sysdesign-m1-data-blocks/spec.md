# Canvas spec: sysdesign-m1-data-blocks

- **Course and chapter:** system-design, 1.3 beat 4 ("Data: cache, database, files, queue").
- **Renderer:** `scene` (data only).
- **Claim:** Different data needs different homes. The database holds the truth, the cache holds fast copies that may be thrown away, object storage holds large files, and a queue holds work to be done later.
- **Story:** To show note 42 the app asks the cache (miss), reads the row from the database, keeps a copy in the cache ("has note 42"), fetches the PDF from object storage, and leaves "job: count view" in the queue ("1 job waiting"). Verdict: "Each kind of data has a home".
- **Numbers:** none in the picture.
- **Sources:** look-aside cache and delete on write, Facebook memcache, NSDI 2013 [S24]; ElastiCache lazy loading [S26]; SQS at-least-once delivery [S83]; blob GET latency on S3 and GCS from napkin-math [S3] (cited in the chapter's folds).
