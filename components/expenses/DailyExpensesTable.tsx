export default function DailyExpensesTable({ expenses = [] }) {
  if (!expenses.length) {
    return (
      <p className="border-y border-[var(--line)] py-10 text-center font-sans text-sm text-[var(--muted)]">
        No expenses found.
      </p>
    );
  }

  return (
    <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
      {expenses.map((row) => (
        <div
          key={row.id}
          className="grid gap-3 py-4 font-sans sm:grid-cols-[1fr_1fr_auto_auto] sm:items-center"
        >
          <div>
            <p className="text-sm font-bold">{row.paid_to}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {row.sender} / {row.expense_date}
            </p>
          </div>
          <span className="text-xs uppercase text-[var(--muted)]">
            {row.payment_method}
          </span>
          <span className="text-sm">
            ${Number(row.amount).toLocaleString()}
          </span>
          <span className="text-right text-[var(--teal)]">Recorded</span>
        </div>
      ))}
    </div>
  );
}