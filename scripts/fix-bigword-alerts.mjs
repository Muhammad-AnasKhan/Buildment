#!/usr/bin/env node
/**
 * One-off: replace duplicated BigWordAlert terms with chapter-specific alerts.
 * Run: node scripts/fix-bigword-alerts.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.resolve(__dirname, "../content/import/multi-vendor-marketplace");

/** @type {Record<string, Record<string, { term: string; plainEnglish: string; whyItMatters: string } | null>>} */
const MODULE_ALERTS = {
  "01-introduction": {
    "01.01-what-youre-building": {
      term: "Multi-vendor marketplace",
      plainEnglish:
        "One app where many independent sellers list products and customers buy from several shops in a single checkout.",
      whyItMatters:
        "FreshMarket is not a single grocery store — you are building the platform that connects local vendors and shoppers.",
    },
    "01.02-how-to-use-this-course": {
      term: "Project-based learning",
      plainEnglish:
        "Learning by building a real product step by step, not by watching disconnected tutorials.",
      whyItMatters:
        "Every FreshMarket chapter adds runnable code — your portfolio grows as you learn.",
    },
    "01.03-the-product-and-its-people": {
      term: "Marketplace actors",
      plainEnglish:
        "The distinct roles in a marketplace — shoppers, vendors, and the platform operator — each with different permissions.",
      whyItMatters:
        "FreshMarket's auth, dashboards, and order flows all map back to who is logged in and what they can touch.",
    },
    "01.04-scope": {
      term: "MVP scope",
      plainEnglish:
        "The smallest version of a product that delivers real value — and deliberately leaves polish for later.",
      whyItMatters:
        "This course ships a working grocery marketplace, not every feature Amazon has — scope keeps you shipping.",
    },
    "01.05-prerequisites": {
      term: "Baseline stack",
      plainEnglish:
        "The minimum tools and concepts you need before starting — Node, React, basic HTTP, and Git.",
      whyItMatters:
        "FreshMarket assumes you can read JavaScript and run terminal commands; the course does not re-teach fundamentals.",
    },
    "01.06-course-outline": {
      term: "Module arc",
      plainEnglish:
        "The ordered journey from skeleton app to deployed marketplace, grouped into themed chapters.",
      whyItMatters:
        "Knowing the arc helps you see why MongoDB comes before auth and why payments come after checkout logic.",
    },
    "01.07-your-working-rhythm": {
      term: "Build-verify loop",
      plainEnglish:
        "Write a small change, run the app, confirm it works, then commit — repeat instead of big-bang coding.",
      whyItMatters:
        "FreshMarket chapters end with runnable proof; the rhythm prevents 'it worked yesterday' surprises.",
    },
    "01.08-visual-roadmap-and-demo-frames": {
      term: "UI reference frame",
      plainEnglish:
        "A visual mock of a screen you are aiming for — not pixel-perfect design, but enough to guide layout.",
      whyItMatters:
        "Vendor dashboards and shop pages in this course have target frames so you know what 'done' looks like.",
    },
    "01.09-beginner-questions-and-reading-roadmap": {
      term: "Conceptual scaffolding",
      plainEnglish:
        "Background reading and FAQs that fill gaps without stopping the build — learn just enough to proceed.",
      whyItMatters:
        "Terms like JWT, webhook, and denormalisation appear later; this roadmap tells you when to pause and read.",
    },
    "01.10-engineering-thinking-playbook": {
      term: "Trade-off thinking",
      plainEnglish:
        "Choosing between two valid options by weighing speed, safety, cost, and complexity — not chasing perfection.",
      whyItMatters:
        "FreshMarket decisions (MongoDB vs SQL, JWT vs sessions) are trade-offs you will defend in interviews.",
    },
  },
  "02-project-skeleton": {
    "02.01-set-the-scene": {
      term: "Monorepo layout",
      plainEnglish:
        "One Git repository that holds both the client app and the server app, usually in separate top-level folders.",
      whyItMatters:
        "FreshMarket keeps `client/` and `server/` side by side so you can run and deploy them together while keeping concerns separate.",
    },
    "02.02-why-structure-matters": {
      term: "Separation of concerns",
      plainEnglish:
        "Splitting code by responsibility so UI, API, and data logic do not tangle in one giant file.",
      whyItMatters:
        "FreshMarket's module folders (`auth/`, `stores/`, `products/`) exist so features stay findable as the app grows.",
    },
    "02.03-what-youll-build": {
      term: "Full-stack skeleton",
      plainEnglish:
        "A minimal client plus server that talk over HTTP — no database yet, but the wiring is real.",
      whyItMatters:
        "Chapter 2's deliverable is proof that React and Express can handshake before you add MongoDB or auth.",
    },
    "02.04-layer-vs-module": {
      term: "Layer vs module",
      plainEnglish:
        "Layers are horizontal slices (routes, services, models); modules are vertical feature folders (auth, cart).",
      whyItMatters:
        "FreshMarket uses modules inside the server so each feature owns its routes, logic, and models together.",
    },
    "02.05-client-vs-server": {
      term: "Client-server boundary",
      plainEnglish:
        "The browser runs UI code; the server runs secrets, database access, and business rules — never the reverse.",
      whyItMatters:
        "Stripe keys and MongoDB URLs live only on the server; the React app calls HTTP APIs for everything sensitive.",
    },
    "02.06-prime-your-thinking": {
      term: "CORS",
      plainEnglish:
        "Cross-Origin Resource Sharing — browser rules that block or allow requests from one origin (localhost:5173) to another (localhost:4000).",
      whyItMatters:
        "Your first end-to-end win fails silently without CORS configured — the health check is your CORS test.",
    },
    "02.07-quiz": {
      term: "Health check route",
      plainEnglish:
        "A tiny API endpoint that returns OK so you can prove the server is alive before building real features.",
      whyItMatters:
        "FreshMarket's `/health` route is the canary — if it fails, nothing downstream will work either.",
    },
    "02.08-create-the-repo": {
      term: "Git repository",
      plainEnglish:
        "Version-controlled project folder where every change is tracked and reversible.",
      whyItMatters:
        "FreshMarket lives in one repo from day one — commits mark chapter milestones you can demo or roll back.",
    },
    "02.09-scaffold-server-folders": {
      term: "Express middleware stack",
      plainEnglish:
        "Layers of functions that run on every request — JSON parsing, CORS, logging — before your route handler.",
      whyItMatters:
        "FreshMarket's server boot order matters: middleware first, then routes, then error handlers.",
    },
    "02.10-server-package-and-scripts": {
      term: "npm scripts",
      plainEnglish:
        "Named shortcuts in package.json (`dev`, `start`, `seed`) so you do not memorize long terminal commands.",
      whyItMatters:
        "`npm run dev` in both client and server folders is how you run FreshMarket locally every day.",
    },
    "02.11-the-health-route": {
      term: "Health check route",
      plainEnglish:
        "A tiny API endpoint that returns OK so you can prove the server is alive before building real features.",
      whyItMatters:
        "Your first end-to-end win is the React app calling `/health` — if that works, networking and CORS are probably configured correctly.",
    },
    "02.12-scaffold-client-folders": {
      term: "React SPA shell",
      plainEnglish:
        "A single-page app with routing and layout components but minimal pages — the UI skeleton.",
      whyItMatters:
        "FreshMarket's client starts as a shell; shop, cart, and vendor pages plug into the same router later.",
    },
    "02.13-client-shell-and-routing": {
      term: "Client-side routing",
      plainEnglish:
        "The browser swaps page components without full reloads, driven by URL paths like `/shop` or `/cart`.",
      whyItMatters:
        "FreshMarket uses React Router so shoppers and vendors navigate smoothly between public and protected pages.",
    },
    "02.14-api-client-helper": {
      term: "API client helper",
      plainEnglish:
        "A small wrapper around fetch that sets base URL, headers, and error handling for all server calls.",
      whyItMatters:
        "Every FreshMarket screen uses the same client helper — token attachment and 401 retry live in one place.",
    },
    "02.15-connect-client-to-server": {
      term: "Cross-origin request",
      plainEnglish:
        "An HTTP call from the browser to a different host or port than the page was loaded from.",
      whyItMatters:
        "Connecting client to server is your first real network integration — CORS and env base URLs must align.",
    },
    "02.16-verify-end-to-end": {
      term: "End-to-end smoke test",
      plainEnglish:
        "Manually confirming the full path works — browser loads, calls API, displays response — before moving on.",
      whyItMatters:
        "Chapter 2's gate is a screenshot or curl proof that `/health` returns `{ status: 'ok' }` in the UI.",
    },
    "02.17-practice": {
      term: "Stretch exercise",
      plainEnglish:
        "Optional extra work that deepens understanding without blocking progress on the main path.",
      whyItMatters:
        "Adding a `/version` route or extra logging here reinforces Express patterns before auth complexity.",
    },
    "02.18-recap-and-whats-next": {
      term: "Running skeleton",
      plainEnglish:
        "A client and server that communicate but do not persist data yet — the foundation every feature builds on.",
      whyItMatters:
        "Chapter 3 adds data design; Chapter 4 adds MongoDB — both assume this skeleton already runs.",
    },
    "02.19-checklist": {
      term: "Chapter gate",
      plainEnglish:
        "A checklist of runnable proof points you must pass before the next chapter unlocks.",
      whyItMatters:
        "FreshMarket gating is server-enforced — skipping the health check means later chapters assume broken wiring.",
    },
  },
  "03-why-mongodb": {
    "03.01-set-the-scene": {
      term: "Schema flexibility",
      plainEnglish:
        "Document databases let you evolve field shapes without migrations every time product requirements change.",
      whyItMatters:
        "Grocery products gain fields (organic, allergens, unit) faster than relational ALTER TABLE cycles allow.",
    },
    "03.02-why-it-matters-for-grocery": {
      term: "Grocery catalogue shape",
      plainEnglish:
        "Product data in food retail varies wildly — weight vs count, perishability, dietary tags — hard to fit one rigid table.",
      whyItMatters:
        "FreshMarket vendors list mangoes by kg and milk by litre; flexible documents match real grocery data.",
    },
    "03.03-what-youll-decide": {
      term: "Data modelling decision",
      plainEnglish:
        "Choosing database technology and document shapes before writing models — design before code.",
      whyItMatters:
        "This chapter produces `docs/erd-draft.md` — the blueprint Chapter 5 implements in Mongoose.",
    },
    "03.04-relational-vs-document": {
      term: "Document database",
      plainEnglish:
        "A database that stores records as JSON-like documents in collections instead of rows in joined tables.",
      whyItMatters:
        "MongoDB fits FreshMarket's nested cart items and varied product fields without complex JOIN queries.",
    },
    "03.05-the-decision-for-freshmarket": {
      term: "MongoDB",
      plainEnglish:
        "The document database this course uses — collections, BSON documents, and Mongoose as the Node.js ODM.",
      whyItMatters:
        "FreshMarket commits to MongoDB here so every later chapter (models, queries, indexes) stays consistent.",
    },
    "03.06-embedding-vs-referencing": {
      term: "Embedding vs referencing",
      plainEnglish:
        "Embedding copies related data inside a document; referencing stores an ID and looks up the other collection.",
      whyItMatters:
        "Cart line items embed product snapshots; stores reference vendor users — each choice affects read speed and updates.",
    },
    "03.07-prime-your-thinking": {
      term: "Read vs write trade-off",
      plainEnglish:
        "Optimizing for fast reads often means duplicating data; optimizing for easy updates often means more lookups.",
      whyItMatters:
        "Order line snapshots favor read speed (receipts never change); live product prices favor references until checkout.",
    },
    "03.08-audit-your-planned-schema": {
      term: "Entity-relationship draft",
      plainEnglish:
        "A diagram or doc listing entities, fields, and how they link — your schema before code.",
      whyItMatters:
        "FreshMarket's ERD catches missing ownership rules early — e.g. who can edit which store.",
    },
    "03.09-map-actors-to-collections": {
      term: "Collection mapping",
      plainEnglish:
        "Assigning each business entity (user, store, product, order) to a MongoDB collection name.",
      whyItMatters:
        "FreshMarket ends with users, stores, products, carts, and orders collections — one home per entity type.",
    },
    "03.10-checklist": {
      term: "Design artifact",
      plainEnglish:
        "A committed document (ERD, decisions log) that proves you thought before coding models.",
      whyItMatters:
        "Chapter 5's gate checks that `docs/erd-draft.md` exists — design is part of the deliverable.",
    },
  },
  "04-config-and-database": {
    "04.01-set-the-scene": {
      term: "Persistent storage",
      plainEnglish:
        "Data that survives server restarts — stored in a database, not in memory or hard-coded arrays.",
      whyItMatters:
        "Until MongoDB connects, FreshMarket forgets every vendor and product when you stop the server.",
    },
    "04.02-why-secrets-matter": {
      term: "Secrets management",
      plainEnglish:
        "Keeping passwords, API keys, and connection strings out of source code and out of Git history.",
      whyItMatters:
        "One leaked MongoDB URI or Stripe key in a public repo can compromise every FreshMarket deployment.",
    },
    "04.03-what-youll-build": {
      term: "Boot-time configuration",
      plainEnglish:
        "Loading and validating all environment settings when the server starts, before accepting requests.",
      whyItMatters:
        "FreshMarket fails fast at boot if `MONGODB_URI` is missing — better than cryptic errors mid-checkout.",
    },
    "04.04-env-vs-hardcoded": {
      term: "Environment variable",
      plainEnglish:
        "A configuration value stored outside your code — usually in a `.env` file — so secrets and URLs differ per machine.",
      whyItMatters:
        "Database connection strings and API keys must never be hard-coded or committed to Git.",
    },
    "04.05-local-mongodb": {
      term: "MongoDB connection string",
      plainEnglish:
        "A URL that tells the driver how to reach your database — host, port, credentials, and database name.",
      whyItMatters:
        "Local `mongodb://127.0.0.1:27017/freshmarket` differs from Atlas in production — same code, different env.",
    },
    "04.06-prime-your-thinking": {
      term: "Twelve-factor config",
      plainEnglish:
        "Store config in the environment, not in code — so dev, staging, and production differ by env vars only.",
      whyItMatters:
        "FreshMarket follows this pattern: one codebase, many deployments, secrets injected at runtime.",
    },
    "04.07-quiz": {
      term: "Environment variable",
      plainEnglish:
        "A configuration value stored outside your code — usually in a `.env` file — so secrets and URLs differ per machine.",
      whyItMatters:
        "Database connection strings and API keys must never be hard-coded or committed to Git.",
    },
    "04.08-where-the-project-is-now": null,
    "04.09-create-env-files": {
      term: ".gitignore for secrets",
      plainEnglish:
        "Listing `.env` in `.gitignore` so local secrets never get staged or pushed to GitHub.",
      whyItMatters:
        "FreshMarket ships `.env.example` with placeholders — real values stay on your machine only.",
    },
    "04.10-config-module": {
      term: "Validated config object",
      plainEnglish:
        "A single module that reads env vars, validates types, and exports a typed config — one source of truth.",
      whyItMatters:
        "FreshMarket's config module throws at boot if `JWT_SECRET` is too short — catching misconfig before users hit errors.",
    },
    "04.11-db-module": {
      term: "Connection pooling",
      plainEnglish:
        "Reusing open database connections instead of opening a new one for every request.",
      whyItMatters:
        "Your db module connects once at startup so FreshMarket handles many shoppers without exhausting MongoDB connections.",
    },
    "04.12-wire-db-on-boot": {
      term: "Graceful startup",
      plainEnglish:
        "Connecting to the database before listening on HTTP, and exiting cleanly if connection fails.",
      whyItMatters:
        "FreshMarket won't accept cart requests until MongoDB is ready — no half-initialized server state.",
    },
    "04.13-health-check-db-status": {
      term: "Deep health probe",
      plainEnglish:
        "A health endpoint that checks dependencies — not just 'server up' but 'database reachable'.",
      whyItMatters:
        "FreshMarket's `/health` reports `db: connected` so deploy scripts and the client know persistence works.",
    },
    "04.14-client-env": {
      term: "VITE_ env prefix",
      plainEnglish:
        "Vite only exposes env vars starting with `VITE_` to the browser — a safety gate against leaking server secrets.",
      whyItMatters:
        "FreshMarket's client gets `VITE_API_URL` only; MongoDB URI never touches the React bundle.",
    },
    "04.15-verify-connection": {
      term: "Integration smoke test",
      plainEnglish:
        "Running the full stack and confirming the health check shows database connected in the browser.",
      whyItMatters:
        "Chapter 4's gate is runnable proof — screenshot or Network tab showing `{ status: 'ok', db: 'connected' }`.",
    },
    "04.16-recap-and-whats-next": {
      term: "Database readiness",
      plainEnglish:
        "The state where MongoDB is connected, config is validated, and the app is ready for Mongoose models.",
      whyItMatters:
        "Chapter 5 adds User, Store, and Product models — they need this connection layer already working.",
    },
    "04.17-checklist": {
      term: "Environment variable",
      plainEnglish:
        "A configuration value stored outside your code — usually in a `.env` file — so secrets and URLs differ per machine.",
      whyItMatters:
        "Database connection strings and API keys must never be hard-coded or committed to Git.",
    },
  },
};

