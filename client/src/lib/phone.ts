export function normalizePhone(raw: string): string {
  const digits = raw.trim().replace(/[\s-]/g, "");
  if (digits.startsWith("+60")) return "0" + digits.slice(3);
  if (digits.startsWith("60") && digits.length >= 7) return "0" + digits.slice(2);
  if (/^1\d/.test(digits)) return "0" + digits;
  return digits;
}

export function validatePhone(raw: string): string | undefined {
  if (!raw.trim()) return "• Nombor telefon wajib diisi";
  if (!/^\d{5,}$/.test(normalizePhone(raw))) return "• Nombor telefon tidak sah (min. 5 digit)";
  return undefined;
}
