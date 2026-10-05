'use client';

import { EntityRow } from '@/types/EntityPage';
import { EntityObject } from '@/types/EntityPage';
import { MaterialRecord } from '@/types/materials';
import { ExpenseCategory } from '@/types/expenses';

interface EntityTableCellProps {
    row: EntityRow;
    columnKey: string;
    Suffix?: EntityRow;
}

export function EntityTableCell({ row, columnKey, Suffix }: EntityTableCellProps) {
    const val = row[columnKey];
    console.log('val:', val);
    const suffixVal = Suffix?.[columnKey];

    if (val === null || val === undefined || val === '') {
        return <span className="text-slate-600">—</span>;
    }

    switch (columnKey) {
        case 'salary':
        case 'remaining_amount':
        case 'total_debt':
            return (
                <span className="font-semibold text-emerald-400 font-mono text-sm">
                    ${Number(val).toLocaleString()} {suffixVal ? String(suffixVal) : ''}
                </span>
            );

        case 'status':
            if (val === 'as_dept') {
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 border border-amber-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        On debt
                    </span>
                );
            }
            if (val === 'paid') {
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Paid
                    </span>
                );
            }
            return (
                <span className="inline-flex items-center rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300">
                    {String(val)} {suffixVal ? String(suffixVal) : ''}
                </span>
            );

        case 'properties':
            if (!Array.isArray(val) || val.length === 0) return <span className="text-slate-600">—</span>;
            return (
                <div className="flex flex-col gap-1.5 border-l-2 border-teal-500/60 pl-2.5 py-0.5">
                    {val.map((p , idx) => {
                        const propertyObj = (p as EntityObject)?.property as EntityObject | undefined;
                        return (
                            <div key={(p.id || idx ) as string} className="flex flex-col text-xs leading-tight">
                                <span className="font-medium text-slate-200 dir-rtl text-right sm:text-left">
                                    {propertyObj?.name as string || 'Unassigned'}
                                </span>
                                <span className="text-[11px] text-teal-400/90 font-mono mt-0.5">
                                    {p.role as string || 'No role'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            );

        case 'materials':
            if (!Array.isArray(val) || val.length === 0) return <span className="text-slate-600">—</span>;
            return (
                <div className="flex flex-wrap gap-1.5">
                    {val.map((m: EntityObject, idx: number) => {
                        const materialObj = m as EntityObject | undefined;
                        return (
                        <span key={(m.id || idx) as string} className="inline-flex items-center rounded-md bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 border border-slate-700/50">
                            {materialObj?.name as string || `Material aaa #${idx + 1}`}
                        </span>
                    );})}
                </div>
            );

        
        default:
            return (
                <span>
                    {String(val)} {suffixVal ? <span className="text-slate-400 text-xs ml-1">{String(suffixVal)}</span> : null}
                </span>
            );
    }
}