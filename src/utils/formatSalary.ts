const HAS_CURRENCY_MARKER = /[$€£₪]|USD|EUR|GBP|ILS|NIS/i;

// שכר שנשמר כ-0 זה בפועל "לא הוזן" (נתונים ישנים) - עדיף להסתיר מאשר להציג "₪0"
const IS_ZERO = /^0+(\.0+)?$/;

// מציג שכר לתצוגה - מסתיר ערכים ריקים/אפסיים ומוסיף סימן ₪ אם אין כבר סימן מטבע
export function formatSalary(salary?: string | null): string | null {
  const trimmed = (salary || "").trim();
  if (!trimmed || IS_ZERO.test(trimmed)) {
    return null;
  }

  return HAS_CURRENCY_MARKER.test(trimmed) ? trimmed : `₪ ${trimmed}`;
}

// כנ"ל אבל בונה טווח שכר מפורמט ("₪X – ₪Y / month") מתוך המספרים שנמצאו בטקסט החופשי
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