import { REMAINING_MODULE_ALERTS } from "./bigword-alert-map-part2.mjs";
import { MODULE_ALERTS_PART3 } from "./bigword-alert-map-part3.mjs";
import { MODULE_ALERTS_PART4 } from "./bigword-alert-map-part4.mjs";

Object.assign(MODULE_ALERTS, REMAINING_MODULE_ALERTS, MODULE_ALERTS_PART3, MODULE_ALERTS_PART4);

const BWA_REGEX = /<BigWordAlert[\s\S]*?\/>/g;

function formatAlert(a) {
  return `<BigWordAlert term="${a.term}" plainEnglish="${a.plainEnglish}" whyItMatters="${a.whyItMatters}" />`;
}

function applyAlert(content, alert) {
  if (alert === null) {
    return content.replace(BWA_REGEX, "").replace(/\n{3,}/g, "\n\n");
  }
  const tag = formatAlert(alert);
  if (BWA_REGEX.test(content)) {
    return content.replace(BWA_REGEX, tag);
  }
  // Insert after first blockquote or H1 if missing
  const lines = content.split("\n");
  let insertAt = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("> ") || (lines[i].startsWith("# ") && i > 0)) {
      insertAt = i + 1;
      break;
    }
  }
  if (insertAt === -1) insertAt = lines.findIndex((l) => l.startsWith("# ")) + 1;
  lines.splice(insertAt, 0, "", tag, "");
  return lines.join("\n");
}

