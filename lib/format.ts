export const number = (value: number | null | undefined, digits = 2) =>
  value == null || !Number.isFinite(value)
    ? "—"
    : new Intl.NumberFormat("en-US", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(value);
export const price = (value: number | null | undefined) =>
  value == null ? "—" : `$${number(value)}`;
export const percent = (value: number | null | undefined) =>
  value == null ? "—" : `${value > 0 ? "+" : ""}${number(value)}%`;
export const tone = (value: number | null | undefined) =>
  value == null ? "muted" : value >= 0 ? "positive" : "negative";
export const priceRange = (low: number | null, high: number | null) =>
  low == null && high == null
    ? "—"
    : low === high
      ? price(low)
      : `${price(low)} – ${price(high)}`;
export const timestamp = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
export const dayKey = (value: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
export const date = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
