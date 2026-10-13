export function formatPriceCents(amountCents: number, currency = "USD"): string {
  const amount = amountCents / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
