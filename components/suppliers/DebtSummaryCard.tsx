import { CircleDollarSign } from 'lucide-react';

export default function DebtSummaryCard({ amount = 0, currency = 'USD' }) {
  // Ensure valid numerical value
  const numericAmount = Number(amount);
  const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;

  // Format amount with currency symbol and localized comma separators
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(safeAmount);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-md">
      <div className="rounded-lg bg-[var(--teal)]/20 p-2.5 text-[var(--teal)] border border-[var(--teal)]/30">
        <CircleDollarSign size={22} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <div>
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Total supplier debt
        </span>
        <span className="text-xl font-bold tracking-tight text-slate-100">
          {formattedAmount}
        </span>
      </div>
    </div>
  );
}