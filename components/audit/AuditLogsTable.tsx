export default function AuditLogsTable({ logs = [] }) 
{ 
    if (!logs.length) return <p className="border-y border-[var(--line)] py-10 text-center font-sans text-sm text-[var(--muted)]">No audit logs found.</p>;

    return(
        <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {
                logs.map(row =>
                    <div key={row.id} className="grid gap-2 py-4 font-sans sm:grid-cols-[100px_1fr_1fr_150px] sm:items-center">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${row.action_type === 'DELETE' ? 'text-[var(--coral)]' : row.action_type === 'INSERT' ? 'text-[var(--teal)]' : 'text-[var(--sun)]'}`}>{row.action_type}</span>
                        <span className="text-sm font-bold">{row.table_name}</span>
                        <span className="text-xs text-[var(--muted)]">{row.record_id}</span>
                        <span className="text-xs text-[var(--muted)]">{row.created_at}</span>
                    </div>
                )
            }
        </div>
    )
}
