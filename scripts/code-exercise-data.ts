/**
 * Module-scoped code exercises injected during `npm run content:import`.
 * Kept sparse (~1 per major build milestone) — practice tied to the lesson's domain.
 */
export type CodeExerciseDef = {
  mode: "complete" | "implement";
  prompt: string;
  starterCode: string;
  filename?: string;
  hints?: string[];
  explanation?: string;
  solution?: string;
  tests: { name: string; code: string }[];
};

/** Key: `${moduleDir}/${fileName}` */
export const CODE_EXERCISES: Record<string, CodeExerciseDef> = {
  "02-project-skeleton/02.11-the-health-route.md": {
    mode: "implement",
    prompt:
      "Implement `buildHealthResponse()` — the minimum JSON body FreshMarket's `GET /health` route should return in Chapter 2.",
    filename: "health.js",
    hints: [
      "Return a plain object with a `status` field set to the string \"ok\".",
    ],
    explanation:
      "Load balancers and the Chapter 4 extended health check both expect `{ status: \"ok\" }` as the baseline.",
    solution: `function buildHealthResponse() {
  return { status: "ok" };
}

module.exports = { buildHealthResponse };`,
    starterCode: `function buildHealthResponse() {
  // TODO: return the minimum health JSON for this course
}

module.exports = { buildHealthResponse };`,
    tests: [
      {
        name: "returns status ok",
        code: `
          const { buildHealthResponse } = module.exports;
          const result = buildHealthResponse();
          if (!result || result.status !== "ok") {
            throw new Error("Expected { status: 'ok' }");
          }
        `,
      },
    ],
  },

  "02-project-skeleton/02.14-api-client-helper.md": {
    mode: "implement",
    prompt:
      "Implement `buildApiUrl(baseUrl, path)` — join the API base from env with a route path (handles trailing slashes).",
    filename: "client.js",
    hints: [
      "Trim trailing `/` from baseUrl.",
      "Ensure path starts with `/` before concatenating.",
    ],
    explanation:
      "Every fetch in the client goes through one helper — no hardcoded `http://localhost:5000` in components.",
    solution: `function buildApiUrl(baseUrl, path) {
  const base = baseUrl.replace(/\\/+$/, "");
  const route = path.startsWith("/") ? path : \`/\${path}\`;
  return base + route;
}

module.exports = { buildApiUrl };`,
    starterCode: `function buildApiUrl(baseUrl, path) {
  // TODO: join base URL and path safely
}

module.exports = { buildApiUrl };`,
    tests: [
      {
        name: "joins base and path",
        code: `
          const { buildApiUrl } = module.exports;
          const url = buildApiUrl("http://localhost:5000/", "/health");
          if (url !== "http://localhost:5000/health") throw new Error("Expected http://localhost:5000/health");
        `,
      },
      {
        name: "handles base without trailing slash",
        code: `
          const { buildApiUrl } = module.exports;
          const url = buildApiUrl("http://localhost:5000", "health");
          if (url !== "http://localhost:5000/health") throw new Error("Expected slash between base and path");
        `,
      },
    ],
  },

  "04-config-and-database/04.10-config-module.md": {
    mode: "complete",
    prompt:
      "Complete `getRequiredEnv` so it returns the env value when set, or throws a clear error when missing.",
    filename: "config.js",
    hints: [
      "Check whether `env[name]` is undefined or an empty string.",
      "Throw `new Error(\\`Missing required env: ${name}\\`)` when absent.",
    ],
    explanation:
      "Config modules fail fast at boot — better than mysterious 500s mid-request when `JWT_SECRET` was never set.",
    solution: `function getRequiredEnv(env, name) {
  const value = env[name];
  if (value === undefined || value === "") {
    throw new Error(\`Missing required env: \${name}\`);
  }
  return value;
}

module.exports = { getRequiredEnv };`,
    starterCode: `function getRequiredEnv(env, name) {
  const value = env[name];
  // TODO: throw if missing/empty, otherwise return value
}

module.exports = { getRequiredEnv };`,
    tests: [
      {
        name: "returns existing value",
        code: `
          const { getRequiredEnv } = module.exports;
          if (getRequiredEnv({ PORT: "4000" }, "PORT") !== "4000") {
            throw new Error("Should return PORT");
          }
        `,
      },
      {
        name: "throws when missing",
        code: `
          const { getRequiredEnv } = module.exports;
          try {
            getRequiredEnv({}, "JWT_SECRET");
            throw new Error("Should have thrown");
          } catch (err) {
            if (!String(err.message).includes("JWT_SECRET")) throw err;
          }
        `,
      },
    ],
  },

  "05-data-model-and-seed/05.12-product-model.md": {
    mode: "implement",
    prompt:
      "Implement `formatPrice(cents)` — grocery prices are stored in cents but shown as `\"₹12.50\"` in the UI.",
    filename: "product-utils.js",
    hints: [
      "Divide cents by 100 and fix to two decimal places.",
      "Prefix with the rupee symbol: `₹`.",
    ],
    explanation:
      "Never store floats for money — format only at the display layer.",
    solution: `function formatPrice(cents) {
  const rupees = (cents / 100).toFixed(2);
  return \`₹\${rupees}\`;
}

module.exports = { formatPrice };`,
    starterCode: `function formatPrice(cents) {
  // TODO: convert integer cents to a display string like "₹12.50"
}

module.exports = { formatPrice };`,
    tests: [
      {
        name: "formats whole rupees",
        code: `
          const { formatPrice } = module.exports;
          if (formatPrice(500) !== "₹5.00") throw new Error("Expected ₹5.00");
        `,
      },
      {
        name: "formats paise",
        code: `
          const { formatPrice } = module.exports;
          if (formatPrice(1250) !== "₹12.50") throw new Error("Expected ₹12.50");
        `,
      },
    ],
  },

  "06-authentication-api/06.12-register-handler.md": {
    mode: "implement",
    prompt:
      "Implement `validateRegisterInput(body)` — return `{ ok: true }` or `{ ok: false, message }` for the register contract in this lesson.",
    filename: "register-validation.js",
    hints: [
      "Email must contain `@`. Password must be at least 8 characters.",
      "Role must be exactly `vendor` or `customer`.",
    ],
    explanation:
      "Validate before you hash or write to MongoDB — duplicate email is a separate 409 check in the handler.",
    solution: `function validateRegisterInput(body) {
  if (!body.email || !String(body.email).includes("@")) {
    return { ok: false, message: "Invalid email" };
  }
  if (!body.password || String(body.password).length < 8) {
    return { ok: false, message: "Password must be at least 8 characters" };
  }
  if (body.role !== "vendor" && body.role !== "customer") {
    return { ok: false, message: "Invalid role" };
  }
  return { ok: true };
}

module.exports = { validateRegisterInput };`,
    starterCode: `function validateRegisterInput(body) {
  // TODO: validate email, password (min 8), role (vendor|customer)
  // Return { ok: true } or { ok: false, message: "..." }
}

module.exports = { validateRegisterInput };`,
    tests: [
      {
        name: "accepts valid payload",
        code: `
          const { validateRegisterInput } = module.exports;
          const r = validateRegisterInput({
            email: "a@b.com",
            password: "longenough",
            role: "customer",
          });
          if (!r.ok) throw new Error("Should accept valid input");
        `,
      },
      {
        name: "rejects short password",
        code: `
          const { validateRegisterInput } = module.exports;
          const r = validateRegisterInput({
            email: "a@b.com",
            password: "short",
            role: "customer",
          });
          if (r.ok) throw new Error("Should reject short password");
        `,
      },
    ],
  },

  "06-authentication-api/06.14-access-token.md": {
    mode: "complete",
    prompt:
      "Complete `buildAccessTokenPayload(user)` — JWT payload must include `sub` (user id) and `role` for middleware in later chapters.",
    filename: "token-payload.js",
    hints: ["Use `sub` for the user id string.", "Copy `role` from the user object."],
    explanation:
      "Keep JWT payloads tiny — identity + role is enough; load profile details from the DB in guards.",
    solution: `function buildAccessTokenPayload(user) {
  return {
    sub: user.id,
    role: user.role,
  };
}

module.exports = { buildAccessTokenPayload };`,
    starterCode: `function buildAccessTokenPayload(user) {
  return {
    // TODO: sub = user.id, role = user.role
  };
}

module.exports = { buildAccessTokenPayload };`,
    tests: [
      {
        name: "includes sub and role",
        code: `
          const { buildAccessTokenPayload } = module.exports;
          const payload = buildAccessTokenPayload({ id: "u1", role: "vendor" });
          if (payload.sub !== "u1" || payload.role !== "vendor") {
            throw new Error("Expected sub and role");
          }
        `,
      },
    ],
  },

  "07-login-and-registration/07.10-auth-context-or-hook.md": {
    mode: "implement",
    prompt:
      "Implement `getStoredAccessToken(storage)` — read the access token from `localStorage` using the key this course standardizes on.",
    filename: "auth-storage.js",
    hints: [
      "Use the key `'freshmarket_access_token'`.",
      "Return `null` when storage is empty or the key is missing.",
    ],
    explanation:
      "Centralize the storage key in one helper so Chapter 7 pages and the API interceptor stay in sync.",
    solution: `const TOKEN_KEY = "freshmarket_access_token";

function getStoredAccessToken(storage) {
  return storage.getItem(TOKEN_KEY);
}

module.exports = { getStoredAccessToken, TOKEN_KEY };`,
    starterCode: `const TOKEN_KEY = "freshmarket_access_token";

function getStoredAccessToken(storage) {
  // TODO: return token string or null
}

module.exports = { getStoredAccessToken, TOKEN_KEY };`,
    tests: [
      {
        name: "reads token when present",
        code: `
          const { getStoredAccessToken } = module.exports;
          const storage = { getItem: (k) => (k === "freshmarket_access_token" ? "abc" : null) };
          if (getStoredAccessToken(storage) !== "abc") throw new Error("Should read token");
        `,
      },
      {
        name: "returns null when missing",
        code: `
          const { getStoredAccessToken } = module.exports;
          const storage = { getItem: () => null };
          if (getStoredAccessToken(storage) !== null) throw new Error("Should return null");
        `,
      },
    ],
  },

  "06-authentication-api/06.17-auth-middleware.md": {
    mode: "implement",
    prompt:
      "Implement `extractBearerToken(authHeader)` — pull the JWT string from an `Authorization: Bearer <token>` header.",
    filename: "auth.middleware.js",
    hints: [
      "Return null if the header is missing or does not start with `Bearer `.",
      "Return everything after `Bearer ` (trim whitespace).",
    ],
    explanation:
      "`requireAuth` calls this first — without it, every protected route would duplicate header parsing.",
    solution: `function extractBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim() || null;
}

module.exports = { extractBearerToken };`,
    starterCode: `function extractBearerToken(authHeader) {
  // TODO: return token string or null
}

module.exports = { extractBearerToken };`,
    tests: [
      {
        name: "parses bearer token",
        code: `
          const { extractBearerToken } = module.exports;
          const t = extractBearerToken("Bearer abc123");
          if (t !== "abc123") throw new Error("Expected abc123");
        `,
      },
      {
        name: "returns null for missing header",
        code: `
          const { extractBearerToken } = module.exports;
          if (extractBearerToken(undefined) !== null) throw new Error("Expected null");
          if (extractBearerToken("Basic xyz") !== null) throw new Error("Expected null for non-Bearer");
        `,
      },
    ],
  },

  "08-authorization-and-isolation/08.11-ownership-helper.md": {
    mode: "implement",
    prompt:
      "Implement `assertSameOwner(resourceOwnerId, requestUserId)` — throw if a vendor tries to touch another store's data.",
    filename: "ownership.js",
    hints: [
      "Compare ids with strict equality.",
      "Throw `new Error(\"Forbidden\")` when they differ.",
    ],
    explanation:
      "Role checks are not enough — a vendor must only mutate rows they own. This helper is the pattern for IDOR prevention.",
    solution: `function assertSameOwner(resourceOwnerId, requestUserId) {
  if (resourceOwnerId !== requestUserId) {
    throw new Error("Forbidden");
  }
}

module.exports = { assertSameOwner };`,
    starterCode: `function assertSameOwner(resourceOwnerId, requestUserId) {
  // TODO: throw if ids do not match
}

module.exports = { assertSameOwner };`,
    tests: [
      {
        name: "passes when ids match",
        code: `
          const { assertSameOwner } = module.exports;
          assertSameOwner("u1", "u1");
        `,
      },
      {
        name: "throws when ids differ",
        code: `
          const { assertSameOwner } = module.exports;
          try {
            assertSameOwner("u1", "u2");
            throw new Error("Should have thrown");
          } catch (e) {
            if (e.message !== "Forbidden") throw e;
          }
        `,
      },
    ],
  },

  "11-manage-products-api/11.09-create-product-route.md": {
    mode: "complete",
    prompt:
      "Complete `toPriceCents(rupees)` — convert a decimal rupee price from the form into integer cents for MongoDB.",
    filename: "product-service.js",
    hints: [
      "Multiply by 100 and round to the nearest integer.",
      "Use `Math.round` — never store floats in the database.",
    ],
    explanation:
      "The vendor dashboard shows rupees; the product model stores `priceCents` as an integer.",
    solution: `function toPriceCents(rupees) {
  return Math.round(Number(rupees) * 100);
}

module.exports = { toPriceCents };`,
    starterCode: `function toPriceCents(rupees) {
  // TODO: convert decimal rupees to integer cents
}

module.exports = { toPriceCents };`,
    tests: [
      {
        name: "converts rupees to cents",
        code: `
          const { toPriceCents } = module.exports;
          if (toPriceCents(12.5) !== 1250) throw new Error("Expected 1250 cents");
        `,
      },
      {
        name: "rounds fractional paise",
        code: `
          const { toPriceCents } = module.exports;
          if (toPriceCents(9.99) !== 999) throw new Error("Expected 999 cents");
        `,
      },
    ],
  },

  "14-browse-catalogue-api/14.10-filter-query-params.md": {
    mode: "implement",
    prompt:
      "Implement `buildCategoryFilter(category)` — return a MongoDB filter object or `{}` when no category is selected.",
    filename: "catalogue-filters.js",
    hints: [
      "When category is missing or blank, return `{}`.",
      "Otherwise return `{ category: category }`.",
    ],
    explanation:
      "Public catalogue routes combine this with store and pagination filters — keep each helper tiny and testable.",
    solution: `function buildCategoryFilter(category) {
  if (!category || String(category).trim() === "") return {};
  return { category: String(category).trim() };
}

module.exports = { buildCategoryFilter };`,
    starterCode: `function buildCategoryFilter(category) {
  // TODO: return {} or { category }
}

module.exports = { buildCategoryFilter };`,
    tests: [
      {
        name: "returns empty filter when absent",
        code: `
          const { buildCategoryFilter } = module.exports;
          if (Object.keys(buildCategoryFilter("")).length !== 0) throw new Error("Expected {}");
        `,
      },
      {
        name: "filters by category",
        code: `
          const { buildCategoryFilter } = module.exports;
          const f = buildCategoryFilter("dairy");
          if (f.category !== "dairy") throw new Error("Expected category dairy");
        `,
      },
    ],
  },

  "16-cart-api/16.08-add-to-cart-route.md": {
    mode: "implement",
    prompt:
      "Implement `calcLineSubtotal(priceCents, quantity)` — cart lines store integer cents; subtotal must stay an integer.",
    filename: "cart-math.js",
    hints: ["Multiply price × quantity.", "Do not use floating point — both inputs are integers."],
    explanation:
      "Every cart total in this course builds on integer-cent math to avoid rounding bugs at checkout.",
    solution: `function calcLineSubtotal(priceCents, quantity) {
  return priceCents * quantity;
}

module.exports = { calcLineSubtotal };`,
    starterCode: `function calcLineSubtotal(priceCents, quantity) {
  // TODO: return subtotal in cents (integer)
}

module.exports = { calcLineSubtotal };`,
    tests: [
      {
        name: "multiplies price and quantity",
        code: `
          const { calcLineSubtotal } = module.exports;
          if (calcLineSubtotal(250, 3) !== 750) throw new Error("Expected 750");
        `,
      },
    ],
  },

  "18-checkout-and-orders/18.10-checkout-route.md": {
    mode: "complete",
    prompt:
      "Complete `groupLinesByStore(lines)` — checkout splits one cart into one order per vendor using each line's `storeId`.",
    filename: "checkout-split.js",
    hints: [
      "Return an object/map keyed by storeId.",
      "Each value should be an array of lines belonging to that store.",
    ],
    explanation:
      "This is the core multi-vendor split — one payment, multiple vendor orders.",
    solution: `function groupLinesByStore(lines) {
  const groups = {};
  for (const line of lines) {
    if (!groups[line.storeId]) groups[line.storeId] = [];
    groups[line.storeId].push(line);
  }
  return groups;
}

module.exports = { groupLinesByStore };`,
    starterCode: `function groupLinesByStore(lines) {
  const groups = {};
  for (const line of lines) {
    // TODO: push line into groups[line.storeId]
  }
  return groups;
}

module.exports = { groupLinesByStore };`,
    tests: [
      {
        name: "groups by storeId",
        code: `
          const { groupLinesByStore } = module.exports;
          const groups = groupLinesByStore([
            { storeId: "s1", productId: "p1" },
            { storeId: "s2", productId: "p2" },
            { storeId: "s1", productId: "p3" },
          ]);
          if (groups.s1.length !== 2 || groups.s2.length !== 1) {
            throw new Error("Expected 2 lines for s1 and 1 for s2");
          }
        `,
      },
    ],
  },
};

