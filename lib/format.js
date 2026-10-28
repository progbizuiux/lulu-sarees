// One place to format money, dates and addresses, so changes happen in one file.

// Indian rupees with Indian digit grouping: ₹1,099 — paise only when there are some: ₹179.90
const rupees = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const rupeesWithPaise = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatPrice(amount) {
  const value = Number(amount);
  const safe = Number.isFinite(value) ? value : 0;
  return `₹${(Number.isInteger(safe) ? rupees : rupeesWithPaise).format(safe)}`;
}

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });
const dateTimeFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** "26 October 2026", or with time: "26 Oct 2026, 3:45 pm". Empty string for missing/invalid dates. */
export function formatDate(value, { withTime = false } = {}) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return (withTime ? dateTimeFormat : dateFormat).format(date);
}

/** Address as one line: "12 MG Road, Near City Mall, Kochi, Kerala 682016". */
export function formatAddress(address) {
  if (!address) return "";
  const cityLine = [address.city, [address.state, address.pincode].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  return [address.line1, address.line2, address.landmark, cityLine].filter(Boolean).join(", ");
}
