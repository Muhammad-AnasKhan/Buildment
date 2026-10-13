/** BigWordAlert mappings modules 11–23 and 99. */
export const MODULE_ALERTS_PART3 = {
  "11-manage-products-api": {
    "11.01-set-the-scene": {
      term: "Product inventory API",
      plainEnglish:
        "Server routes for vendors to create, list, update, and delete their catalogue items.",
      whyItMatters:
        "FreshMarket's marketplace is empty without product APIs — browse and cart depend on this layer.",
    },
    "11.02-two-views-of-products": {
      term: "Public vs vendor view",
      plainEnglish:
        "Customers see published products only; vendors see all theirs including drafts and out-of-stock.",
      whyItMatters:
        "FreshMarket uses separate route prefixes — `/products` public vs `/vendor/products` authenticated.",
    },
    "11.03-what-youll-build": {
      term: "Products CRUD API",
      plainEnglish:
        "Full create-read-update-delete routes for product documents scoped to the vendor's store.",
      whyItMatters:
        "Chapter 12's dashboard forms call these endpoints — API must exist before UI.",
    },
    "11.04-public-vs-vendor-routes": {
      term: "Route visibility",
      plainEnglish:
        "Some endpoints are anonymous (browse); others require vendor auth and ownership checks.",
      whyItMatters:
        "FreshMarket public catalogue never exposes unpublished products or vendor-only fields.",
    },
    "11.05-prime-your-thinking": {
      term: "Input validation",
      plainEnglish:
        "Rejecting bad product data at the API — negative price, empty name — before touching the database.",
      whyItMatters:
        "FreshMarket uses Zod or similar on product create — garbage in means garbage on shop pages.",
    },
    "11.06-quiz": {
      term: "Soft delete vs hard delete",
      plainEnglish:
        "Soft delete marks a record inactive; hard delete removes it permanently from the database.",
      whyItMatters:
        "Products referenced by past orders may need to be unpublished rather than destroyed.",
    },
    "11.07-where-the-project-is-now": null,
    "11.08-scaffold-products-module": {
      term: "Products module",
      plainEnglish:
        "Server folder for product routes, service logic, and Mongoose Product model imports.",
      whyItMatters:
        "FreshMarket colocates product CRUD here — same pattern as stores and cart modules.",
    },
    "11.09-create-product-route": {
      term: "Product creation",
      plainEnglish:
        "POST endpoint that attaches a new product to the vendor's store with validated fields.",
      whyItMatters:
        "FreshMarket vendors add mangoes and milk through this route — links product.storeId automatically.",
    },
    "11.10-list-vendor-products": {
      term: "Vendor product list",
      plainEnglish:
        "GET endpoint returning all products for the authenticated vendor's store — including unpublished.",
      whyItMatters:
        "Dashboard product table loads from this route — drives publish toggles and edit links.",
    },
    "11.11-update-product-route": {
      term: "Product PATCH",
      plainEnglish:
        "Partial update of price, stock, description, or publish flag without replacing the whole document.",
      whyItMatters:
        "FreshMarket vendors tweak price and stock daily — PATCH must be safe and ownership-checked.",
    },
    "11.12-delete-product-route": {
      term: "Soft delete vs hard delete",
      plainEnglish:
        "Soft delete marks a record inactive; hard delete removes it permanently from the database.",
      whyItMatters:
        "Products referenced by past orders may need to be unpublished rather than destroyed.",
    },
    "11.13-test-cross-vendor-403": {
      term: "Cross-vendor isolation test",
      plainEnglish:
        "Vendor A's token attempting to PATCH vendor B's product ID — must return 403 Forbidden.",
      whyItMatters:
        "FreshMarket gate proves authorization works — not just happy-path CRUD.",
    },
    "11.14-recap-and-whats-next": {
      term: "Catalogue backend",
      plainEnglish:
        "Vendors can manage products via API; public browse routes come in Chapter 14.",
      whyItMatters:
        "Chapter 12–13 add dashboard UI and photo uploads on top of these routes.",
    },
    "11.15-checklist": {
      term: "CRUD",
      plainEnglish:
        "Create, Read, Update, Delete — the four basic operations for managing resource records.",
      whyItMatters:
        "FreshMarket product management is classic CRUD with auth — pattern repeats for cart and orders.",
    },
  },
  "12-vendor-dashboard": {
    "12.01-set-the-scene": {
      term: "Vendor dashboard",
      plainEnglish:
        "The authenticated UI where sellers manage products, stock, and publish status — not the public shop.",
      whyItMatters:
        "FreshMarket vendors spend most of their time here — table views, forms, and toggles must be efficient.",
    },
    "12.02-table-plus-forms": {
      term: "Dashboard UX",
      plainEnglish:
        "Combining data tables for overview with modal or page forms for create/edit — standard admin pattern.",
      whyItMatters:
        "FreshMarket product list + create/edit pages follow this table-plus-forms rhythm.",
    },
    "12.03-what-youll-build": {
      term: "Product management UI",
      plainEnglish:
        "React pages for listing, creating, editing products and toggling publish state.",
      whyItMatters:
        "Vendors never touch curl — this UI calls Chapter 11's product API.",
    },
    "12.04-error-mapping": {
      term: "API error mapping",
      plainEnglish:
        "Translating server error codes and messages into user-friendly inline form or toast errors.",
      whyItMatters:
        "FreshMarket shows 'Price must be positive' not raw `{ error: 'VALIDATION_FAILED' }`.",
    },
    "12.05-where-the-project-is-now": null,
    "12.06-product-list-page": {
      term: "Data table",
      plainEnglish:
        "Tabular UI showing sortable/filterable rows — products with name, price, stock, status columns.",
      whyItMatters:
        "FreshMarket vendors scan inventory at a glance — list page is the dashboard home.",
    },
    "12.07-create-product-page": {
      term: "Create form",
      plainEnglish:
        "A page of inputs for new product fields — submits POST to API and navigates back to list.",
      whyItMatters:
        "First product added through this form is proof the vendor half of the marketplace works.",
    },
    "12.08-edit-product-page": {
      term: "Edit form prefill",
      plainEnglish:
        "Loading existing product into form fields via GET, then PATCH on save.",
      whyItMatters:
        "FreshMarket edit page must not reset fields to empty — fetch before render.",
    },
    "12.09-publish-toggle": {
      term: "Publish toggle",
      plainEnglish:
        "Switch that sets product.isPublished — controls visibility on public shop without deleting.",
      whyItMatters:
        "Vendors hide out-of-season items from shoppers while keeping them in dashboard history.",
    },
    "12.10-verify-vendor-flow": {
      term: "Optimistic UI",
      plainEnglish:
        "Updating the screen immediately while the server request runs, rolling back if it fails.",
      whyItMatters:
        "Publish toggles and inline edits feel snappy when the UI assumes success but handles errors gracefully.",
    },
    "12.11-recap-and-whats-next": {
      term: "Vendor self-service",
      plainEnglish:
        "Vendors manage catalogue without admin intervention — core marketplace value proposition.",
      whyItMatters:
        "Chapter 13 adds photos; Chapter 14 exposes published products to shoppers.",
    },
    "12.12-checklist": {
      term: "Dashboard UX",
      plainEnglish:
        "Combining data tables for overview with modal or page forms for create/edit — standard admin pattern.",
      whyItMatters:
        "FreshMarket product list + create/edit pages follow this table-plus-forms rhythm.",
    },
  },
  "13-product-photos": {
    "13.01-set-the-scene": {
      term: "Product imagery",
      plainEnglish:
        "Photos that make grocery items trustworthy and recognizable on shop cards and detail pages.",
      whyItMatters:
        "FreshMarket shoppers choose with their eyes — products without images convert poorly.",
    },
    "13.02-base64-trap": {
      term: "Base64 in MongoDB trap",
      plainEnglish:
        "Storing image binary as base64 strings inside documents — bloats database and slows queries.",
      whyItMatters:
        "FreshMarket stores Cloudinary URLs on products, never image bytes in MongoDB.",
    },
    "13.03-what-youll-build": {
      term: "Image upload flow",
      plainEnglish:
        "Browser picker → upload to Cloudinary → save URL on product — end-to-end photo pipeline.",
      whyItMatters:
        "Chapter 13 completes the vendor product record — name, price, and photo together.",
    },
    "13.04-object-storage-pattern": {
      term: "Object storage / CDN",
      plainEnglish:
        "Files live on a specialist image service; your database stores only the URL, not the binary photo.",
      whyItMatters:
        "MongoDB documents should not balloon with image bytes — Cloudinary hosts files and serves them fast worldwide.",
    },
    "13.05-prime-your-thinking": {
      term: "Upload pipeline",
      plainEnglish:
        "The path from browser file picker → server or signed upload → stored URL → saved on the product record.",
      whyItMatters:
        "FreshMarket deletes old images when vendors replace photos so storage costs and broken links stay under control.",
    },
    "13.06-quiz": {
      term: "Upload pipeline",
      plainEnglish:
        "The path from browser file picker → server or signed upload → stored URL → saved on the product record.",
      whyItMatters:
        "FreshMarket deletes old images when vendors replace photos so storage costs and broken links stay under control.",
    },
    "13.07-where-the-project-is-now": null,
    "13.08-cloudinary-config": {
      term: "Cloudinary",
      plainEnglish:
        "A hosted image service — upload, transform, resize, and CDN-deliver photos via URL.",
      whyItMatters:
        "FreshMarket uses Cloudinary so vendors get optimized thumbnails without you running image servers.",
    },
    "13.09-upload-route": {
      term: "Multipart upload",
      plainEnglish:
        "HTTP request encoding file binary in multipart/form-data — standard for file upload endpoints.",
      whyItMatters:
        "FreshMarket's upload route accepts FormData from the browser and forwards to Cloudinary.",
    },
    "13.10-delete-old-image": {
      term: "Orphan image cleanup",
      plainEnglish:
        "Deleting the previous Cloudinary asset when a vendor replaces a product photo — avoids storage waste.",
      whyItMatters:
        "FreshMarket vendors re-shoot products often — cleanup prevents paying for unused images.",
    },
    "13.11-upload-ui-component": {
      term: "File input component",
      plainEnglish:
        "React UI with preview, progress, and error states for selecting and uploading an image.",
      whyItMatters:
        "Vendor edit form embeds this component — UX determines whether vendors actually add photos.",
    },
    "13.12-verify-image-flow": {
      term: "Image URL persistence",
      plainEnglish:
        "Confirming uploaded image URL is saved on product and renders on shop product card.",
      whyItMatters:
        "FreshMarket gate requires product with photo visible on public browse — full pipeline proof.",
    },
    "13.13-recap-and-whats-next": {
      term: "Media-ready catalogue",
      plainEnglish:
        "Products can have Cloudinary-hosted images — vendor catalogue ready for customer-facing shop.",
      whyItMatters:
        "Chapter 14–15 expose these products to shoppers with photos on cards and detail pages.",
    },
    "13.14-bridge-to-week-3-customer-experience": {
      term: "Customer experience pivot",
      plainEnglish:
        "Transition from vendor-side build to shopper-side browse, cart, and checkout.",
      whyItMatters:
        "FreshMarket Week 3 assumes vendor catalogue exists — you now build what customers see.",
    },
    "13.15-checklist": {
      term: "Object storage / CDN",
      plainEnglish:
        "Files live on a specialist image service; your database stores only the URL, not the binary photo.",
      whyItMatters:
        "MongoDB documents should not balloon with image bytes — Cloudinary hosts files and serves them fast worldwide.",
    },
  },
  "14-browse-catalogue-api": {
    "14.01-set-the-scene": {
      term: "Public catalogue API",
      plainEnglish:
        "Anonymous or customer-facing endpoints listing published products across all vendors.",
      whyItMatters:
        "FreshMarket shoppers browse without logging in — this API powers the shop experience.",
    },
    "14.02-n-plus-one-trap": {
      term: "N+1 query problem",
      plainEnglish:
        "Fetching a list, then running one extra query per item — often accidentally via lazy population.",
      whyItMatters:
        "Catalogue routes should fetch store names efficiently, not one MongoDB round-trip per product.",
    },
    "14.03-what-youll-build": {
      term: "Catalogue endpoints",
      plainEnglish:
        "Paginated, filterable product list plus single-product detail routes for the shop UI.",
      whyItMatters:
        "Chapter 15's shop page calls these routes — performance and shape matter for UX.",
    },
    "14.04-populate-vs-aggregate": {
      term: "MongoDB populate",
      plainEnglish:
        "Mongoose helper that replaces referenced IDs with full documents in query results — convenient but easy to N+1.",
      whyItMatters:
        "FreshMarket catalogue populates store name on product cards — must be done in one query.",
    },
    "14.05-pagination": {
      term: "Pagination",
      plainEnglish:
        "Returning data in pages (e.g. 20 products at a time) instead of the entire catalogue at once.",
      whyItMatters:
        "FreshMarket catalogues grow quickly; pagination keeps responses fast and mobile-friendly.",
    },
    "14.06-prime-your-thinking": {
      term: "Query performance",
      plainEnglish:
        "Designing database queries so catalogue pages load in one or two round-trips, not hundreds.",
      whyItMatters:
        "Slow shop page loses shoppers — index and populate strategy decided here.",
    },
    "14.07-quiz": {
      term: "N+1 query problem",
      plainEnglish:
        "Fetching a list, then running one extra query per item — often accidentally via lazy population.",
      whyItMatters:
        "Catalogue routes should fetch store names efficiently, not one MongoDB round-trip per product.",
    },
    "14.08-where-the-project-is-now": null,
    "14.09-public-products-route": {
      term: "GET /products",
      plainEnglish:
        "Public list endpoint returning published products with optional filters and pagination params.",
      whyItMatters:
        "FreshMarket shop grid loads from this route — only isPublished true, never vendor drafts.",
    },
    "14.10-filter-query-params": {
      term: "Query string filters",
      plainEnglish:
        "URL params like `?category=fruit&search=mango` that narrow catalogue results server-side.",
      whyItMatters:
        "FreshMarket filter bar syncs state to URL — shareable links and bookmarkable searches.",
    },
    "14.11-pagination-params": {
      term: "page and limit params",
      plainEnglish:
        "Request parameters controlling which slice of results to return — `page=2&limit=20`.",
      whyItMatters:
        "FreshMarket mobile shop loads more products on scroll or page buttons via these params.",
    },
    "14.12-populate-store-name": {
      term: "Joined store metadata",
      plainEnglish:
        "Including vendor store name on each product in the API response — shopper sees who sells what.",
      whyItMatters:
        "Product cards show 'Sold by Green Valley Farm' — populated from store reference.",
    },
    "14.13-single-product-route": {
      term: "GET /products/:id",
      plainEnglish:
        "Detail endpoint returning one product with full fields for the product detail page.",
      whyItMatters:
        "FreshMarket PDP shows description, price, stock, image — this route is the source.",
    },
    "14.14-test-catalogue-api": {
      term: "Catalogue API test",
      plainEnglish:
        "curl or Postman checks for pagination, filters, and populate — before wiring React shop.",
      whyItMatters:
        "Isolate slow or wrong JSON here — do not debug catalogue bugs only in the UI.",
    },
    "14.15-recap-and-whats-next": {
      term: "Shop-ready API",
      plainEnglish:
        "Public product list and detail routes with pagination — backend ready for customer UI.",
      whyItMatters:
        "Chapter 15 builds shop pages; Chapter 16 adds cart API for add-to-cart.",
    },
    "14.16-checklist": {
      term: "Pagination",
      plainEnglish:
        "Returning data in pages (e.g. 20 products at a time) instead of the entire catalogue at once.",
      whyItMatters:
        "FreshMarket catalogues grow quickly; pagination keeps responses fast and mobile-friendly.",
    },
  },
  "15-shop-the-marketplace": {
    "15.01-set-the-scene": {
      term: "Customer shop experience",
      plainEnglish:
        "The public-facing browse UI — grid, filters, product detail — where shoppers discover groceries.",
      whyItMatters:
        "FreshMarket's demand side — without this, vendors have products nobody can find.",
    },
    "15.02-editorial-grid": {
      term: "Editorial grid layout",
      plainEnglish:
        "A responsive product grid with consistent card sizing — shop window, not spreadsheet.",
      whyItMatters:
        "FreshMarket shop page aesthetic drives trust — cards show image, price, vendor name uniformly.",
    },
    "15.03-what-youll-build": {
      term: "Browse UI",
      plainEnglish:
        "Shop page, product cards, filter bar, and detail page wired to catalogue API.",
      whyItMatters:
        "Shoppers interact here — add-to-cart in Chapter 17 starts from these pages.",
    },
    "15.04-where-the-project-is-now": null,
    "15.05-scaffold-customer-pages": {
      term: "Customer route group",
      plainEnglish:
        "Public pages under `/shop` and `/products/:id` — separate from `/vendor` dashboard routes.",
      whyItMatters:
        "FreshMarket layout differs for shoppers vs vendors — route groups keep concerns split.",
    },
    "15.06-product-card-component": {
      term: "Product card component",
      plainEnglish:
        "Reusable UI showing image, title, price, vendor — links to detail page and add-to-cart.",
      whyItMatters:
        "Same card renders in grid and search results — one component, consistent shop feel.",
    },
    "15.07-filter-bar": {
      term: "Client-side filter state",
      plainEnglish:
        "React state (or URL sync) tracking category, search, sort — drives API query params.",
      whyItMatters:
        "FreshMarket filter bar refetches `/products?…` when shopper changes filters.",
    },
    "15.08-shop-page-with-pagination": {
      term: "Infinite scroll vs pagination",
      plainEnglish:
        "Two UX patterns for loading more products — page buttons or scroll-triggered fetch.",
      whyItMatters:
        "FreshMarket shop uses pagination params from Chapter 14 — UI must request next page correctly.",
    },
    "15.09-product-detail-page": {
      term: "Product detail page (PDP)",
      plainEnglish:
        "Full product view — large image, description, stock, add-to-cart — the conversion page.",
      whyItMatters:
        "Shoppers decide here — FreshMarket PDP must load fast and show accurate price/stock.",
    },
    "15.10-verify-browse-ui": {
      term: "Browse smoke test",
      plainEnglish:
        "Manual walkthrough: shop loads, filters work, detail page opens, images render.",
      whyItMatters:
        "FreshMarket gate before cart chapter — prove customer can discover products.",
    },
    "15.11-recap-and-whats-next": {
      term: "Discoverable marketplace",
      plainEnglish:
        "Shoppers can browse multi-vendor catalogue in the browser — demand side visible.",
      whyItMatters:
        "Chapter 16–17 add cart API and UI — browse without cart is window shopping only.",
    },
    "15.12-checklist": {
      term: "Client-side filter state",
      plainEnglish:
        "React state (or URL sync) tracking category, search, sort — drives API query params.",
      whyItMatters:
        "FreshMarket filter bar refetches `/products?…` when shopper changes filters.",
    },
  },
  "16-cart-api": {
    "16.01-set-the-scene": {
      term: "Shopping cart",
      plainEnglish:
        "Mutable list of products a shopper intends to buy — persisted server-side per user.",
      whyItMatters:
        "FreshMarket cart survives refresh and device switch because it lives in MongoDB, not localStorage only.",
    },
    "16.02-why-store-id-on-cart-item": {
      term: "storeId on cart line",
      plainEnglish:
        "Each cart item records which vendor's store it came from — needed for split checkout.",
      whyItMatters:
        "FreshMarket one checkout creates multiple vendor orders — storeId groups line items correctly.",
    },
    "16.03-what-youll-build": {
      term: "Cart REST API",
      plainEnglish:
        "Add, get, update quantity, remove routes — all scoped to authenticated user's cart document.",
      whyItMatters:
        "Chapter 17 cart UI calls these endpoints — server is source of truth for cart state.",
    },
    "16.04-prime-your-thinking": {
      term: "Cart line item",
      plainEnglish:
        "One row in the cart: a product, quantity, and computed subtotal for that vendor's item.",
      whyItMatters:
        "Checkout later groups line items by vendor to create split orders from one payment.",
    },
    "16.05-quiz": {
      term: "Cart line item",
      plainEnglish:
        "One row in the cart: a product, quantity, and computed subtotal for that vendor's item.",
      whyItMatters:
        "Checkout later groups line items by vendor to create split orders from one payment.",
    },
    "16.06-where-the-project-is-now": null,
    "16.07-scaffold-cart-module": {
      term: "Cart module",
      plainEnglish:
        "Server feature folder for cart routes and service — add/get/update/remove logic colocated.",
      whyItMatters:
        "FreshMarket cart is its own domain — not bolted onto product routes.",
    },
    "16.08-add-to-cart-route": {
      term: "Add to cart",
      plainEnglish:
        "POST endpoint incrementing quantity or inserting new line for productId — validates stock.",
      whyItMatters:
        "FreshMarket PDP and product cards call this — first step toward checkout.",
    },
    "16.09-get-cart-route": {
      term: "GET /cart",
      plainEnglish:
        "Returns current user's cart with populated product details and computed totals.",
      whyItMatters:
        "Cart page and header badge load from this route on every navigation.",
    },
    "16.10-update-cart-item": {
      term: "Quantity update",
      plainEnglish:
        "PATCH endpoint changing line item quantity — revalidates stock and recalculates subtotals.",
      whyItMatters:
        "Shoppers change mind on quantities — must not allow ordering more than available stock.",
    },
    "16.11-remove-cart-item": {
      term: "Remove line item",
      plainEnglish:
        "DELETE endpoint removing one product from cart without clearing entire cart.",
      whyItMatters:
        "FreshMarket cart page remove button calls this — cart should update atomically.",
    },
    "16.12-stock-check-on-add": {
      term: "Stock validation",
      plainEnglish:
        "Checking product.stock before adding to cart — reject or cap quantity if insufficient.",
      whyItMatters:
        "FreshMarket cannot promise mangoes at checkout if vendor only has two left.",
    },
    "16.13-user-scoping-test": {
      term: "User-scoped cart",
      plainEnglish:
        "Cart documents keyed by userId — user A never sees user B's cart items.",
      whyItMatters:
        "FreshMarket test: two accounts, add items separately, confirm carts do not merge.",
    },
    "16.14-recap-and-whats-next": {
      term: "Server-side cart",
      plainEnglish:
        "Authenticated API persisting cart in MongoDB — ready for client UI in Chapter 17.",
      whyItMatters:
        "Checkout in Chapter 18 reads this cart document to create orders.",
    },
    "16.15-checklist": {
      term: "Cart line item",
      plainEnglish:
        "One row in the cart: a product, quantity, and computed subtotal for that vendor's item.",
      whyItMatters:
        "Checkout later groups line items by vendor to create split orders from one payment.",
    },
  },
  "17-your-cart": {
    "17.01-set-the-scene": {
      term: "Cart UI",
      plainEnglish:
        "The shopper-facing pages and components showing cart contents, totals, and checkout entry.",
      whyItMatters:
        "FreshMarket conversion happens here — friction on cart page loses sales.",
    },
    "17.02-grouped-by-store": {
      term: "Vendor grouping",
      plainEnglish:
        "Displaying cart lines grouped by store — shopper sees which vendor each item comes from.",
      whyItMatters:
        "FreshMarket multi-vendor cart shows subtotals per vendor before single checkout payment.",
    },
    "17.03-what-youll-build": {
      term: "Cart pages and chrome",
      plainEnglish:
        "Cart page, quantity controls, header badge, add-to-cart wiring from shop pages.",
      whyItMatters:
        "Completes shopper loop: browse → add → review cart → checkout.",
    },
    "17.04-where-the-project-is-now": null,
    "17.05-cart-page": {
      term: "Cart summary page",
      plainEnglish:
        "Full-page view of all line items, quantities, per-vendor subtotals, and checkout button.",
      whyItMatters:
        "FreshMarket shoppers confirm order here before payment — must match server cart exactly.",
    },
    "17.06-quantity-controls": {
      term: "Quantity stepper",
      plainEnglish:
        "Plus/minus controls that update item count and re-fetch or optimistically update the cart.",
      whyItMatters:
        "Cart UX lives or dies on responsive quantity changes and clear remove actions.",
    },
    "17.07-remove-item": {
      term: "Remove from cart UX",
      plainEnglish:
        "Button or icon triggering DELETE cart line — with confirm optional for accidental taps.",
      whyItMatters:
        "FreshMarket cart must feel reversible until checkout — easy remove reduces abandonment guilt.",
    },
    "17.08-wire-add-to-cart": {
      term: "Add-to-cart button",
      plainEnglish:
        "Shop UI action calling POST /cart — with loading state and feedback (toast or badge update).",
      whyItMatters:
        "Product cards and PDP need working add-to-cart — bridge from browse to cart.",
    },
    "17.09-cart-icon-and-count": {
      term: "Header cart badge",
      plainEnglish:
        "Nav icon showing item count — polls or refetches cart on add for immediate feedback.",
      whyItMatters:
        "FreshMarket shoppers expect badge increment when adding mango — confirms action succeeded.",
    },
    "17.10-verify-cart-persists": {
      term: "Cart persistence test",
      plainEnglish:
        "Add items, refresh browser, log out/in — cart contents should match server state.",
      whyItMatters:
        "FreshMarket gate proves server-side cart — not lost on refresh.",
    },
    "17.11-recap-and-whats-next": {
      term: "Complete cart flow",
      plainEnglish:
        "Shopper can add, view, edit, remove cart items in UI — ready for checkout API.",
      whyItMatters:
        "Chapter 18 checkout route consumes this cart and creates orders.",
    },
    "17.12-checklist": {
      term: "Quantity stepper",
      plainEnglish:
        "Plus/minus controls that update item count and re-fetch or optimistically update the cart.",
      whyItMatters:
        "Cart UX lives or dies on responsive quantity changes and clear remove actions.",
    },
  },
};
