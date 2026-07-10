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
