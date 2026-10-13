/** Remaining module BigWordAlert mappings (modules 05–99). */
export const REMAINING_MODULE_ALERTS = {
  "05-data-model-and-seed": {
    "05.01-set-the-scene": {
      term: "Mongoose model",
      plainEnglish:
        "A JavaScript schema class that defines document shape, validation, and MongoDB collection mapping.",
      whyItMatters:
        "Chapter 5 turns your ERD into typed models — the foundation every API route queries against.",
    },
    "05.02-the-denormalisation-trap": {
      term: "Denormalisation",
      plainEnglish:
        "Storing copied data in multiple places so reads are faster, even though updates become slightly harder.",
      whyItMatters:
        "Order line items snapshot product price at purchase time — that is intentional denormalisation for correct receipts.",
    },
    "05.03-what-youll-build": {
      term: "Domain model layer",
      plainEnglish:
        "The set of Mongoose schemas representing FreshMarket entities — users, stores, products, carts, orders.",
      whyItMatters:
        "Every API chapter from auth to checkout reads and writes through these models.",
    },
    "05.04-ownership-chain": {
      term: "Resource ownership",
      plainEnglish:
        "The chain linking data to the user who may edit it — vendor owns store, store owns products.",
      whyItMatters:
        "Authorization in Chapter 8 checks this chain — a vendor must not edit another vendor's products.",
    },
    "05.05-grocery-domain-fields": {
      term: "Domain-specific fields",
      plainEnglish:
        "Product attributes meaningful in grocery — unit (kg/litre), organic flag, expiry — not generic e-commerce fluff.",
      whyItMatters:
        "FreshMarket product cards show weight and dietary tags because the schema includes grocery-realistic fields.",
    },
    "05.06-prime-your-thinking": {
      term: "Seed script",
      plainEnglish:
        "A repeatable script that fills the database with realistic test data so you are never clicking through empty screens.",
      whyItMatters:
        "FreshMarket's seed vendors, stores, and products let you demo the marketplace before any UI exists.",
    },
    "05.07-quiz": {
      term: "Seed script",
      plainEnglish:
        "A repeatable script that fills the database with realistic test data so you are never clicking through empty screens.",
      whyItMatters:
        "FreshMarket's seed vendors, stores, and products let you demo the marketplace before any UI exists.",
    },
    "05.08-where-the-project-is-now": null,
    "05.09-scaffold-models-folder": {
      term: "Models directory",
      plainEnglish:
        "A server folder holding one file per Mongoose model — keeps schemas discoverable and importable.",
      whyItMatters:
        "FreshMarket's `models/` folder is imported by routes, seed script, and auth — one home for schemas.",
    },
    "05.10-user-and-profile-models": {
      term: "User role enum",
      plainEnglish:
        "A fixed list of roles (customer, vendor, admin) stored on the user document for authorization checks.",
      whyItMatters:
        "FreshMarket routes vendors to dashboards and customers to shop pages based on this role field.",
    },
    "05.11-store-model": {
      term: "One store per vendor",
      plainEnglish:
        "Business rule that each vendor account maps to exactly one storefront in the marketplace.",
      whyItMatters:
        "FreshMarket's store model enforces this — simplifying onboarding and vendor dashboard routing.",
    },
    "05.12-product-model": {
      term: "Product catalogue record",
      plainEnglish:
        "The document listing what a vendor sells — name, price, stock, images, and publish status.",
      whyItMatters:
        "Browse, cart, and checkout all read product documents — this is the core inventory entity.",
    },
    "05.13-cart-and-order-models": {
      term: "Cart vs order",
      plainEnglish:
        "Cart is mutable pre-checkout intent; order is an immutable record created at payment — different lifecycles.",
      whyItMatters:
        "FreshMarket clears the cart after checkout but keeps orders forever for receipts and vendor fulfillment.",
    },
    "05.14-seed-script-scaffold": {
      term: "Idempotent seeding",
      plainEnglish:
        "Running the seed script multiple times without duplicating users or blowing away manual test data.",
      whyItMatters:
        "FreshMarket's seed upserts known test accounts so `npm run seed` is safe during development.",
    },
    "05.15-run-seed-and-inspect": {
      term: "MongoDB Compass",
      plainEnglish:
        "A GUI to browse collections and documents — inspect seed output without writing queries.",
      whyItMatters:
        "After seeding, you verify vendors, stores, and products exist before building API routes.",
    },
    "05.16-draw-final-erd": {
      term: "Final ERD",
      plainEnglish:
        "Updated entity diagram reflecting actual implemented models — design doc synced with code.",
      whyItMatters:
        "FreshMarket's committed ERD is interview-ready proof you designed before and after implementation.",
    },
    "05.17-recap-and-whats-next": {
      term: "Populated database",
      plainEnglish:
        "MongoDB with models registered and seed data loaded — ready for API handlers to query.",
      whyItMatters:
        "Chapter 6 adds auth routes that create and look up User documents — models must exist first.",
    },
    "05.18-checklist": {
      term: "Denormalisation",
      plainEnglish:
        "Storing copied data in multiple places so reads are faster, even though updates become slightly harder.",
      whyItMatters:
        "Order line items snapshot product price at purchase time — that is intentional denormalisation for correct receipts.",
    },
  },
  "06-authentication-api": {
    "06.01-set-the-scene": {
      term: "Authentication",
      plainEnglish:
        "Proving who a user is — typically via email/password login that returns a token or session.",
      whyItMatters:
        "FreshMarket cannot know which cart or store belongs to whom until auth identifies the caller.",
    },
    "06.02-why-auth-matters": {
      term: "Identity boundary",
      plainEnglish:
        "The line between anonymous browsing and logged-in actions — cart, checkout, vendor dashboard.",
      whyItMatters:
        "Without auth, every shopper would share one cart and every vendor could edit every store.",
    },
    "06.03-what-youll-build": {
      term: "Auth API module",
      plainEnglish:
        "Server routes for register, login, verify OTP, refresh token — plus middleware to protect other routes.",
      whyItMatters:
        "FreshMarket's auth module is the security foundation every vendor and customer route builds on.",
    },
    "06.04-sessions-vs-jwt": {
      term: "Stateless JWT",
      plainEnglish:
        "A signed token the client sends on each request — server validates signature without storing session in memory.",
      whyItMatters:
        "FreshMarket uses JWTs so the API scales without a central session store — good fit for a Node + React split.",
    },
    "06.05-password-hashing": {
      term: "Password hashing",
      plainEnglish:
        "One-way scrambling of passwords before storage so a database leak does not expose raw passwords.",
      whyItMatters:
        "You never store or log plaintext passwords — bcrypt turns them into verifiable but irreversible hashes.",
    },
    "06.06-what-a-jwt-is": {
      term: "JSON Web Token (JWT)",
      plainEnglish:
        "A compact signed string encoding user id and expiry — sent in the Authorization header on API calls.",
      whyItMatters:
        "FreshMarket access tokens prove identity for cart and vendor routes without server-side session lookup.",
    },
    "06.07-prime-your-thinking": {
      term: "Access vs refresh token",
      plainEnglish:
        "Short-lived access token for API calls; longer refresh token to get new access tokens without re-login.",
      whyItMatters:
        "FreshMarket access tokens expire in minutes; refresh tokens keep shoppers logged in across tab sessions.",
    },
    "06.08-quiz": {
      term: "Password hashing",
      plainEnglish:
        "One-way scrambling of passwords before storage so a database leak does not expose raw passwords.",
      whyItMatters:
        "You never store or log plaintext passwords — bcrypt turns them into verifiable but irreversible hashes.",
    },
    "06.09-where-the-project-is-now": null,
    "06.10-scaffold-auth-module": {
      term: "Auth module folder",
      plainEnglish:
        "Vertical slice containing auth routes, controllers, services, and middleware — feature colocation.",
      whyItMatters:
        "FreshMarket keeps register/login/refresh together so auth logic does not scatter across the server.",
    },
    "06.11-wire-auth-routes": {
      term: "Route mounting",
      plainEnglish:
        "Attaching a router module to a URL prefix like `/api/auth` in the main Express app.",
      whyItMatters:
        "FreshMarket mounts auth at `/api/auth/register`, `/api/auth/login` — predictable URLs for the client.",
    },
    "06.12-register-handler": {
      term: "User registration",
      plainEnglish:
        "Creating a new account — validate input, hash password, save user, optionally send OTP.",
      whyItMatters:
        "FreshMarket vendors and customers share the same register flow; role selection branches their experience.",
    },
    "06.13-login-handler": {
      term: "Credential verification",
      plainEnglish:
        "Comparing submitted password to stored hash and rejecting login if either email or password is wrong.",
      whyItMatters:
        "FreshMarket returns the same error for bad email and bad password — prevents account enumeration.",
    },
    "06.14-access-token": {
      term: "Access token",
      plainEnglish:
        "Short-lived JWT sent on every authenticated API request — expires quickly for security.",
      whyItMatters:
        "FreshMarket attaches access tokens in the Authorization header for cart, store, and product routes.",
    },
    "06.15-refresh-token": {
      term: "Refresh token",
      plainEnglish:
        "Longer-lived token used only to obtain new access tokens — stored more securely than access tokens.",
      whyItMatters:
        "Shoppers stay logged in on FreshMarket without re-entering password every fifteen minutes.",
    },
    "06.16-otp-verification": {
      term: "One-time password (OTP)",
      plainEnglish:
        "A short code sent by email to confirm the user owns the address before activating the account.",
      whyItMatters:
        "FreshMarket requires OTP after register — reduces fake vendor accounts and spam signups.",
    },
    "06.17-auth-middleware": {
      term: "Auth middleware",
      plainEnglish:
        "Express middleware that validates JWT, attaches user to request, or returns 401 before the handler runs.",
      whyItMatters:
        "Every protected FreshMarket route uses the same middleware — no copy-pasted token parsing.",
    },
    "06.18-test-with-curl": {
      term: "curl authentication test",
      plainEnglish:
        "Using curl with `-H 'Authorization: Bearer ...'` to verify register/login/token flow without the UI.",
      whyItMatters:
        "Testing auth with curl isolates server bugs from client token storage issues.",
    },
    "06.19-recap-and-whats-next": {
      term: "Authenticated API",
      plainEnglish:
        "Server that can register users, issue tokens, and reject unauthenticated requests on protected routes.",
      whyItMatters:
        "Chapter 7 wires the React client to store tokens; Chapter 8 adds authorization on top of identity.",
    },
    "06.20-checklist": {
      term: "JSON Web Token (JWT)",
      plainEnglish:
        "A compact signed string encoding user id and expiry — sent in the Authorization header on API calls.",
      whyItMatters:
        "FreshMarket access tokens prove identity for cart and vendor routes without server-side session lookup.",
    },
  },
  "07-login-and-registration": {
    "07.01-set-the-scene": {
      term: "Client-side auth",
      plainEnglish:
        "The React half of authentication — forms, token storage, and attaching credentials to API calls.",
      whyItMatters:
        "Server auth is useless if the browser loses tokens on refresh or sends them insecurely.",
    },
    "07.02-why-token-storage-matters": {
      term: "Token storage",
      plainEnglish:
        "Where the browser keeps JWTs — memory, sessionStorage, or httpOnly cookies — each with different XSS and CSRF trade-offs.",
      whyItMatters:
        "FreshMarket's client must store tokens safely and attach them to API calls without leaking them in URLs or logs.",
    },
    "07.03-what-youll-build": {
      term: "Auth UI flow",
      plainEnglish:
        "Register, OTP verify, login pages plus context/hook that exposes user state to the component tree.",
      whyItMatters:
        "FreshMarket shoppers and vendors enter through the same auth screens — role determines where they land next.",
    },
    "07.04-where-tokens-live": {
      term: "localStorage trade-off",
      plainEnglish:
        "Browser storage that survives refresh but is readable by any JavaScript — vulnerable to XSS attacks.",
      whyItMatters:
        "FreshMarket may use localStorage for access tokens in this course — understand the XSS risk you accept.",
    },
    "07.05-the-401-retry-loop": {
      term: "401 retry loop",
      plainEnglish:
        "When an API returns 401 Unauthorized, the client tries to refresh the token once, then retries the original request.",
      whyItMatters:
        "Shoppers should not be kicked to login mid-checkout just because an access token expired seconds ago.",
    },
    "07.06-prime-your-thinking": {
      term: "XSS",
      plainEnglish:
        "Cross-site scripting — attacker injects JavaScript that steals tokens from browser storage.",
      whyItMatters:
        "Token storage choice in FreshMarket is partly a bet on how well you sanitize user-generated content later.",
    },
    "07.07-quiz": {
      term: "401 retry loop",
      plainEnglish:
        "When an API returns 401 Unauthorized, the client tries to refresh the token once, then retries the original request.",
      whyItMatters:
        "Shoppers should not be kicked to login mid-checkout just because an access token expired seconds ago.",
    },
    "07.08-where-the-project-is-now": null,
    "07.09-scaffold-auth-pages": {
      term: "Auth route group",
      plainEnglish:
        "Public pages (/register, /login, /verify-otp) outside the protected layout — no token required.",
      whyItMatters:
        "FreshMarket keeps auth pages separate from shop and vendor dashboard routes.",
    },
    "07.10-auth-context-or-hook": {
      term: "React Context",
      plainEnglish:
        "Shared state (user, tokens, login/logout) available to any component without prop drilling.",
      whyItMatters:
        "FreshMarket's header shows login vs avatar based on auth context — one source of truth for session.",
    },
    "07.11-register-page": {
      term: "Form validation",
      plainEnglish:
        "Client-side checks (email format, password length) before submitting to the server — faster feedback.",
      whyItMatters:
        "FreshMarket register page catches obvious errors before a round-trip to `/api/auth/register`.",
    },
    "07.12-verify-otp-page": {
      term: "OTP input UX",
      plainEnglish:
        "A dedicated screen for entering the email verification code — often with auto-focus and paste support.",
      whyItMatters:
        "FreshMarket blocks vendor onboarding until OTP succeeds — this page is the gate.",
    },
    "07.13-login-page": {
      term: "Login form",
      plainEnglish:
        "Email and password fields that POST credentials and store returned tokens on success.",
      whyItMatters:
        "Returning FreshMarket users land here — errors must be clear without revealing whether email exists.",
    },
    "07.14-api-interceptor": {
      term: "Request interceptor",
      plainEnglish:
        "Middleware in the API client that attaches Authorization header to every outgoing request automatically.",
      whyItMatters:
        "FreshMarket components call `api.get('/cart')` without manually adding tokens — interceptor handles it.",
    },
    "07.15-protected-route-wrapper": {
      term: "Protected route",
      plainEnglish:
        "A wrapper component that redirects to login if no valid token — guards vendor dashboard and cart.",
      whyItMatters:
        "FreshMarket `/vendor/*` routes render nothing until auth context confirms a logged-in vendor.",
    },
    "07.16-verify-in-browser": {
      term: "Browser DevTools Network tab",
      plainEnglish:
        "Inspecting HTTP requests in the browser to confirm tokens are sent and responses are correct.",
      whyItMatters:
        "FreshMarket auth debugging starts in Network — see 401, refresh, retry without guessing.",
    },
    "07.17-recap-and-whats-next": {
      term: "Logged-in client",
      plainEnglish:
        "React app that persists session, protects routes, and sends tokens on API calls.",
      whyItMatters:
        "Chapter 8 adds authorization — proving identity is done; now you restrict what each role can do.",
    },
    "07.18-checklist": {
      term: "Token storage",
      plainEnglish:
        "Where the browser keeps JWTs — memory, sessionStorage, or httpOnly cookies — each with different XSS and CSRF trade-offs.",
      whyItMatters:
        "FreshMarket's client must store tokens safely and attach them to API calls without leaking them in URLs or logs.",
    },
  },
  "08-authorization-and-isolation": {
    "08.01-set-the-scene": {
      term: "Authorization",
      plainEnglish:
        "Deciding what an authenticated user is allowed to do — separate from proving who they are.",
      whyItMatters:
        "A logged-in FreshMarket vendor must not edit another vendor's store — that is authorization, not auth.",
    },
    "08.02-idor-and-marketplaces": {
      term: "IDOR",
      plainEnglish:
        "Insecure Direct Object Reference — changing an ID in the URL to access someone else's data.",
      whyItMatters:
        "FreshMarket must verify product.storeId matches the requesting vendor — otherwise any vendor edits any catalogue.",
    },
    "08.03-what-youll-build": {
      term: "RBAC + ownership",
      plainEnglish:
        "Role-based checks (vendor vs customer) plus resource ownership (this store belongs to this user).",
      whyItMatters:
        "FreshMarket combines role middleware and ownership helpers on every mutating vendor route.",
    },
    "08.04-authn-vs-authz": {
      term: "Authentication vs authorization",
      plainEnglish:
        "Authentication proves who you are; authorization decides what you are allowed to do.",
      whyItMatters:
        "A logged-in vendor is authenticated — but only their own products should be editable. That check is authorization.",
    },
    "08.05-rbac-and-ownership": {
      term: "Role-based access control",
      plainEnglish:
        "Permissions tied to user role — vendors manage stores, customers browse and buy, admins oversee all.",
      whyItMatters:
        "FreshMarket's `requireRole('vendor')` middleware blocks customers from product create routes.",
    },
    "08.06-prime-your-thinking": {
      term: "Defense in depth",
      plainEnglish:
        "Multiple layers of checks — middleware, service logic, database query filters — not one gate only.",
      whyItMatters:
        "FreshMarket filters products by owner in the query even if middleware is bypassed by a bug.",
    },
    "08.07-quiz": {
      term: "Authentication vs authorization",
      plainEnglish:
        "Authentication proves who you are; authorization decides what you are allowed to do.",
      whyItMatters:
        "A logged-in vendor is authenticated — but only their own products should be editable. That check is authorization.",
    },
    "08.08-authorization-matrix": {
      term: "Authorization matrix",
      plainEnglish:
        "A table mapping roles × resources × allowed actions — design doc before coding guards.",
      whyItMatters:
        "FreshMarket's matrix drives which routes get `requireRole` vs ownership checks.",
    },
    "08.09-where-the-project-is-now": null,
    "08.10-require-role-middleware": {
      term: "Role middleware",
      plainEnglish:
        "Express middleware that returns 403 if the user's role is not in the allowed list.",
      whyItMatters:
        "FreshMarket vendor routes chain `authenticate` then `requireRole('vendor')` before handlers run.",
    },
    "08.11-ownership-helper": {
      term: "Ownership helper",
      plainEnglish:
        "A function that loads a resource and confirms `resource.ownerId === req.user.id` — or throws 403.",
      whyItMatters:
        "FreshMarket's `assertStoreOwner(storeId, userId)` prevents cross-vendor store edits.",
    },
    "08.12-apply-to-store-routes": {
      term: "Route-level guard",
      plainEnglish:
        "Applying auth and ownership middleware to specific route definitions — not globally on all routes.",
      whyItMatters:
        "FreshMarket public browse routes stay open; PATCH /stores/:id requires vendor ownership.",
    },
    "08.13-test-idor-with-two-vendors": {
      term: "IDOR penetration test",
      plainEnglish:
        "Logging in as vendor A and attempting to mutate vendor B's resources — expecting 403.",
      whyItMatters:
        "FreshMarket's gate requires proof that cross-vendor product edit returns forbidden, not success.",
    },
    "08.14-recap-and-whats-next": {
      term: "Isolated tenant data",
      plainEnglish:
        "Each vendor's stores and products are accessible only to that vendor — multi-tenant isolation.",
      whyItMatters:
        "Chapter 9 builds store API routes assuming ownership guards are already in place.",
    },
    "08.15-checklist": {
      term: "Authentication vs authorization",
      plainEnglish:
        "Authentication proves who you are; authorization decides what you are allowed to do.",
      whyItMatters:
        "A logged-in vendor is authenticated — but only their own products should be editable. That check is authorization.",
    },
  },
  "09-vendor-store-api": {
    "09.01-set-the-scene": {
      term: "Vendor storefront",
      plainEnglish:
        "The public-facing shop profile a vendor creates — name, description, hours, delivery zone.",
      whyItMatters:
        "FreshMarket shoppers discover vendors through store pages — this API creates and updates that identity.",
    },
    "09.02-one-store-per-vendor": {
      term: "Store uniqueness constraint",
      plainEnglish:
        "Database or application rule ensuring each vendor user has at most one store document.",
      whyItMatters:
        "FreshMarket onboarding checks `GET /stores/me` — if null, redirect to store setup.",
    },
    "09.03-what-youll-build": {
      term: "Stores REST API",
      plainEnglish:
        "CRUD routes for vendor stores — create, read own store, update — with validation and auth.",
      whyItMatters:
        "Chapter 10's onboarding UI calls these routes; Chapter 11 adds products under the store.",
    },
    "09.04-store-fields": {
      term: "Store schema fields",
      plainEnglish:
        "The data a storefront needs — name, slug, description, address, isPublished — beyond just an ID.",
      whyItMatters:
        "FreshMarket shop pages and vendor settings display these fields — design them for real grocery vendors.",
    },
    "09.05-prime-your-thinking": {
      term: "RESTful resource",
      plainEnglish:
        "An API organized around nouns (stores, products) with HTTP verbs (GET, POST, PATCH, DELETE) describing actions.",
      whyItMatters:
        "Vendor store routes follow predictable patterns so the client and future mobile apps can integrate without surprises.",
    },
    "09.06-quiz": {
      term: "RESTful resource",
      plainEnglish:
        "An API organized around nouns (stores, products) with HTTP verbs (GET, POST, PATCH, DELETE) describing actions.",
      whyItMatters:
        "Vendor store routes follow predictable patterns so the client and future mobile apps can integrate without surprises.",
    },
    "09.07-where-the-project-is-now": null,
    "09.08-scaffold-stores-module": {
      term: "Feature module",
      plainEnglish:
        "A folder grouping routes, controller, and service for one domain — stores in this chapter.",
      whyItMatters:
        "FreshMarket's `stores/` module is the pattern repeated for products, cart, and orders.",
    },
    "09.09-create-store-route": {
      term: "POST /stores",
      plainEnglish:
        "Endpoint to create a new store document linked to the authenticated vendor user.",
      whyItMatters:
        "FreshMarket onboarding completes when this route succeeds — vendor can then add products.",
    },
    "09.10-get-my-store-route": {
      term: "GET /stores/me",
      plainEnglish:
        "Returns the current vendor's store without exposing an ID in the URL — convenience and security.",
      whyItMatters:
        "FreshMarket client calls `/stores/me` on dashboard load — no guessing store IDs.",
    },
    "09.11-update-store-route": {
      term: "PATCH semantics",
      plainEnglish:
        "Partial update — send only changed fields, not the entire document — standard for edit forms.",
      whyItMatters:
        "FreshMarket store settings form PATCHes name and hours without resending unchanged fields.",
    },
    "09.12-test-with-curl": {
      term: "Authenticated curl",
      plainEnglish:
        "Testing protected routes with `-H 'Authorization: Bearer <token>'` and JSON body flags.",
      whyItMatters:
        "Store API bugs are faster to isolate with curl before debugging the React onboarding form.",
    },
    "09.13-recap-and-whats-next": {
      term: "Store persistence",
      plainEnglish:
        "Vendors can create and update their storefront in MongoDB through authenticated API routes.",
      whyItMatters:
        "Chapter 10 builds the UI; Chapter 11 attaches products to these store documents.",
    },
    "09.14-checklist": {
      term: "RESTful resource",
      plainEnglish:
        "An API organized around nouns (stores, products) with HTTP verbs (GET, POST, PATCH, DELETE) describing actions.",
      whyItMatters:
        "Vendor store routes follow predictable patterns so the client and future mobile apps can integrate without surprises.",
    },
  },
  "10-open-your-shop": {
    "10.01-set-the-scene": {
      term: "Vendor onboarding",
      plainEnglish:
        "The first-run flow guiding a new vendor from signup to a published store with products.",
      whyItMatters:
        "FreshMarket cannot sell groceries until vendors complete onboarding — this chapter builds that path.",
    },
    "10.02-onboarding-as-a-gate": {
      term: "Onboarding gate",
      plainEnglish:
        "Blocking vendor dashboard access until required setup steps (store created, profile complete) are done.",
      whyItMatters:
        "FreshMarket redirects `/vendor` to `/vendor/setup` if no store exists — prevents empty storefronts.",
    },
    "10.03-what-youll-build": {
      term: "Vendor portal UI",
      plainEnglish:
        "Layout, setup wizard, and settings pages for vendors to manage their FreshMarket presence.",
      whyItMatters:
        "This is the seller half of the marketplace — distinct from the customer shop experience.",
    },
    "10.04-prime-your-thinking": {
      term: "Conditional routing",
      plainEnglish:
        "React routes that redirect based on state — e.g. no store yet means go to setup, not dashboard.",
      whyItMatters:
        "FreshMarket vendor navigation depends on whether `stores/me` returned data.",
    },
    "10.05-where-the-project-is-now": null,
    "10.06-scaffold-vendor-layout": {
      term: "Vendor layout shell",
      plainEnglish:
        "Shared sidebar, header, and outlet for all `/vendor/*` pages — consistent dashboard chrome.",
      whyItMatters:
        "Product list, create product, and settings share one layout — shoppers never see this shell.",
    },
    "10.07-store-setup-page": {
      term: "Setup wizard",
      plainEnglish:
        "A focused form for first-time store creation — name, description, minimum fields to go live.",
      whyItMatters:
        "FreshMarket vendors complete this once; settings page handles edits later.",
    },
    "10.08-store-settings-page": {
      term: "Settings form",
      plainEnglish:
        "Edit page for existing store fields — pre-filled from API, PATCH on save.",
      whyItMatters:
        "Vendors update delivery hours and description here without re-running full onboarding.",
    },
    "10.09-onboarding-redirect": {
      term: "Redirect guard",
      plainEnglish:
        "Client logic that sends users to the right page based on auth role and setup completion.",
      whyItMatters:
        "FreshMarket login sends vendors to setup or dashboard depending on store existence.",
    },
    "10.10-verify-onboarding-flow": {
      term: "User journey test",
      plainEnglish:
        "Walking through register → verify → login → setup → dashboard as a new vendor end to end.",
      whyItMatters:
        "FreshMarket gate requires demo of a new vendor account reaching a created store.",
    },
    "10.11-recap-and-whats-next": {
      term: "Onboarding complete",
      plainEnglish:
        "Vendor has account, verified email, and store document — ready to add products in Chapter 11–12.",
      whyItMatters:
        "Product API and dashboard assume store exists — onboarding is the prerequisite path.",
    },
    "10.12-checklist": {
      term: "Onboarding flow",
      plainEnglish:
        "The guided path from vendor signup to a created store — gates dashboard until complete.",
      whyItMatters:
        "FreshMarket's marketplace quality depends on vendors finishing setup before listing products.",
    },
  },
};
