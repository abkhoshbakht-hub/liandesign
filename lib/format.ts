// Pure formatting helpers — safe to import from client components.

export function formatToman(n: number): string {
  return `${n.toLocaleString("fa-IR")} تومان`;
}
