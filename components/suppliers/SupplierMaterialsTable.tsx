export default function SupplierMaterialsTable({ materials = [] }) {
  if (!materials || materials.length === 0) {
    return (
      <p className="border-y border-[var(--line)] py-10 text-center font-sans text-sm text-[var(--muted)]">
        No material history found.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border-y border-[var(--line)]">
      <table className="w-full min-w-[560px] text-left font-sans text-sm">
        <thead className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
          <tr>
            <th className="py-3 pr-4">Material</th>
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Status</th>
            <th className="py-3 pl-4 text-right">Remaining</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {materials.map((row, index) => {
            const isDebt = row.status === 'as_debt' || row.status === 'as_dept';
            const remaining = Number(row.remaining_amount || 0);

            return (
              <tr key={row.id ?? index}>
                <td className="py-4 pr-4 font-bold text-[var(--foreground)]">{row.name || 'Unnamed Material'}</td>
                <td className="px-4 py-4">{row.quantity ?? 0}</td>
                <td className="px-4 py-4">
                  <span className={`font-medium ${isDebt ? 'text-[var(--coral)]' : 'text-[var(--teal)]'}`}>
                    {isDebt ? 'On debt' : 'Paid'}
                  </span>
                </td>
                <td className="py-4 pl-4 text-right font-mono">
                  ${remaining.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}