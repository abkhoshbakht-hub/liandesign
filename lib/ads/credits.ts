// Credit bonus — pure (§27). Unit-testable.

export function creditBonus(
  amount: number,
  threshold: number,
  percent: number
): { bonus: number; total: number } {
  if (!Number.isInteger(amount) || amount <= 0) return { bonus: 0, total: 0 };
  if (amount >= threshold && percent > 0) {
    const bonus = Math.floor((amount * percent) / 100);
    return { bonus, total: amount + bonus };
  }
  return { bonus: 0, total: amount };
}
