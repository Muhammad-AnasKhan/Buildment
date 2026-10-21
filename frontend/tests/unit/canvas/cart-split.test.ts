import { describe, expect, it } from "vitest";
import { splitCart } from "@/canvas/freshmarket-cart-split/model";

describe("FreshMarket cart split", () => {
  it("creates two store-scoped orders from one mixed cart", () => {
    expect(splitCart({ northItems: 2, southItems: 1 })).toMatchObject({ totalItems: 3, orderCount: 2, paymentCount: 1, orders: [{ store: "North Farm", items: 2 }, { store: "South Bakery", items: 1 }] });
  });

  it("creates one order when only one store has items", () => {
    expect(splitCart({ northItems: 4, southItems: 0 })).toMatchObject({ orderCount: 1, paymentCount: 1, orders: [{ store: "North Farm", items: 4 }] });
  });

  it("does not create an order from an empty cart", () => {
    expect(splitCart({ northItems: 0, southItems: 0 })).toMatchObject({ orderCount: 0, paymentCount: 0, orders: [] });
  });

  it("bounds invalid item counts", () => {
    expect(splitCart({ northItems: -5, southItems: Number.NaN })).toMatchObject({ northItems: 0, southItems: 0, orderCount: 0 });
  });
});
