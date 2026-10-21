# FreshMarket cart split

Claim: one customer's cart can create one order for each store with items, while the customer starts one checkout. Each vendor sees only their own order.

Inputs: item counts for North Farm (0–4 items, step 1, default 2) and South Bakery (0–4 items, step 1, default 1). Orders are created only for stores with at least one item. An empty cart creates no order or payment attempt.

Limits: no price, stock, payment, or transaction model. The server owns grouping and vendor scope; the browser cannot send an authoritative store grouping.

Placement: `18.10-checkout-route.md`, before implementing the grouping step.
