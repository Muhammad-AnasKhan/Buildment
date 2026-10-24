export type CartSplitInputs = { northItems: number; southItems: number };

function count(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(4, Math.round(value))) : 0;
}

export function splitCart(input: CartSplitInputs) {
  const northItems = count(input.northItems);
  const southItems = count(input.southItems);
  const orders = [
    ...(northItems > 0 ? [{ store: "North Farm", items: northItems }] : []),
    ...(southItems > 0 ? [{ store: "South Bakery", items: southItems }] : []),
  ];
  return {
    northItems,
    southItems,
    totalItems: northItems + southItems,
    orders,
    orderCount: orders.length,
    paymentCount: orders.length > 0 ? 1 : 0,
  };
}
