"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden px-4 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-white hover:border-cyan/30 transition-colors"
    >
      چاپ / ذخیره PDF
    </button>
  );
}