export function codeExerciseForLesson(moduleDir: string, fileName: string): CodeExerciseDef | null {
  return CODE_EXERCISES[`${moduleDir}/${fileName}`] ?? null;
}

export function codeExerciseToYaml(exercise: CodeExerciseDef): string {
  const payload = {
    mode: exercise.mode,
    prompt: exercise.prompt,
    starterCode: exercise.starterCode,
    ...(exercise.filename ? { filename: exercise.filename } : {}),
    ...(exercise.hints ? { hints: exercise.hints } : {}),
    ...(exercise.explanation ? { explanation: exercise.explanation } : {}),
    ...(exercise.solution ? { solution: exercise.solution } : {}),
    tests: exercise.tests,
  };
  // js-yaml is imported in import-course.ts — duplicate minimal serializer here to avoid circular deps
  const lines: string[] = [];
  function dump(key: string, value: unknown, indent = 0) {
    const pad = "  ".repeat(indent);
    if (typeof value === "string" && value.includes("\n")) {
      lines.push(`${pad}${key}: |`);
      for (const line of value.split("\n")) lines.push(`${pad}  ${line}`);
    } else if (Array.isArray(value)) {
      lines.push(`${pad}${key}:`);
      for (const item of value) {
        if (typeof item === "object" && item !== null) {
          lines.push(`${pad}  - name: ${JSON.stringify((item as { name: string }).name)}`);
          lines.push(`${pad}    code: |`);
          for (const line of String((item as { code: string }).code).trim().split("\n")) {
            lines.push(`${pad}      ${line}`);
          }
        } else {
          lines.push(`${pad}  - ${JSON.stringify(item)}`);
        }
      }
    } else {
      lines.push(`${pad}${key}: ${JSON.stringify(value)}`);
    }
  }
  dump("mode", payload.mode);
  dump("prompt", payload.prompt);
  dump("starterCode", payload.starterCode);
  if (payload.filename) dump("filename", payload.filename);
  if (payload.hints) dump("hints", payload.hints);
  if (payload.explanation) dump("explanation", payload.explanation);
  if (payload.solution) dump("solution", payload.solution);
  dump("tests", payload.tests);
  return "```code\n" + lines.join("\n") + "\n```";
}
