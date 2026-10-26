// Minimal CSV writer (RFC 4180): quote fields containing a comma, quote, or line
// break, and double any embedded quotes. Callers pass every row, header included.

export type CsvValue = string | number | boolean | null | undefined;

/** A table ready to hand to `toCsv`: a header row plus value rows. */
export type CsvTable = { header: string[]; rows: CsvValue[][] };

function escapeField(value: CsvValue): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: ReadonlyArray<ReadonlyArray<CsvValue>>): string {
  return rows.map((row) => row.map(escapeField).join(",")).join("\n");
}
