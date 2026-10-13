/** BigWordAlert mappings modules 18–23 and 99. */
export const MODULE_ALERTS_PART4 = {
  "18-checkout-and-orders": {
    "18.01-set-the-scene": {
      term: "Checkout",
      plainEnglish:
        "The transaction moment — cart becomes orders, stock decrements, payment follows.",
      whyItMatters:
        "FreshMarket checkout is the highest-risk flow — bugs here mean wrong charges or overselling.",
    },
    "18.02-price-snapshot-trap": {
      term: "Price snapshot",
      plainEnglish:
        "Copying product name and price onto order lines at purchase time — immune to later price changes.",
      whyItMatters:
        "Vendor raises mango price after order — receipt must show what shopper actually agreed to pay.",
    },
    "18.03-what-youll-build": {
      term: "Order creation API",
      plainEnglish:
        "Checkout route that validates cart, snapshots lines, decrements stock, creates order documents.",
      whyItMatters:
        "FreshMarket split orders per vendor start here — one payment, many fulfillment records later.",
    },
    "18.04-normalization-payoff": {
      term: "Normalization payoff",
      plainEnglish:
        "Earlier schema decisions (storeId on lines, separate order docs) making checkout logic clean.",
      whyItMatters:
        "FreshMarket checkout groups cart by storeId because you modeled multi-vendor correctly upfront.",
    },
    "18.05-atomic-stock-decrement": {
      term: "Atomic stock decrement",
      plainEnglish:
        "Database operation that reduces stock only if enough remains — prevents overselling under concurrency.",
      whyItMatters:
        "Two shoppers buying last mango simultaneously — only one checkout must succeed.",
    },
    "18.06-prime-your-thinking": {
      term: "Split order",
      plainEnglish:
        "One shopper checkout creating separate order documents per vendor — each vendor fulfills independently.",
      whyItMatters:
        "FreshMarket is multi-vendor — Green Valley and Baker Bros each get their own order from one cart.",
    },
    "18.07-quiz": {
      term: "Split order",
      plainEnglish:
        "One shopper checkout creating separate order documents per vendor — each vendor fulfills independently.",
      whyItMatters:
        "FreshMarket is multi-vendor — Green Valley and Baker Bros each get their own order from one cart.",
    },
    "18.08-where-the-project-is-now": null,
    "18.09-scaffold-orders-module": {
      term: "Orders module",
      plainEnglish:
        "Server folder for checkout, order queries, and vendor/customer order list routes.",
      whyItMatters:
        "FreshMarket order logic colocates here — separate from cart and payment modules.",
    },
    "18.10-checkout-route": {
      term: "Checkout session",
      plainEnglish:
        "The short-lived flow where cart items become orders and payment is authorized.",
      whyItMatters:
        "FreshMarket checkout validates stock, creates order documents, and hands off to Stripe without double-charging.",
    },
    "18.11-snapshot-order-lines": {
      term: "Immutable order line",
      plainEnglish:
        "Order line fields frozen at purchase — product document can change later without altering receipt.",
      whyItMatters:
        "Support disputes and vendor payouts rely on accurate historical order line data.",
    },
    "18.12-stock-decrement": {
      term: "Inventory deduction",
      plainEnglish:
        "Reducing product.stock when order confirms — ties catalogue availability to real fulfillment.",
      whyItMatters:
        "FreshMarket must not sell stock already committed to another pending checkout.",
    },
    "18.13-clear-cart-on-success": {
      term: "Cart clearing",
      plainEnglish:
        "Deleting or emptying cart document after successful checkout — prevents double-order same items.",
      whyItMatters:
        "Shopper hitting back button should not still see pre-checkout cart as purchasable.",
    },
    "18.14-vendor-orders-route": {
      term: "Vendor order inbox",
      plainEnglish:
        "GET endpoint listing orders where storeId matches vendor's store — fulfillment queue.",
      whyItMatters:
        "FreshMarket vendors see new orders to pack — Chapter 20 builds the UI.",
    },
    "18.15-customer-orders-route": {
      term: "Order history",
      plainEnglish:
        "GET endpoint returning shopper's past orders with status — track and reorder.",
      whyItMatters:
        "FreshMarket customers check delivery status — order history is post-purchase trust.",
    },
    "18.16-test-snapshot-immutability": {
      term: "Snapshot immutability test",
      plainEnglish:
        "Change product price after order — verify order line price unchanged in database.",
      whyItMatters:
        "FreshMarket gate proves receipts are trustworthy — snapshot not live product reference.",
    },
    "18.17-recap-and-whats-next": {
      term: "Orders without payment",
      plainEnglish:
        "Checkout creates orders but payment is separate — Chapter 19 adds Stripe.",
      whyItMatters:
        "Do not skip order logic — payment confirms orders already created with correct totals.",
    },
    "18.18-checklist": {
      term: "Checkout session",
      plainEnglish:
        "The short-lived flow where cart items become orders and payment is authorized.",
      whyItMatters:
        "FreshMarket checkout validates stock, creates order documents, and hands off to Stripe without double-charging.",
    },
  },
  "19-payment-processing": {
    "19.01-set-the-scene": {
      term: "Payment processing",
      plainEnglish:
        "Collecting money from shoppers via a payment provider — Stripe in this course.",
      whyItMatters:
        "FreshMarket without real payments is a demo — Stripe handles PCI and card networks.",
    },
    "19.02-fake-checkout-trap": {
      term: "Fake checkout trap",
      plainEnglish:
        "UI that marks orders paid without provider confirmation — dangerous for production.",
      whyItMatters:
        "FreshMarket never sets paid=true from client alone — only Stripe webhook or confirmed intent.",
    },
    "19.03-what-youll-build": {
      term: "Stripe integration",
      plainEnglish:
        "Payment Intent creation, client confirmation, webhook handling for paid status.",
      whyItMatters:
        "FreshMarket checkout completes when Stripe confirms charge — orders unlock fulfillment.",
    },
    "19.04-one-payment-many-orders": {
      term: "Single charge, split orders",
      plainEnglish:
        "One Payment Intent covering total cart while creating multiple vendor order records.",
      whyItMatters:
        "Shopper pays once for mangoes and bread — FreshMarket splits fulfillment, not card charges.",
    },
    "19.05-stripe-test-mode": {
      term: "Stripe test mode",
      plainEnglish:
        "Sandbox using test API keys and card numbers — no real money moves.",
      whyItMatters:
        "FreshMarket development uses `pk_test_` / `sk_test_` — switch to live keys only in production.",
    },
    "19.06-prime-your-thinking": {
      term: "Payment intent",
      plainEnglish:
        "Stripe object representing an intent to charge — created server-side, confirmed client-side.",
      whyItMatters:
        "FreshMarket server creates intent with order total; React Stripe Elements confirms card entry.",
    },
    "19.07-quiz": {
      term: "Payment intent",
      plainEnglish:
        "Stripe object representing an intent to charge — created server-side, confirmed client-side.",
      whyItMatters:
        "FreshMarket server creates intent with order total; React Stripe Elements confirms card entry.",
    },
    "19.08-where-the-project-is-now": null,
    "19.09-stripe-config": {
      term: "Stripe API keys",
      plainEnglish:
        "Secret key on server, publishable key on client — never swap or commit secrets.",
      whyItMatters:
        "FreshMarket `.env` holds `STRIPE_SECRET_KEY`; client gets publishable key via env only.",
    },
    "19.10-payment-intent-route": {
      term: "POST /payments/intent",
      plainEnglish:
        "Server route creating Stripe Payment Intent for pending checkout total.",
      whyItMatters:
        "FreshMarket client calls this before showing card form — amount computed server-side.",
    },
    "19.11-payment-gated-checkout": {
      term: "Payment-gated checkout",
      plainEnglish:
        "Orders stay pending until Stripe confirms payment — no fulfillment on unpaid orders.",
      whyItMatters:
        "FreshMarket vendors should not pack orders that might fail card authorization.",
    },
    "19.12-webhook-handler": {
      term: "Webhook",
      plainEnglish:
        "HTTP callback from Stripe to your server when payment succeeds — authoritative paid signal.",
      whyItMatters:
        "FreshMarket marks orders paid on `payment_intent.succeeded` webhook — not client redirect alone.",
    },
    "19.13-idempotency-and-double-submit": {
      term: "Idempotency key",
      plainEnglish:
        "Unique key on payment requests so retrying network failure does not double-charge.",
      whyItMatters:
        "Shopper double-clicks Pay — FreshMarket must not create two charges for one cart.",
    },
    "19.14-verify-with-test-cards": {
      term: "Stripe test cards",
      plainEnglish:
        "Fake card numbers like 4242… that simulate success, decline, and 3DS in test mode.",
      whyItMatters:
        "FreshMarket gate uses test cards to prove happy path and decline handling.",
    },
    "19.15-recap-and-whats-next": {
      term: "Paid orders",
      plainEnglish:
        "Checkout + Stripe confirms money collected — orders ready for vendor fulfillment UI.",
      whyItMatters:
        "Chapter 20 track orders assumes payment status on order documents is reliable.",
    },
    "19.16-checklist": {
      term: "Webhook",
      plainEnglish:
        "HTTP callback from Stripe to your server when payment succeeds — authoritative paid signal.",
      whyItMatters:
        "FreshMarket marks orders paid on `payment_intent.succeeded` webhook — not client redirect alone.",
    },
  },
  "20-track-orders": {
    "20.01-set-the-scene": {
      term: "Order fulfillment",
      plainEnglish:
        "Everything after payment — vendors pack, update status, customers track delivery.",
      whyItMatters:
        "FreshMarket promise is not just checkout — shoppers need visibility until groceries arrive.",
    },
    "20.02-snapshots-make-ui-easy": {
      term: "Snapshot-driven UI",
      plainEnglish:
        "Order pages render from frozen line data — no live product fetch needed for receipts.",
      whyItMatters:
        "FreshMarket order confirmation shows historical name/price even if product deleted later.",
    },
    "20.03-what-youll-build": {
      term: "Order tracking UI",
      plainEnglish:
        "Customer order list, vendor order inbox, status badges, confirmation page.",
      whyItMatters:
        "Closes the commerce loop — browse, cart, pay, track — for both sides of marketplace.",
    },
    "20.04-where-the-project-is-now": null,
    "20.05-checkout-page": {
      term: "Checkout page UI",
      plainEnglish:
        "Review cart summary, enter payment, submit — last step before order creation.",
      whyItMatters:
        "FreshMarket checkout page wires cart display to Stripe Elements and payment intent.",
    },
    "20.06-order-confirmation-page": {
      term: "Order confirmation",
      plainEnglish:
        "Post-payment thank-you page showing order IDs and summary — reduces buyer anxiety.",
      whyItMatters:
        "FreshMarket shoppers need immediate proof payment worked — before email receipt arrives.",
    },
    "20.07-customer-orders-page": {
      term: "Customer order list",
      plainEnglish:
        "Page listing shopper's orders with status, date, and link to detail.",
      whyItMatters:
        "Returning FreshMarket customers check 'where is my order' here.",
    },
    "20.08-vendor-orders-page": {
      term: "Vendor fulfillment queue",
      plainEnglish:
        "Dashboard page listing incoming orders for vendor's store — pack and ship workflow.",
      whyItMatters:
        "FreshMarket vendors live here during rush hours — status updates drive operations.",
    },
    "20.09-order-status-badge": {
      term: "Order status lifecycle",
      plainEnglish:
        "States like pending, paid, preparing, shipped, delivered — tracked on order document.",
      whyItMatters:
        "FreshMarket badges color-code status — customers and vendors share same vocabulary.",
    },
    "20.10-vendor-update-status": {
      term: "Status transition",
      plainEnglish:
        "Vendor PATCH updating order.status — validated allowed transitions (paid → preparing).",
      whyItMatters:
        "FreshMarket prevents jumping to delivered without preparing — workflow integrity.",
    },
    "20.11-full-commerce-demo": {
      term: "End-to-end commerce demo",
      plainEnglish:
        "Full walkthrough: browse, cart, pay, vendor sees order, customer tracks status.",
      whyItMatters:
        "FreshMarket gate is a recorded demo proving both marketplace sides work together.",
    },
    "20.12-recap-and-whats-next": {
      term: "Complete commerce loop",
      plainEnglish:
        "Browse through track orders works — performance and scale come in Chapters 21–22.",
      whyItMatters:
        "Caching and async jobs optimize what already functions — do not skip this milestone.",
    },
    "20.13-checklist": {
      term: "Order status lifecycle",
      plainEnglish:
        "States like pending, paid, preparing, shipped, delivered — tracked on order document.",
      whyItMatters:
        "FreshMarket badges color-code status — customers and vendors share same vocabulary.",
    },
  },
  "21-cache-and-search": {
    "21.01-set-the-scene": {
      term: "Performance layer",
      plainEnglish:
        "Caching and search indexes that keep FreshMarket fast as catalogue and traffic grow.",
      whyItMatters:
        "Without cache, every shop page hits MongoDB — fine for dev, painful at scale.",
    },
    "21.02-stale-cache-trap": {
      term: "Stale cache trap",
      plainEnglish:
        "Serving outdated product price or stock from cache after vendor updated the real record.",
      whyItMatters:
        "FreshMarket shoppers seeing wrong price destroys trust — invalidation strategy matters.",
    },
    "21.03-what-youll-build": {
      term: "Redis cache layer",
      plainEnglish:
        "In-memory cache for hot catalogue queries plus bust logic on product updates.",
      whyItMatters:
        "FreshMarket shop page under load reads from Redis first — MongoDB on cache miss only.",
    },
    "21.04-ttl-vs-event-invalidation": {
      term: "TTL vs event invalidation",
      plainEnglish:
        "TTL expires cache after fixed time; event invalidation clears cache when data changes.",
      whyItMatters:
        "FreshMarket uses both — TTL safety net plus bust on vendor product save.",
    },
    "21.05-prime-your-thinking": {
      term: "Cache",
      plainEnglish:
        "A fast temporary store of expensive query results so repeat reads do not hammer the database.",
      whyItMatters:
        "FreshMarket caches hot catalogue pages in Redis so browsing stays snappy under load.",
    },
    "21.06-quiz": {
      term: "Cache",
      plainEnglish:
        "A fast temporary store of expensive query results so repeat reads do not hammer the database.",
      whyItMatters:
        "FreshMarket caches hot catalogue pages in Redis so browsing stays snappy under load.",
    },
    "21.07-where-the-project-is-now": null,
    "21.08-redis-connection": {
      term: "Redis",
      plainEnglish:
        "In-memory data store used here for HTTP response cache — key-value with TTL support.",
      whyItMatters:
        "FreshMarket Redis runs alongside MongoDB — separate connection string in env.",
    },
    "21.09-cache-catalogue-middleware": {
      term: "Cache middleware",
      plainEnglish:
        "Express middleware checking Redis before running catalogue handler — return cached JSON if hit.",
      whyItMatters:
        "FreshMarket `/products` gets cache-aside middleware — transparent to client.",
    },
    "21.10-measure-before-after": {
      term: "Cache benchmark",
      plainEnglish:
        "Measuring response time with cache cold vs warm — proves optimization worth complexity.",
      whyItMatters:
        "FreshMarket gate includes before/after ms — data beats guessing cache helped.",
    },
    "21.11-cache-bust-on-product-save": {
      term: "Cache invalidation",
      plainEnglish:
        "Deleting or updating Redis keys when vendor saves product — fresh data on next request.",
      whyItMatters:
        "Wrong prices in cache hurt trust — tie invalidation to product updates and TTLs.",
    },
    "21.12-text-index": {
      term: "MongoDB text index",
      plainEnglish:
        "Database index enabling full-text search on product name and description fields.",
      whyItMatters:
        "FreshMarket search bar queries text index — faster than regex scan on large catalogues.",
    },
    "21.13-explain-query": {
      term: "explain()",
      plainEnglish:
        "MongoDB command showing whether query used index or collection scan — performance X-ray.",
      whyItMatters:
        "FreshMarket search slow? explain() reveals missing index before throwing hardware at it.",
    },
    "21.14-fallback-if-redis-down": {
      term: "Cache degradation",
      plainEnglish:
        "Serving from MongoDB when Redis unavailable — slower but still functional.",
      whyItMatters:
        "FreshMarket shop must not 500 if Redis restarts — graceful fallback to uncached queries.",
    },
    "21.15-recap-and-whats-next": {
      term: "Cached catalogue",
      plainEnglish:
        "Shop API fast with Redis; search indexed — ready for async jobs in Chapter 22.",
      whyItMatters:
        "Background jobs handle email and receipts — cache keeps read path lean.",
    },
    "21.16-checklist": {
      term: "Cache",
      plainEnglish:
        "A fast temporary store of expensive query results so repeat reads do not hammer the database.",
      whyItMatters:
        "FreshMarket caches hot catalogue pages in Redis so browsing stays snappy under load.",
    },
  },
  "22-async-jobs-and-queues": {
    "22.01-set-the-scene": {
      term: "Background jobs",
      plainEnglish:
        "Work done outside the HTTP request — emails, receipts, index updates — so users are not waiting.",
      whyItMatters:
        "FreshMarket checkout response must not block on sending vendor notification email.",
    },
    "22.02-the-sync-trap": {
      term: "The sync trap",
      plainEnglish:
        "Doing slow work inline in the request handler — timeouts and angry users under load.",
      whyItMatters:
        "FreshMarket sending email synchronously during checkout adds seconds to Pay click.",
    },
    "22.03-what-youll-build": {
      term: "Job queue",
      plainEnglish:
        "A to-do list for background work — emails, receipts, search index updates — processed outside the HTTP request.",
      whyItMatters:
        "FreshMarket enqueues work after paid checkout so shoppers are not waiting on slow tasks.",
    },
    "22.04-when-to-queue": {
      term: "Queue eligibility",
      plainEnglish:
        "Rule of thumb: if user does not need result immediately and task can fail/retry, queue it.",
      whyItMatters:
        "FreshMarket queues order confirmation email; does not queue payment authorization.",
    },
    "22.05-bullmq-and-redis": {
      term: "BullMQ",
      plainEnglish:
        "Node.js job queue library backed by Redis — adds jobs, workers process with retries.",
      whyItMatters:
        "FreshMarket uses BullMQ on existing Redis — same infra as cache chapter.",
    },
    "22.06-prime-your-thinking": {
      term: "At-least-once delivery",
      plainEnglish:
        "Jobs may run more than once on failure/retry — handlers must be idempotent.",
      whyItMatters:
        "FreshMarket order email job retry must not send duplicate receipts to shopper.",
    },
    "22.07-quiz": {
      term: "Job queue",
      plainEnglish:
        "A to-do list for background work — emails, receipts, search index updates — processed outside the HTTP request.",
      whyItMatters:
        "FreshMarket enqueues work after paid checkout so shoppers are not waiting on slow tasks.",
    },
    "22.08-where-the-project-is-now": null,
    "22.09-queue-module": {
      term: "Queue module",
      plainEnglish:
        "Server code defining queues, job types, and enqueue helpers — separate from HTTP routes.",
      whyItMatters:
        "FreshMarket checkout calls `orderQueue.add()` — worker process picks up elsewhere.",
    },
    "22.10-worker-process": {
      term: "Worker process",
      plainEnglish:
        "A separate Node process that pulls jobs from the queue and runs them reliably with retries.",
      whyItMatters:
        "BullMQ workers can restart without losing jobs if configured with persistent Redis.",
    },
    "22.11-order-created-job": {
      term: "Order created job",
      plainEnglish:
        "Job payload enqueued when order is paid — triggers email and vendor notification.",
      whyItMatters:
        "FreshMarket webhook enqueues this — HTTP returns fast, worker sends email.",
    },
    "22.12-order-created-processor": {
      term: "Job processor",
      plainEnglish:
        "Worker function that handles one job type — receives payload, performs work, acks or retries.",
      whyItMatters:
        "FreshMarket processor loads order, renders email template, calls mail provider.",
    },
    "22.13-order-status-job": {
      term: "Status change notification",
      plainEnglish:
        "Background job notifying customer when vendor updates order to shipped or delivered.",
      whyItMatters:
        "FreshMarket shoppers get email on status change without blocking vendor's PATCH request.",
    },
    "22.14-retries-and-idempotency": {
      term: "Retry backoff",
      plainEnglish:
        "Re-attempting failed jobs with increasing delay — handles transient mail API outages.",
      whyItMatters:
        "FreshMarket email provider blip should not lose notification forever — retry with limits.",
    },
    "22.15-verify-async-flow": {
      term: "Async flow verification",
      plainEnglish:
        "Place order, confirm HTTP fast, check worker logs/email inbox for side effects.",
      whyItMatters:
        "FreshMarket gate proves jobs run — not just enqueue without processing.",
    },
    "22.16-cache-invalidation-job": {
      term: "Deferred cache bust",
      plainEnglish:
        "Enqueue cache invalidation instead of doing it synchronously on every product write burst.",
      whyItMatters:
        "Vendor bulk-importing products — one invalidation job beats hundreds of Redis deletes inline.",
    },
    "22.17-recap-and-whats-next": {
      term: "Async-ready platform",
      plainEnglish:
        "HTTP path lean; slow work queued — production pattern before deploy in Chapter 23.",
      whyItMatters:
        "Deployed FreshMarket runs API and worker processes — both need restart survival.",
    },
    "22.18-checklist": {
      term: "Worker process",
      plainEnglish:
        "A separate Node process that pulls jobs from the queue and runs them reliably with retries.",
      whyItMatters:
        "BullMQ workers can restart without losing jobs if configured with persistent Redis.",
    },
  },
  "23-deploy": {
    "23.01-set-the-scene": {
      term: "Production deployment",
      plainEnglish:
        "Running FreshMarket on a public URL with real HTTPS, hosted secrets, and monitoring.",
      whyItMatters:
        "Localhost demos do not prove you can ship — deploy is the course finish line.",
    },
    "23.02-secrets-in-git-forever": {
      term: "Secrets in Git forever",
      plainEnglish:
        "Once committed, secrets live in Git history even after deletion — bots scan public repos.",
      whyItMatters:
        "FreshMarket `.env` never commits — rotate keys immediately if accidentally pushed.",
    },
    "23.03-what-youll-build": {
      term: "Deploy pipeline",
      plainEnglish:
        "Build client static assets, run API on host, configure env, smoke test live URL.",
      whyItMatters:
        "FreshMarket deploy chapter produces a link you share in portfolio and interviews.",
    },
    "23.04-vps-vs-paas": {
      term: "VPS vs PaaS",
      plainEnglish:
        "VPS: you manage the server; PaaS: platform handles runtime — trade ops burden vs control.",
      whyItMatters:
        "FreshMarket can deploy to Railway/Render (PaaS) or DigitalOcean droplet (VPS) — choose ops comfort.",
    },
    "23.05-prime-your-thinking": {
      term: "Production environment",
      plainEnglish:
        "The live server customers use — with real HTTPS, hosted secrets, and monitoring.",
      whyItMatters:
        "Deploy chapter moves FreshMarket from localhost to a URL you can share.",
    },
    "23.06-quiz": {
      term: "Production environment",
      plainEnglish:
        "The live server customers use — with real HTTPS, hosted secrets, and monitoring.",
      whyItMatters:
        "Deploy chapter moves FreshMarket from localhost to a URL you can share.",
    },
    "23.07-where-the-project-is-now": null,
    "23.08-production-env-checklist": {
      term: "Production env checklist",
      plainEnglish:
        "List of env vars, secrets, and URLs that must differ from local dev — verified before go-live.",
      whyItMatters:
        "FreshMarket production needs live MongoDB Atlas, Stripe live keys, Cloudinary, Redis URLs.",
    },
    "23.09-build-client-for-production": {
      term: "Production build",
      plainEnglish:
        "Vite `build` output — minified static assets with correct `VITE_API_URL` baked in.",
      whyItMatters:
        "FreshMarket client build must point at production API — not localhost:4000.",
    },
    "23.10-deploy-api": {
      term: "API deployment",
      plainEnglish:
        "Running Node server on host with process manager, env vars, and health check exposed.",
      whyItMatters:
        "FreshMarket API must survive restarts — PM2 or platform health checks keep it alive.",
    },
    "23.11-domain-and-https": {
      term: "HTTPS",
      plainEnglish:
        "Encrypted HTTP — required for secure cookies, Stripe, and browser trust on public sites.",
      whyItMatters:
        "FreshMarket production URL must be https:// — Let's Encrypt or platform TLS handles certs.",
    },
    "23.12-deploy-client": {
      term: "Static hosting",
      plainEnglish:
        "Serving Vite build output from CDN or static host — Netlify, Vercel, or nginx.",
      whyItMatters:
        "FreshMarket React app is static files after build — separate deploy from API server.",
    },
    "23.13-smoke-test-production": {
      term: "Smoke test",
      plainEnglish:
        "Quick live checks — health, login, browse — confirming deploy succeeded before announcing.",
      whyItMatters:
        "FreshMarket smoke test catches wrong API URL or missing env before users hit errors.",
    },
    "23.14-restart-survival-test": {
      term: "Restart survival",
      plainEnglish:
        "Reboot server or redeploy — confirm app reconnects MongoDB, Redis, and serves traffic.",
      whyItMatters:
        "FreshMarket production must recover from deploys and crashes without manual intervention.",
    },
    "23.15-recap-and-whats-next": {
      term: "Live FreshMarket",
      plainEnglish:
        "Public URL running full marketplace — portfolio centerpiece and Chapter 99 closure.",
      whyItMatters:
        "You built and deployed a real multi-vendor product — document it for interviews.",
    },
    "23.16-checklist": {
      term: "Production environment",
      plainEnglish:
        "The live server customers use — with real HTTPS, hosted secrets, and monitoring.",
      whyItMatters:
        "Deploy chapter moves FreshMarket from localhost to a URL you can share.",
    },
  },
  "99-closing": {
    "99.01-ship-it": {
      term: "Shipping mindset",
      plainEnglish:
        "Prioritizing working software and learning over perfect code — done beats perfect.",
      whyItMatters:
        "FreshMarket on a live URL beats unfinished localhost perfection for your career story.",
    },
    "99.02-document-it": {
      term: "Technical narrative",
      plainEnglish:
        "Written explanation of architecture, trade-offs, and demo steps — README, blog, or portfolio case study.",
      whyItMatters:
        "Interviewers ask why MongoDB and how split checkout works — document while memory is fresh.",
    },
    "99.03-bar-raiser-and-evaluation": {
      term: "Portfolio project",
      plainEnglish:
        "A deployed, documented full-stack app demonstrating skills at hireable junior/mid level.",
      whyItMatters:
        "FreshMarket checked all boxes — auth, payments, multi-tenant, deploy — bar-raiser ready.",
    },
  },
};