let updated = 0;
let removed = 0;
const modules = fs.readdirSync(BASE).filter((d) => fs.statSync(path.join(BASE, d)).isDirectory());

for (const mod of modules.sort()) {
  const alerts = MODULE_ALERTS[mod];
  if (!alerts) {
    console.warn(`WARN: no alerts defined for module ${mod}`);
    continue;
  }
  const files = fs.readdirSync(path.join(BASE, mod)).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const key = file.replace(/\.md$/, "");
    const alert = alerts[key];
    if (alert === undefined) {
      console.warn(`WARN: no alert for ${mod}/${file}`);
      continue;
    }
    const filePath = path.join(BASE, mod, file);
    const before = fs.readFileSync(filePath, "utf8");
    const after = applyAlert(before, alert);
    if (after !== before) {
      fs.writeFileSync(filePath, after);
      if (alert === null) removed++;
      else updated++;
    }
  }
}

// Validate no duplicate terms per module (excluding quiz/checklist)
console.log("\n=== Duplicate check (non-focus chapters) ===");
for (const mod of modules.sort()) {
  const dir = path.join(BASE, mod);
  const terms = {};
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    if (/-quiz\.md$/.test(file) || /-checklist\.md$/.test(file)) continue;
    if (file.includes("where-the-project-is-now")) continue;
    const content = fs.readFileSync(path.join(dir, file), "utf8");
    const m = content.match(/BigWordAlert term="([^"]+)"/);
    if (!m) continue;
    terms[m[1]] = (terms[m[1]] || []).concat(file);
  }
  const dupes = Object.entries(terms).filter(([, files]) => files.length > 1);
  if (dupes.length) {
    console.log(`${mod}: ${dupes.length} duplicate term(s)`);
    for (const [term, files] of dupes) {
      console.log(`  "${term}": ${files.join(", ")}`);
    }
  }
}

console.log(`\nDone: ${updated} updated, ${removed} removed.`);
