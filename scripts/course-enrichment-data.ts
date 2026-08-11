/**
 * Course content enrichment data for the FreshMarket multi-vendor grocery
 * marketplace curriculum. Used by content tooling to inject BigWord alerts,
 * mandatory reads, interesting reads, real-world events, and article breaks.
 */

export type BigWord = {
  term: string;
  plainEnglish: string;
  whyItMatters?: string;
};

export type MandatoryRead = {
  title: string;
  href: string;
  source?: string;
  summary: string;
  readMinutes?: number;
};

export type Interesting = {
  title: string;
  hook: string;
  body: string;
  readMinutes: number;
};

export type RealWorld = {
  title: string;
  when: string;
  summary: string;
  lesson: string;
};

export type Article = {
  title: string;
  subtitle?: string;
  readMinutes: number;
  body: string;
};

export type ModuleEnrichment = {
  moduleNum: number;
  slug: string;
  bigWords: BigWord[];
  mandatoryRead: MandatoryRead;
  interesting: Interesting;
  realWorld: RealWorld;
  articleBreak?: Article;
};

export const MODULE_ENRICHMENT: ModuleEnrichment[] = [
  {
    moduleNum: 1,
    slug: "introduction",
    bigWords: [
      {
        term: "Multi-vendor marketplace",
        plainEnglish:
          "One app where many independent sellers list products and customers buy from several shops in a single checkout.",
        whyItMatters:
          "FreshMarket is not a single grocery store — you are building the platform that connects local vendors and shoppers.",
      },
      {
        term: "Full-stack product",
        plainEnglish:
          "Software with a visible front end (what users click) and a hidden back end (API, database, payments) working together.",
        whyItMatters:
          "Every chapter in this course touches both sides — you will always know how a screen change connects to server logic.",
      },
    ],
    mandatoryRead: {
      title: "Getting started with the web",
      href: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web",
      source: "MDN",
      summary:
        "MDN's plain-English overview of how browsers, servers, and pages fit together. Read this once so later chapters about APIs and React feel grounded.",
      readMinutes: 10,
    },
    interesting: {
      title: "Why grocery marketplaces are harder than they look",
      hook: "A tomato has a shelf life. A T-shirt does not.",
      body:
        "Grocery platforms must handle perishability, weight-based pricing, stock that changes hourly, and orders split across multiple vendors — all while feeling as simple as adding items to a basket. FreshMarket teaches you those trade-offs on purpose: the domain forces real engineering decisions, not toy CRUD.",
      readMinutes: 4,
    },
    realWorld: {
      title: "Instacart scales local grocery delivery",
      when: "2012–present",
      summary:
        "Instacart connected independent grocery stores to shoppers through a single app, handling inventory sync, delivery logistics, and multi-store baskets at national scale.",
      lesson:
        "Your FreshMarket build starts smaller, but the same pattern applies: one customer experience, many vendor backends, and careful data ownership.",
    },
  },
  {
    moduleNum: 2,
    slug: "project-skeleton",
    bigWords: [
      {
        term: "Monorepo layout",
        plainEnglish:
          "One Git repository that holds both the client app and the server app, usually in separate top-level folders.",
        whyItMatters:
          "FreshMarket keeps `client/` and `server/` side by side so you can run and deploy them together while keeping concerns separate.",
      },
      {
        term: "Health check route",
        plainEnglish:
          "A tiny API endpoint that returns OK so you can prove the server is alive before building real features.",
        whyItMatters:
          "Your first end-to-end win is the React app calling `/health` — if that works, networking and CORS are probably configured correctly.",
      },
    ],
    mandatoryRead: {
      title: "Introduction to client-side JavaScript frameworks",
      href: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Frameworks_libraries/Introduction",
      source: "MDN",
      summary:
        "Short MDN primer on why frameworks like React exist and what problems they solve. Helps you understand why the client is a separate app from Express.",
      readMinutes: 12,
    },
    interesting: {
      title: "Colocate by feature vs organise by type",
      hook: "Folders named `controllers/` age badly when products multiply.",
      body:
        "Many teams start with layer-first folders (all routes together, all models together). Feature-first layouts group everything for one capability — auth, cart, checkout — in one place. FreshMarket uses module folders on the server so each capability stays findable as the codebase grows.",
      readMinutes: 5,
    },
    realWorld: {
      title: "Shopify's modular commerce platform",
      when: "2006–present",
      summary:
        "Shopify grew from a single-product store builder into a platform with separate admin, storefront, and API surfaces — all coordinated through clear project boundaries.",
      lesson:
        "Starting with a deliberate folder skeleton prevents painful renames later when vendor, cart, and payment code all need room to grow.",
    },
    articleBreak: {
      title: "Before you write feature code: how FreshMarket is wired",
      subtitle: "A five-minute map of client, server, and the first request",
      readMinutes: 6,
      body:
        "FreshMarket runs as two applications: a Vite + React client and an Express + Node server. The client never talks to MongoDB directly — it calls HTTP routes on the server, and the server owns all data access.\n\n" +
        "Your skeleton chapter exists to prove that wiring works. When the home page shows a health check response, you have confirmed: the server listens on a port, the client knows that URL, CORS allows the browser request, and JSON travels both ways.\n\n" +
        "Every later chapter plugs into this same pattern. Auth adds protected routes. The catalogue adds public read routes. Checkout adds payment routes. The skeleton is boring on purpose — boring infrastructure is what lets exciting features ship safely.",
    },
  },
  {
    moduleNum: 3,
    slug: "why-mongodb",
    bigWords: [
      {
        term: "Document database",
        plainEnglish:
          "A database that stores records as flexible JSON-like documents instead of rigid rows and columns.",
        whyItMatters:
          "Grocery products carry varied fields — weight, unit, allergens — that fit naturally in MongoDB documents.",
      },
      {
        term: "Schema flexibility",
        plainEnglish:
          "The ability to add or shape fields on records without running a migration for every small change.",
        whyItMatters:
          "Vendor catalogs evolve quickly; document models let you iterate on product shape during early development.",
      },
    ],
    mandatoryRead: {
      title: "MongoDB manual — Introduction",
      href: "https://www.mongodb.com/docs/manual/introduction/",
      source: "MongoDB",
      summary:
        "Official overview of how MongoDB stores documents, collections, and databases. Read the core concepts section before you wire the driver in the next chapter.",
      readMinutes: 15,
    },
    interesting: {
      title: "When SQL still wins",
      hook: "MongoDB is a choice, not a religion.",
      body:
        "Financial ledger entries, strict inventory reconciliation across warehouses, and complex reporting joins often favour PostgreSQL. FreshMarket picks MongoDB because product catalogs are document-shaped and read-heavy — but knowing when relational models win makes you a stronger engineer.",
      readMinutes: 4,
    },
    realWorld: {
      title: "Walmart's polyglot data strategy",
      when: "2010s–present",
      summary:
        "Large retailers run multiple database technologies — relational systems for transactions and accounting, document or search stores for catalogs and recommendations.",
      lesson:
        "Choosing MongoDB for FreshMarket is a domain-driven decision. Document the trade-off so future you can defend it in an interview.",
    },
    articleBreak: {
      title: "Embedding vs referencing: the grocery catalog decision",
      subtitle: "How FreshMarket thinks about product data before schemas exist",
      readMinutes: 8,
      body:
        "In a grocery marketplace, a product belongs to a store, and a store belongs to a vendor. You can embed store details inside each product document for fast reads, or store IDs and fetch related documents when needed.\n\n" +
        "Embedding makes catalogue pages fast — one query returns product plus store name. Referencing keeps updates clean — change a store name once, not on thousands of products.\n\n" +
        "FreshMarket uses a hybrid: embed small, stable snapshots (like store display name) where read performance matters, and reference IDs where ownership and updates matter. You will feel this trade-off again in checkout when order snapshots must not change if a vendor renames their shop later.",
    },
  },
  {
    moduleNum: 4,
    slug: "config-and-database",
    bigWords: [
      {
        term: "Environment variable",
        plainEnglish:
          "A configuration value stored outside your code — usually in a `.env` file — so secrets and URLs differ per machine.",
        whyItMatters:
          "Database connection strings and API keys must never be hard-coded or committed to Git.",
      },
      {
        term: "Connection pooling",
        plainEnglish:
          "Reusing open database connections instead of opening a new one for every request.",
        whyItMatters:
          "Your db module connects once at startup so FreshMarket handles many shoppers without exhausting MongoDB connections.",
      },
    ],
    mandatoryRead: {
      title: "MongoDB Node.js driver — Connect to MongoDB",
      href: "https://www.mongodb.com/docs/drivers/node/current/connect/",
      source: "MongoDB",
      summary:
        "Official guide to connecting a Node.js app to MongoDB with the modern driver. Matches what you implement in the db module this chapter.",
      readMinutes: 10,
    },
    interesting: {
      title: "The `.env` leak that took down a startup demo",
      hook: "One committed secret becomes everyone's secret.",
      body:
        "Teams routinely leak production credentials by committing `.env` files or logging connection strings. FreshMarket teaches config early because every later chapter — Stripe, Cloudinary, Redis — adds another secret that must stay out of Git and client bundles.",
      readMinutes: 3,
    },
    realWorld: {
      title: "Uber's configuration management at scale",
      when: "2014–present",
      summary:
        "Large platforms inject config and secrets through environment-specific systems so developers never embed production credentials in source code.",
      lesson:
        "Treat `process.env` as the contract between your app and deployment — local `.env` today, hosted secrets when you deploy in module 23.",
    },
  },
  {
    moduleNum: 5,
    slug: "data-model-and-seed",
    bigWords: [
      {
        term: "Denormalisation",
        plainEnglish:
          "Storing copied data in multiple places so reads are faster, even though updates become slightly harder.",
        whyItMatters:
          "Order line items snapshot product price at purchase time — that is intentional denormalisation for correct receipts.",
      },
      {
        term: "Seed script",
        plainEnglish:
          "A repeatable script that fills the database with realistic test data so you are never clicking through empty screens.",
        whyItMatters:
          "FreshMarket's seed vendors, stores, and products let you demo the marketplace before any UI exists.",
      },
    ],
    mandatoryRead: {
      title: "Mongoose — Schemas",
      href: "https://mongoosejs.com/docs/guide.html",
      source: "Mongoose",
      summary:
        "How Mongoose schemas define shape, defaults, and validation on MongoDB documents. Directly applies to User, Store, Product, Cart, and Order models.",
      readMinutes: 12,
    },
    interesting: {
      title: "Why orders store prices, not live product lookups",
      hook: "A receipt is a photograph, not a live feed.",
      body:
        "If an order stored only a product ID, a vendor price change would rewrite history. FreshMarket copies name, unit price, and weight into order items at checkout so customers and vendors always see what was agreed at purchase time.",
      readMinutes: 4,
    },
    realWorld: {
      title: "Amazon's item-level order snapshots",
      when: "Marketplace era",
      summary:
        "Marketplace order systems persist item details at purchase time so disputes, refunds, and tax reporting reflect the transaction as it happened.",
      lesson:
        "Model for auditability early. Your seed data and ERD should show which fields are live references and which are immutable snapshots.",
    },
    articleBreak: {
      title: "The FreshMarket ownership chain",
      subtitle: "User → vendor → store → product → cart → order",
      readMinutes: 7,
      body:
        "Every document in FreshMarket answers one question: who owns this, and who is allowed to change it?\n\n" +
        "A User becomes a vendor by opening a store. Products belong to exactly one store. Carts belong to shoppers. Orders split by vendor at checkout because each shop fulfils its own items.\n\n" +
        "Draw this chain before you write handlers. Authorization bugs — a vendor editing another vendor's tomatoes — almost always trace back to a missing link in this chain.",
    },
  },
  {
    moduleNum: 6,
    slug: "authentication-api",
    bigWords: [
      {
        term: "JSON Web Token (JWT)",
        plainEnglish:
          "A signed string the server gives a logged-in user; the client sends it on later requests to prove identity.",
        whyItMatters:
          "FreshMarket uses short-lived access tokens so the API can identify shoppers and vendors without server-side sessions.",
      },
      {
        term: "Password hashing",
        plainEnglish:
          "One-way scrambling of passwords before storage so a database leak does not expose raw passwords.",
        whyItMatters:
          "You never store or log plaintext passwords — bcrypt turns them into verifiable but irreversible hashes.",
      },
    ],
    mandatoryRead: {
      title: "JSON Web Token introduction",
      href: "https://jwt.io/introduction",
      source: "Auth0 / JWT.io",
      summary:
        "Clear explanation of JWT structure, signing, and why tokens are used in stateless APIs. Read before implementing access and refresh tokens.",
      readMinutes: 8,
    },
    interesting: {
      title: "Refresh tokens: why one token is not enough",
      hook: "Short access tokens limit damage; refresh tokens limit annoyance.",
      body:
        "If access tokens lived for weeks, a stolen token would stay valid for weeks. If they expired every minute, users would log in constantly. FreshMarket uses brief access tokens plus longer refresh tokens — a pattern you will wire on both server and client.",
      readMinutes: 5,
    },
    realWorld: {
      title: "Auth0 breach response reshapes token hygiene",
      when: "2023",
      summary:
        "High-profile auth incidents pushed teams to shorten token lifetimes, rotate secrets, and treat refresh flows as first-class security surfaces.",
      lesson:
        "Build OTP verification and refresh rotation now so auth is production-shaped before real customer data exists.",
    },
  },
  {
    moduleNum: 7,
    slug: "login-and-registration",
    bigWords: [
      {
        term: "Token storage",
        plainEnglish:
          "Where the browser keeps JWTs — memory, sessionStorage, or httpOnly cookies — each with different XSS and CSRF trade-offs.",
        whyItMatters:
          "FreshMarket's client must store tokens safely and attach them to API calls without leaking them in URLs or logs.",
      },
      {
        term: "401 retry loop",
        plainEnglish:
          "When an API returns 401 Unauthorized, the client tries to refresh the token once, then retries the original request.",
        whyItMatters:
          "Shoppers should not be kicked to login mid-checkout just because an access token expired seconds ago.",
      },
    ],
    mandatoryRead: {
      title: "React — useContext",
      href: "https://react.dev/reference/react/useContext",
      source: "React",
      summary:
        "Official React docs for sharing auth state across pages. Matches the auth context or hook pattern you build for login and registration screens.",
      readMinutes: 10,
    },
    interesting: {
      title: "Why login forms fail in weird ways",
      hook: "The API works in curl but not in the browser.",
      body:
        "CORS, missing Authorization headers, and tokens stored where JavaScript cannot read them cause most beginner auth bugs. FreshMarket's verify step proves the full browser path — form submit, token storage, protected fetch — not just isolated API tests.",
      readMinutes: 4,
    },
    realWorld: {
      title: "GitHub's session and token evolution",
      when: "2010s–present",
      summary:
        "Developer platforms refined PATs, OAuth apps, and session handling as users demanded security without constant re-authentication.",
      lesson:
        "Treat the client auth layer as part of security design, not a UI afterthought — refresh logic belongs in one place, not scattered across pages.",
    },
  },
  {
    moduleNum: 8,
    slug: "authorization-and-isolation",
    bigWords: [
      {
        term: "Authentication vs authorization",
        plainEnglish:
          "Authentication proves who you are; authorization decides what you are allowed to do.",
        whyItMatters:
          "A logged-in vendor is authenticated — but only their own products should be editable. That check is authorization.",
      },
      {
        term: "Resource ownership",
        plainEnglish:
          "Linking every record to the user or store that owns it so the server can reject cross-tenant access.",
        whyItMatters:
          "FreshMarket vendors must never see or mutate another shop's inventory, even if they guess an ID.",
      },
    ],
    mandatoryRead: {
      title: "OWASP — Broken Access Control",
      href: "https://owasp.org/Top10/A01_2021-Broken_Access_Control/",
      source: "OWASP",
      summary:
        "Top web security risk: users accessing data or actions they should not. Read the examples before implementing role and ownership guards.",
      readMinutes: 12,
    },
    interesting: {
      title: "IDOR: the bug where changing a number steals data",
      hook: "If `/api/products/42` works, will `/api/products/43`?",
      body:
        "Insecure Direct Object Reference bugs happen when the server checks login but not ownership. FreshMarket's guards compare the authenticated user to the document owner on every mutating route — not just on the dashboard UI.",
      readMinutes: 5,
    },
    realWorld: {
      title: "Facebook Graph API permission scandals",
      when: "2010s",
      summary:
        "Platforms exposed user data when apps could request broader permissions than users understood — driving industry focus on least-privilege access.",
      lesson:
        "Centralize authorization in middleware and guards. Ad-hoc checks in individual routes drift and get missed during code review.",
    },
    articleBreak: {
      title: "The FreshMarket trust boundary",
      subtitle: "Who can touch what — and where checks must live",
      readMinutes: 7,
      body:
        "The UI can hide buttons from unauthorized users, but only the server enforces truth. A curious shopper can always call your API directly.\n\n" +
        "FreshMarket uses three layers: authentication (valid token), role checks (vendor vs customer vs admin), and ownership checks (does this store belong to this user?).\n\n" +
        "Put all three on the server. The client mirrors them for UX — routing storeless vendors to onboarding, hiding edit buttons on others' products — but never as the only defense.",
    },
  },
  {
    moduleNum: 9,
    slug: "vendor-store-api",
    bigWords: [
      {
        term: "RESTful resource",
        plainEnglish:
          "An API organized around nouns (stores, products) with HTTP verbs (GET, POST, PATCH, DELETE) describing actions.",
        whyItMatters:
          "Vendor store routes follow predictable patterns so the client and future mobile apps can integrate without surprises.",
      },
      {
        term: "Validation middleware",
        plainEnglish:
          "Code that rejects bad input before it reaches your database or business logic.",
        whyItMatters:
          "Store names, slugs, and delivery zones must be validated server-side — the vendor form is not the only caller.",
      },
    ],
    mandatoryRead: {
      title: "Express — Routing guide",
      href: "https://expressjs.com/en/guide/routing.html",
      source: "Express",
      summary:
        "How Express matches HTTP methods and paths to handlers. Foundation for vendor store CRUD routes this chapter.",
      readMinutes: 10,
    },
    interesting: {
      title: "Slug collisions in multi-vendor marketplaces",
      hook: "Two shops cannot both be `/store/fresh-produce`.",
      body:
        "Human-readable URLs help SEO and sharing, but slugs must be unique per platform. FreshMarket generates or validates slugs on create so vendors get friendly links without breaking routing.",
      readMinutes: 3,
    },
    realWorld: {
      title: "Etsy shop URLs and seller identity",
      when: "2005–present",
      summary:
        "Marketplace sellers receive branded storefront URLs while the platform enforces global uniqueness and policy compliance behind the scenes.",
      lesson:
        "Store creation is more than a form — it is the moment a user becomes a vendor with isolated data and public presence.",
    },
  },
  {
    moduleNum: 10,
    slug: "open-your-shop",
    bigWords: [
      {
        term: "Onboarding flow",
        plainEnglish:
          "Guided steps that turn a signed-up user into an active vendor with a complete store profile.",
        whyItMatters:
          "FreshMarket routes storeless vendors to open-a-shop screens instead of showing an empty dashboard.",
      },
      {
        term: "Conditional routing",
        plainEnglish:
          "Showing different pages based on user state — logged out, customer, or vendor without a store.",
        whyItMatters:
          "The client checks auth and store status before rendering vendor-only routes.",
      },
    ],
    mandatoryRead: {
      title: "React Router — Routing",
      href: "https://reactrouter.com/start/framework/routing",
      source: "React Router",
      summary:
        "Official guide to nested routes and navigation. Applies directly to vendor onboarding and protected route layouts.",
      readMinutes: 20,
    },
    interesting: {
      title: "Empty states that convert",
      hook: "A blank dashboard is where vendors quit.",
      body:
        "Good onboarding explains the next single step — name your shop, add hours, upload a logo — instead of dropping users into a grid of zeros. FreshMarket's open-your-shop flow is the product moment where supply enters the marketplace.",
      readMinutes: 4,
    },
    realWorld: {
      title: "Stripe Connect seller onboarding",
      when: "2010s–present",
      summary:
        "Payment platforms built multi-step seller verification flows because compliance and payout details cannot be optional after money moves.",
      lesson:
        "Collect required vendor data before they reach the dashboard — fixing incomplete profiles later is expensive support work.",
    },
  },
  {
    moduleNum: 11,
    slug: "manage-products-api",
    bigWords: [
      {
        term: "CRUD",
        plainEnglish:
          "Create, Read, Update, Delete — the four basic operations on stored data.",
        whyItMatters:
          "Vendor product management is CRUD with ownership checks and grocery-specific fields like unit and stock.",
      },
      {
        term: "Soft delete vs hard delete",
        plainEnglish:
          "Soft delete marks a record inactive; hard delete removes it permanently from the database.",
        whyItMatters:
          "Products referenced by past orders may need to be unpublished rather than destroyed.",
      },
    ],
    mandatoryRead: {
      title: "Mongoose — Queries",
      href: "https://mongoosejs.com/docs/queries.html",
      source: "Mongoose",
      summary:
        "How to find, update, and delete documents with Mongoose. Use alongside ownership filters on every vendor product query.",
      readMinutes: 12,
    },
    interesting: {
      title: "Grocery SKUs vs marketplace listings",
      hook: "The same barcode can mean different things to different shops.",
      body:
        "Central warehouses use global SKUs; local vendors may sell loose produce by weight with no barcode at all. FreshMarket models unit, weight, and stock per store so APIs stay honest about what is actually for sale.",
      readMinutes: 4,
    },
    realWorld: {
      title: "DoorDash menu sync failures",
      when: "2020s",
      summary:
        "Delivery platforms struggled when restaurant menus changed faster than sync pipelines, showing unavailable items to hungry customers.",
      lesson:
        "Product APIs should reflect live stock and publish state — stale catalogue data directly loses sales.",
    },
  },
  {
    moduleNum: 12,
    slug: "vendor-dashboard",
    bigWords: [
      {
        term: "Dashboard UX",
        plainEnglish:
          "A control panel where vendors see status at a glance and jump to frequent tasks.",
        whyItMatters:
          "FreshMarket's vendor dashboard surfaces product tables, publish toggles, and edit actions without exposing customer checkout flows.",
      },
      {
        term: "Optimistic UI",
        plainEnglish:
          "Updating the screen immediately while the server request runs, rolling back if it fails.",
        whyItMatters:
          "Publish toggles and inline edits feel snappy when the UI assumes success but handles errors gracefully.",
      },
    ],
    mandatoryRead: {
      title: "React — Managing state",
      href: "https://react.dev/learn/managing-state",
      source: "React",
      summary:
        "Official guide to component state, lifting state up, and avoiding redundant fetches — core skills for the vendor product table.",
      readMinutes: 15,
    },
    interesting: {
      title: "Tables that scale for small vendors",
      hook: "Most FreshMarket shops have dozens of products, not millions.",
      body:
        "Enterprise data grids with virtual scrolling are overkill early on. A clear paginated table with search and status badges matches real vendor needs and keeps your first dashboard shippable.",
      readMinutes: 3,
    },
    realWorld: {
      title: "Square Dashboard for sellers",
      when: "2010s–present",
      summary:
        "Square gave small merchants inventory, orders, and payouts in one place — proving simple dashboards drive daily engagement.",
      lesson:
        "Vendor tools should answer: what do I sell, what is low stock, and what changed since yesterday?",
    },
    articleBreak: {
      title: "Week 2 checkpoint: the vendor can run a shop",
      subtitle: "What you have built before customers enter the marketplace",
      readMinutes: 6,
      body:
        "By the end of the vendor experience chapters, a seller can register, verify, open a store, add products with photos, and manage them from a dashboard.\n\n" +
        "That is half of a marketplace. Supply exists. What is missing is demand — public catalogue browsing, cart, checkout, and payments.\n\n" +
        "Before jumping to customer features, demo the vendor flow end to end. If authorization leaks or product ownership is wrong, fixing it now prevents catastrophic bugs when money is involved.",
    },
  },
  {
    moduleNum: 13,
    slug: "product-photos",
    bigWords: [
      {
        term: "Object storage / CDN",
        plainEnglish:
          "Files live on a specialist image service; your database stores only the URL, not the binary photo.",
        whyItMatters:
          "MongoDB documents should not balloon with image bytes — Cloudinary hosts files and serves them fast worldwide.",
      },
      {
        term: "Upload pipeline",
        plainEnglish:
          "The path from browser file picker → server or signed upload → stored URL → saved on the product record.",
        whyItMatters:
          "FreshMarket deletes old images when vendors replace photos so storage costs and broken links stay under control.",
      },
    ],
    mandatoryRead: {
      title: "Cloudinary — Upload images",
      href: "https://cloudinary.com/documentation/upload_images",
      source: "Cloudinary",
      summary:
        "How uploads, folders, and public IDs work in Cloudinary. Matches the product photo flow you implement this chapter.",
      readMinutes: 10,
    },
    interesting: {
      title: "Why produce photos matter more than gadget photos",
      hook: "Shoppers buy with their eyes when quality varies.",
      body:
        "A phone case is a phone case. A mango might be perfect or overripe. Good vendor photos reduce refunds and build trust — your upload flow is a business feature, not a cosmetic extra.",
      readMinutes: 3,
    },
    realWorld: {
      title: "Instagram commerce and visual trust",
      when: "2010s–present",
      summary:
        "Social and marketplace sellers learned that image quality and consistency directly correlate with conversion rates for physical goods.",
      lesson:
        "Validate image types and sizes server-side; broken or huge uploads become support tickets fast.",
    },
  },
  {
    moduleNum: 14,
    slug: "browse-catalogue-api",
    bigWords: [
      {
        term: "Pagination",
        plainEnglish:
          "Returning data in pages (e.g. 20 products at a time) instead of the entire catalogue at once.",
        whyItMatters:
          "FreshMarket catalogues grow quickly; pagination keeps responses fast and mobile-friendly.",
      },
      {
        term: "N+1 query problem",
        plainEnglish:
          "Fetching a list, then running one extra query per item — often accidentally via lazy population.",
        whyItMatters:
          "Catalogue routes should fetch store names efficiently, not one MongoDB round-trip per product.",
      },
    ],
    mandatoryRead: {
      title: "MongoDB — Query documents",
      href: "https://www.mongodb.com/docs/manual/tutorial/query-documents/",
      source: "MongoDB",
      summary:
        "Filtering, projection, and sorting documents. Foundation for catalogue search, category filters, and pagination queries.",
      readMinutes: 12,
    },
    interesting: {
      title: "Public read routes still need discipline",
      hook: "No login does not mean no limits.",
      body:
        "Catalogue APIs are public, but they still need rate limits, input validation on query params, and careful projection so internal fields never leak. FreshMarket exposes only what shoppers need to decide and add to cart.",
      readMinutes: 4,
    },
    realWorld: {
      title: "Amazon search index separate from catalog DB",
      when: "2000s–present",
      summary:
        "Large marketplaces eventually split transactional catalog storage from search-optimized indexes — your module 21 preview.",
      lesson:
        "Build a correct catalogue API first; optimize with cache and search once the happy path works.",
    },
  },
  {
    moduleNum: 15,
    slug: "shop-the-marketplace",
    bigWords: [
      {
        term: "Product card component",
        plainEnglish:
          "A reusable UI block showing image, name, price, and add-to-cart for one product in a grid.",
        whyItMatters:
          "FreshMarket's shop page composes many cards from one catalogue API response.",
      },
      {
        term: "Client-side filter state",
        plainEnglish:
          "URL or React state that remembers category, search, and page so refreshes and shares preserve context.",
        whyItMatters:
          "Shoppers expect filters to survive navigation — sync state with query params where possible.",
      },
    ],
    mandatoryRead: {
      title: "React — Passing props to a component",
      href: "https://react.dev/learn/passing-props-to-a-component",
      source: "React",
      summary:
        "How props flow from page to card components. Essential for building the marketplace product grid cleanly.",
      readMinutes: 8,
    },
    interesting: {
      title: "Skeleton screens vs spinners",
      hook: "Empty grids feel broken; skeletons feel fast.",
      body:
        "While catalogue fetches run, placeholder cards communicate progress better than a lone spinner. FreshMarket's shop UI should feel responsive even on slow networks.",
      readMinutes: 3,
    },
    realWorld: {
      title: "Instacart's shop-by-aisle experience",
      when: "2020s",
      summary:
        "Grocery apps invested heavily in browse UX — filters, dietary tags, and store context — because search alone misses discovery.",
      lesson:
        "Customer-facing catalogue UI is where backend data models become revenue — treat loading and empty states as first-class design.",
    },
    articleBreak: {
      title: "Entering Week 3: from supply to demand",
      subtitle: "The marketplace finally feels like a place to shop",
      readMinutes: 6,
      body:
        "Week 2 built the vendor side. Week 3 opens the doors to customers.\n\n" +
        "The shop-the-marketplace chapter is the emotional pivot: grids of real products from multiple vendors, filters that work, pages that turn. Shoppers can discover goods — but they cannot pay yet.\n\n" +
        "Resist jumping to Stripe before cart and checkout logic exist. A beautiful shop without a reliable cart loses trust the moment someone clicks Add to basket.",
    },
  },
  {
    moduleNum: 16,
    slug: "cart-api",
    bigWords: [
      {
        term: "Server-side cart",
        plainEnglish:
          "Cart items stored in the database tied to a user, not only in browser localStorage.",
        whyItMatters:
          "FreshMarket carts persist across devices and merge when a guest logs in — the server is the source of truth.",
      },
      {
        term: "Cart line item",
        plainEnglish:
          "One row in the cart: a product, quantity, and computed subtotal for that vendor's item.",
        whyItMatters:
          "Checkout later groups line items by vendor to create split orders from one payment.",
      },
    ],
    mandatoryRead: {
      title: "HTTP request methods — POST",
      href: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/POST",
      source: "MDN",
      summary:
        "When POST creates resources vs updates state. Cart add/update/remove routes rely on correct verb semantics and idempotent design where appropriate.",
      readMinutes: 6,
    },
    interesting: {
      title: "Cart merge on login",
      hook: "Guest cart + user cart = one headache if you plan late.",
      body:
        "Shoppers browse before signing in. When they log in, anonymous cart items must merge without duplicating quantities or dropping selections. FreshMarket handles merge in the API so every client behaves consistently.",
      readMinutes: 5,
    },
    realWorld: {
      title: "Target cart persistence across channels",
      when: "2010s–present",
      summary:
        "Retailers invested in unified carts so web, app, and in-store pickup saw the same basket — reducing abandoned purchases.",
      lesson:
        "Treat cart mutations as concurrent — two tabs updating quantity should not corrupt totals.",
    },
  },
  {
    moduleNum: 17,
    slug: "your-cart",
    bigWords: [
      {
        term: "Derived state",
        plainEnglish:
          "Values computed from other state — like cart subtotals — instead of stored separately and risking drift.",
        whyItMatters:
          "Display totals calculated from line items so UI always matches server math.",
      },
      {
        term: "Quantity stepper",
        plainEnglish:
          "Plus/minus controls that update item count and re-fetch or optimistically update the cart.",
        whyItMatters:
          "Cart UX lives or dies on responsive quantity changes and clear remove actions.",
      },
    ],
    mandatoryRead: {
      title: "React — useEffect",
      href: "https://react.dev/reference/react/useEffect",
      source: "React",
      summary:
        "Fetching cart data when the page loads and reacting to auth changes. Read the data fetching patterns section.",
      readMinutes: 12,
    },
    interesting: {
      title: "Multi-vendor cart grouping",
      hook: "One basket, several shops, one checkout later.",
      body:
        "Showing which items come from which vendor sets expectations before checkout splits orders and delivery fees. FreshMarket groups cart UI by store so shoppers are not surprised at payment.",
      readMinutes: 4,
    },
    realWorld: {
      title: "Amazon multi-seller cart checkout",
      when: "Marketplace era",
      summary:
        "Customers add items from many sellers but expect a single checkout flow with transparent split fulfilment.",
      lesson:
        "Cart UI should preview the split-order model early — it reduces support questions at checkout.",
    },
  },
  {
    moduleNum: 18,
    slug: "checkout-and-orders",
    bigWords: [
      {
        term: "Checkout session",
        plainEnglish:
          "The short-lived flow where cart items become orders and payment is authorized.",
        whyItMatters:
          "FreshMarket checkout validates stock, creates order documents, and hands off to Stripe without double-charging.",
      },
      {
        term: "Split order",
        plainEnglish:
          "One customer payment that creates separate fulfilment orders per vendor.",
        whyItMatters:
          "Each grocery shop packs its own items — the data model must reflect multiple orders from one checkout.",
      },
    ],
    mandatoryRead: {
      title: "Stripe — Checkout Session",
      href: "https://docs.stripe.com/payments/checkout",
      source: "Stripe",
      summary:
        "How Stripe Checkout collects payment securely. Read before wiring checkout routes and payment intents in the next chapter.",
      readMinutes: 15,
    },
    interesting: {
      title: "Stripe idempotency keys",
      hook: "Networks retry; without idempotency, customers pay twice.",
      body:
        "If a checkout request times out, clients and webhooks may retry. Idempotency keys tell Stripe to treat duplicates as the same charge. FreshMarket introduces this pattern where money first enters the system.",
      readMinutes: 5,
    },
    realWorld: {
      title: "Double-charge incidents during flash sales",
      when: "Various",
      summary:
        "E-commerce outages and retries caused duplicate charges until teams adopted idempotent payment APIs and clear order states.",
      lesson:
        "Model order status explicitly — pending, paid, failed — and never create a second order for the same checkout attempt.",
    },
    articleBreak: {
      title: "Money enters the building",
      subtitle: "Checkout is a state machine, not a form submit",
      readMinutes: 8,
      body:
        "Checkout is the most dangerous feature in FreshMarket. Cart totals, inventory, vendor splits, and payment authorization must agree within seconds.\n\n" +
        "Think in states: cart locked → orders created → payment initiated → payment confirmed → cart cleared. Each transition should be recoverable if the network drops.\n\n" +
        "Never assume the client saw the Stripe success page. Webhooks in module 19 confirm payment — checkout routes prepare orders; webhooks finalize them.",
    },
  },
  {
    moduleNum: 19,
    slug: "payment-processing",
    bigWords: [
      {
        term: "Payment intent",
        plainEnglish:
          "Stripe's object representing an attempt to charge a customer, tracking status from created to succeeded.",
        whyItMatters:
          "FreshMarket aligns order payment state with Stripe payment intent lifecycle events.",
      },
      {
        term: "Webhook",
        plainEnglish:
          "An HTTP POST Stripe sends to your server when payment status changes — the reliable source of truth.",
        whyItMatters:
          "Browsers lie or disconnect; webhooks confirm payment even if the user closes the tab early.",
      },
    ],
    mandatoryRead: {
      title: "Stripe — Webhooks",
      href: "https://docs.stripe.com/webhooks",
      source: "Stripe",
      summary:
        "How to verify webhook signatures and handle events idempotently. Required reading before implementing the webhook handler.",
      readMinutes: 12,
    },
    interesting: {
      title: "Test mode vs live mode",
      hook: "Real cards fail in test mode on purpose.",
      body:
        "Stripe test keys let you simulate success, decline, and 3D Secure without moving money. FreshMarket stays in test mode until deploy — but your code paths should mirror production exactly.",
      readMinutes: 4,
    },
    realWorld: {
      title: "Stripe becomes default startup payments",
      when: "2010s–present",
      summary:
        "Stripe's developer-first APIs and webhooks let small teams accept cards without becoming PCI compliance experts overnight.",
      lesson:
        "Verify webhook signatures on every request — unverified endpoints let attackers mark orders paid for free.",
    },
  },
  {
    moduleNum: 20,
    slug: "track-orders",
    bigWords: [
      {
        term: "Order status lifecycle",
        plainEnglish:
          "The allowed stages an order moves through — placed, confirmed, preparing, out for delivery, completed.",
        whyItMatters:
          "Customers and vendors need shared vocabulary for where an order stands.",
      },
      {
        term: "Role-scoped views",
        plainEnglish:
          "The same order data shown differently — vendors see fulfilment tasks; customers see delivery progress.",
        whyItMatters:
          "FreshMarket order pages filter by authenticated role and ownership.",
      },
    ],
    mandatoryRead: {
      title: "React Router — useParams",
      href: "https://reactrouter.com/6.30.1/hooks/use-params",
      source: "React Router",
      summary:
        "Reading order IDs from the URL for detail pages. Pairs with API routes that verify the viewer may access that order.",
      readMinutes: 6,
    },
    interesting: {
      title: "Status updates without realtime overkill",
      hook: "Polling is fine before websockets are.",
      body:
        "FreshMarket can refresh order status on interval or navigation before adding push notifications. Ship readable timelines first; optimize freshness when users ask for it.",
      readMinutes: 3,
    },
    realWorld: {
      title: "Domino's Pizza Tracker effect",
      when: "2008–present",
      summary:
        "Transparent order tracking reduced support calls and increased trust — customers tolerate wait when they see progress.",
      lesson:
        "Expose meaningful statuses, not internal jargon. 'Preparing your order' beats 'STATE_PICKING'.",
    },
    articleBreak: {
      title: "Week 3 demo: a customer can pay and track",
      subtitle: "The core marketplace loop is complete",
      readMinutes: 6,
      body:
        "Browse → cart → checkout → pay → track. That loop is what investors and users mean when they say 'marketplace'.\n\n" +
        "Demo it with two vendors in one cart. Confirm split orders, successful Stripe test payment, and visible status on customer and vendor sides.\n\n" +
        "Week 4 adds speed (cache, search), reliability (queues), and shipping (deploy). The product already works — polish makes it feel professional.",
    },
  },
  {
    moduleNum: 21,
    slug: "cache-and-search",
    bigWords: [
      {
        term: "Cache",
        plainEnglish:
          "A fast temporary store of expensive query results so repeat reads do not hammer the database.",
        whyItMatters:
          "FreshMarket caches hot catalogue pages in Redis so browsing stays snappy under load.",
      },
      {
        term: "Cache invalidation",
        plainEnglish:
          "Deciding when cached data is stale and must be refreshed after vendors change products.",
        whyItMatters:
          "Wrong prices in cache hurt trust — tie invalidation to product updates and TTLs.",
      },
    ],
    mandatoryRead: {
      title: "Redis — Introduction",
      href: "https://redis.io/docs/latest/develop/get-started/",
      source: "Redis",
      summary:
        "What Redis is and how key-value caching works. Read before connecting Redis to catalogue routes.",
      readMinutes: 10,
    },
    interesting: {
      title: "The stale cache trap",
      hook: "Fast wrong answers are worse than slow right ones.",
      body:
        "Teams enable caching, celebrate response times, then ship outdated stock levels. FreshMarket defines what is cacheable (public catalogue pages) and what never is (cart, checkout, auth).",
      readMinutes: 4,
    },
    realWorld: {
      title: "Facebook Memcached outage lessons",
      when: "2010",
      summary:
        "Major sites learned that caching layers need fallbacks — when cache fails, databases must survive the thundering herd.",
      lesson:
        "Always code a cache miss path. Redis is an accelerator, not the system of record.",
    },
  },
  {
    moduleNum: 22,
    slug: "async-jobs-and-queues",
    bigWords: [
      {
        term: "Job queue",
        plainEnglish:
          "A to-do list for background work — emails, receipts, search index updates — processed outside the HTTP request.",
        whyItMatters:
          "FreshMarket enqueues work after paid checkout so shoppers are not waiting on slow tasks.",
      },
      {
        term: "Worker process",
        plainEnglish:
          "A separate Node process that pulls jobs from the queue and runs them reliably with retries.",
        whyItMatters:
          "BullMQ workers can restart without losing jobs if configured with persistent Redis.",
      },
    ],
    mandatoryRead: {
      title: "BullMQ — Introduction",
      href: "https://docs.bullmq.io/guide/introduction",
      source: "BullMQ",
      summary:
        "Official introduction to queues and workers in BullMQ. Matches post-checkout async jobs in FreshMarket.",
      readMinutes: 10,
    },
    interesting: {
      title: "Why checkout should not send email inline",
      hook: "SMTP is slow and flaky compared to HTTP.",
      body:
        "Sending vendor notification emails inside the payment request adds failure modes where money succeeded but the user sees an error. Queue the email; return success when the order is saved and payment confirmed.",
      readMinutes: 4,
    },
    realWorld: {
      title: "Shopify flash sale queue architecture",
      when: "2010s–present",
      summary:
        "Commerce platforms moved heavy work to background jobs during traffic spikes so checkout stayed available.",
      lesson:
        "Design jobs to be idempotent — retries will happen, and duplicate emails beat lost orders.",
    },
  },
  {
    moduleNum: 23,
    slug: "deploy",
    bigWords: [
      {
        term: "Production environment",
        plainEnglish:
          "The live server customers use — with real HTTPS, hosted secrets, and monitoring.",
        whyItMatters:
          "Deploy chapter moves FreshMarket from localhost to a URL you can share.",
      },
      {
        term: "Environment parity",
        plainEnglish:
          "Keeping dev and production similar enough that code behaves the same in both.",
        whyItMatters:
          "Use the same Node version, env var names, and build steps locally and on the host to avoid 'works on my machine'.",
      },
    ],
    mandatoryRead: {
      title: "MDN — HTTP overview",
      href: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview",
      source: "MDN",
      summary:
        "HTTPS, headers, and status codes — context for reverse proxies, TLS, and health checks in production.",
      readMinutes: 10,
    },
    interesting: {
      title: "The deploy checklist nobody skips twice",
      hook: "Forgotten env vars wake you at 2 a.m.",
      body:
        "Database URL, Stripe keys, Cloudinary, Redis, JWT secrets, CORS origin — production needs every secret the app reads locally. FreshMarket's deploy checklist exists because missing one variable fails silently until traffic hits.",
      readMinutes: 4,
    },
    realWorld: {
      title: "Heroku twelve-factor app methodology",
      when: "2011–present",
      summary:
        "Twelve-factor principles — config in env, stateless processes, logs as streams — shaped how Node apps deploy to modern platforms.",
      lesson:
        "Build deploy-ready habits early: health routes, env-based config, and separate worker processes pay off on day one in production.",
    },
    articleBreak: {
      title: "Shipping FreshMarket for real",
      subtitle: "From localhost demo to HTTPS URL you can share",
      readMinutes: 7,
      body:
        "Deployment is not a single command — it is the first time all your assumptions meet the public internet.\n\n" +
        "Your API needs a stable URL. Your client needs to know that URL at build time. MongoDB, Redis, and webhooks must accept connections from the host, not only your laptop.\n\n" +
        "After deploy, run the full demo: vendor adds product, customer checks out with Stripe test mode, webhook fires, order appears. That end-to-end pass on production config is the course finish line.",
    },
  },
  {
    moduleNum: 99,
    slug: "closing",
    bigWords: [
      {
        term: "Portfolio project",
        plainEnglish:
          "A substantial app you can demo, explain, and extend in job interviews.",
        whyItMatters:
          "FreshMarket demonstrates full-stack, payments, and marketplace thinking — not a todo list.",
      },
      {
        term: "Technical narrative",
        plainEnglish:
          "The story you tell about trade-offs you made — why MongoDB, why split orders, why webhooks.",
        whyItMatters:
          "Interviewers care less about memorized syntax and more about whether you understand your own architecture.",
      },
    ],
    mandatoryRead: {
      title: "MDN — Learn web development",
      href: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
      source: "MDN",
      summary:
        "Curated learning paths for deepening skills after this course — pick modules that match gaps you felt during the build.",
      readMinutes: 5,
    },
    interesting: {
      title: "What to build next on FreshMarket",
      hook: "The platform is a foundation, not a ceiling.",
      body:
        "Add delivery driver roles, promo codes, admin moderation, or native mobile clients. Each extension reuses the patterns you practiced — guarded APIs, denormalised snapshots, async jobs — without starting from zero.",
      readMinutes: 4,
    },
    realWorld: {
      title: "Developers ship side projects into careers",
      when: "Ongoing",
      summary:
        "Hiring managers repeatedly cite deployed full-stack projects with payments and multi-user roles as differentiators for junior and mid-level candidates.",
      lesson:
        "Keep README, demo URL, and a two-minute architecture explanation ready — your future self will thank you in every interview loop.",
    },
  },
];

/** Return enrichment for a module number, or undefined if none is defined. */
export function enrichmentForModule(moduleNum: number): ModuleEnrichment | undefined {
  return MODULE_ENRICHMENT.find((entry) => entry.moduleNum === moduleNum);
}

/**
 * Parse a module number from a relative path or folder slug.
 * @example moduleNumFromPath("06-authentication-api") // 6
 * @example moduleNumFromPath("99-closing") // 99
 */
export function moduleNumFromPath(relPath: string): number | null {
  const normalized = relPath.replace(/\\/g, "/");
  const folder = normalized.split("/")[0] ?? normalized;
  const match = folder.match(/^(\d+)-/);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}
