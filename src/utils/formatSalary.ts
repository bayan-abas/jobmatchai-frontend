// Company job postings and most external-job providers store salary as a bare numeric
// range with no currency marker at all (e.g. "10000 - 20000") - this platform is Israel-only,
// so those get a Shekel prefix for display. A few external sources (e.g. Jobicy, a global
// remote-jobs board) attach their own real currency code/symbol to the figure - that's left
// untouched rather than relabeled, since a remote role may genuinely be paid in a different
// currency and relabeling it ₪ would misrepresent the actual posting.
const HAS_CURRENCY_MARKER = /[$€£₪]|USD|EUR|GBP|ILS|NIS/i;

const IS_ZERO = /^0+(\.0+)?$/;

export function formatSalary(salary?: string | null): string | null {
  const trimmed = (salary || "").trim();
  if (!trimmed || IS_ZERO.test(trimmed)) {
    return null;
  }

  return HAS_CURRENCY_MARKER.test(trimmed) ? trimmed : `₪ ${trimmed}`;
}

// Company-posted jobs store salary as a bare number or a "min - max" range (see
// formatSalary above) - this renders that same raw value as a polished "₪min – ₪max / month"
// string for detail views, with locale-aware thousands separators instead of the raw digits.
// A value that already carries its own currency marker is left to formatSalary/untouched,
// since we can't safely reinterpret e.g. "$120k - $150k" as two plain ILS numbers.
export function formatSalaryRange(salary?: string | null): string | null {
  const trimmed = (salary || "").trim();
  if (!trimmed || IS_ZERO.test(trimmed)) {
    return null;
  }

  if (HAS_CURRENCY_MARKER.test(trimmed)) {
    return trimmed;
  }

  const numbers = trimmed
    .match(/[\d,.]+/g)
    ?.map((n) => Number(n.replace(/,/g, "")))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (!numbers || numbers.length === 0) {
    return null;
  }

  const format = (n: number) => `₪${n.toLocaleString("en-US")}`;

  return numbers.length === 1
    ? `${format(numbers[0])} / month`
    : `${format(numbers[0])} – ${format(numbers[1])} / month`;
}
