'use client';

import Link from 'next/link';
import { useState, useEffect, MouseEvent, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { EntityPageProps, EntityRow } from '@/types/EntityPage';
import { MaterialRecord } from '@/types/materials';
import { ExpenseCategory } from '@/types/expenses';

export default function EntityPage({
    title,
    eyebrow,
    description,
    rows: initialRows = [],
    columns = [],
    action = 'Add record',
    actionHref,
    onAction,
    onSave,
    onDelete,
}: EntityPageProps) {
    const router = useRouter();

    const [tableRows, setTableRows] = useState<EntityRow[]>(initialRows);
    const [selectedRow, setSelectedRow] = useState<EntityRow | null>(null);
    const [editData, setEditData] = useState<Partial<EntityRow> | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        setTableRows(initialRows);
    }, [initialRows]);

    const closeDetails = useCallback(() => {
        if (isSaving) return;
        setSelectedRow(null);
        setEditData(null);
        setSaveError('');
    }, [isSaving]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && selectedRow) {
                closeDetails();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedRow, closeDetails]);

    const openDetails = (row: EntityRow) => {
        setSelectedRow(row);
        setSaveError('');
        const newRow: Partial<EntityRow> = {};

        for (const { key, type } of columns) {
            const rawValue = row[key];

            if (type === 'select' && Array.isArray(rawValue)) {
                newRow[key] = rawValue[0]?.propertyId || rawValue[0]?.id || '';
            } else {
                newRow[key] = rawValue ?? '';
            }
        }

        setEditData(newRow);
    };

    const openRowDetails = (row: EntityRow) => {
        openDetails(row);
    };

    const handleDelete = async (event: MouseEvent, row: EntityRow) => {
        event.stopPropagation();
        if (!onDelete) return;
        if (deletingId || !window.confirm(`Delete record: ${row.name || row.id}?`)) return;

        setDeletingId(row.id);
        setSaveError('');

        try {
            await onDelete(row.id);

            setTableRows((prevRows) => prevRows.filter((currentRow) => currentRow.id !== row.id));
            if (selectedRow?.id === row.id) closeDetails();
            router.refresh();
        } catch (error) {
            setSaveError(error instanceof Error ? error.message : 'Unable to delete record.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleSave = async (event: FormEvent) => {
        event.preventDefault();
        if (!selectedRow || !editData || !onSave) return;

        setIsSaving(true);
        setSaveError('');

        try {
            const updatedDataFromParent = await onSave(selectedRow.id, editData);

            const finalUpdatedRow: EntityRow = {
                ...selectedRow,
                ...editData,
                ...(updatedDataFromParent && typeof updatedDataFromParent === 'object' ? updatedDataFromParent : {}),
            };

            setTableRows((prevRows) =>
                prevRows.map((row) => (row.id === selectedRow.id ? finalUpdatedRow : row))
            );

            setSelectedRow(finalUpdatedRow);
            closeDetails();
            router.refresh();
        } catch (error) {
            setSaveError(error instanceof Error ? error.message : 'Unable to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    const renderCellContent = (row: EntityRow, key: string) => {
        const val = row[key];
        if (val === null || val === undefined || val === '') return <span className="text-slate-600">—</span>;

        switch (key) {
            case 'salary':
            case 'remaining_amount':
            case 'total_debt':
                return <span className="font-semibold text-emerald-400 font-mono text-sm">${Number(val).toLocaleString()}</span>;
            case 'experienceYears':
                return <span>{val} years</span>;
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
                return <span className="inline-flex items-center rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300">{val}</span>;
            case 'properties':
                if (!Array.isArray(val) || val.length === 0) return <span className="text-slate-600">—</span>;

                return (
                    <div className="flex flex-col gap-1.5 border-l-2 border-teal-500/60 pl-2.5 py-0.5">
                        {val.map((p, idx) => (
                            <div key={idx} className="flex flex-col text-xs leading-tight">
                                <span className="font-medium text-slate-200 dir-rtl text-right sm:text-left">
                                    {p.property?.name || p.name || 'Unassigned'}
                                </span>
                                <span className="text-[11px] text-teal-400/90 font-mono mt-0.5">
                                    {p.role || 'No role'}
                                </span>
                            </div>
                        ))}
                    </div>
                );
            case 'materials':
                if (!Array.isArray(val) || val.length === 0) return <span className="text-slate-600">—</span>;
                return (
                    <div className="flex flex-wrap gap-1.5">
                        {val.map((material: MaterialRecord, idx: number) => (
                            <span key={idx} className="inline-flex items-center rounded-md bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 border border-slate-700/50">
                                {material.name || `Material #${idx + 1}`}
                            </span>
                        ))}
                    </div>
                );
            case 'category':
                if (!Array.isArray(val) || val.length === 0)
                    return (
                        <div className="flex flex-col gap-1">
                            <span key={val.id} className="text-xs text-slate-300">
                                {val.name || `Material #${val}`}
                            </span>
                        </div>
                    );
                return (
                    <div className="flex flex-wrap gap-1.5">
                        {val.map((category: ExpenseCategory, idx: number) => (
                            <span key={idx} className="inline-flex items-center rounded-md bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 border border-slate-700/50">
                                {category.name || `Material #${idx + 1}`}
                            </span>
                        ))}
                    </div>
                );
            default:
                return String(val);
        }
    };

    const EXCLUDED_EDIT_KEYS = ['total_debt', 'updatedAt', 'id', 'createdAt', 'properties', 'materials'];

    const getRowBackgroundStyle = (index: number, total: number) => {
        const totalRows = Math.max(total - 1, 1);
        const progress = index / totalRows;
        const baseLightness = 5 + progress * 4; 
        return {
            backgroundColor: `hsl(222, 20%, ${baseLightness}%)`,
            animationDelay: `${index * 40}ms`,
        };
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 lg:p-10 font-sans antialiased">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
                    <div className="space-y-2">
                        {eyebrow && (
                            <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 px-3 py-1 rounded-md border border-teal-500/20">
                                {eyebrow}
                            </span>
                        )}
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{title}</h1>
                        {description && (
                            <p className="max-w-2xl text-sm text-slate-400 leading-relaxed">{description}</p>
                        )}
                    </div>

                    {tableRows.length !== 0 &&(<div className="flex-shrink-0">
                        {actionHref ? (
                            <Link 
                                href={actionHref} 
                                className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-500/10 hover:bg-teal-300 active:scale-[0.98] transition-all duration-150"
                            >
                                <span className="text-lg leading-none">+</span>
                                {action}
                            </Link>
                        ) : onAction ? (
                            <button 
                                onClick={onAction} 
                                className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-500/10 hover:bg-teal-300 active:scale-[0.98] transition-all duration-150"
                            >
                                <span className="text-lg leading-none">+</span>
                                {action}
                            </button>
                        ) : null}
                    </div>)}
                </div>

                {/* Table View */}
                <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/30 shadow-2xl backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans text-sm border-collapse min-w-[700px]">
                            <thead className="border-b border-slate-800/80 bg-slate-900/90 text-[11px] font-bold uppercase tracking-wider text-slate-400 sticky top-0 z-10">
                                <tr>
                                    {columns.map((column) => (
                                        <th key={column.key} className="py-4 px-6 min-w-[140px] max-w-[280px]">
                                            {column.label}
                                        </th>
                                    ))}
                                    {action !== 'Add expense' && (
                                        <th className="py-4 px-6 text-right w-[160px] min-w-[160px]">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {tableRows.map((row, index) => (
                                    <tr
                                        key={row.id}
                                        style={getRowBackgroundStyle(index, tableRows.length)}
                                        className="group cursor-pointer transition-colors duration-150 hover:!bg-slate-800/60 animate-in fade-in slide-in-from-bottom-1 fill-mode-backwards"
                                        onClick={() => openRowDetails(row)}
                                    >
                                        {columns.map((column) => (
                                            <td key={column.key} className="py-4 px-6 min-w-[140px] max-w-[280px] whitespace-normal break-words text-slate-300 group-hover:text-slate-100 transition-colors">
                                                {renderCellContent(row, column.key)}
                                            </td>
                                        ))}
                                        {action !== 'Add expense' &&(<td className="py-4 px-6 text-right whitespace-nowrap w-[160px] min-w-[160px]">
                                            <div className="flex items-center justify-end gap-4 min-w-max">
                                                    <button 
                                                        type="button" 
                                                        className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
                                                    >
                                                        Edit
                                                    </button>
                                                {onDelete && action !== 'Add supplier' && action !== 'Add expense' && (
                                                    <button
                                                        type="button"
                                                        onClick={(event) => handleDelete(event, row)}
                                                        disabled={deletingId === row.id}
                                                        className="text-xs font-semibold text-rose-400 hover:text-rose-300 disabled:opacity-50 transition-colors cursor-pointer"
                                                    >
                                                        {deletingId === row.id ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {tableRows.length === 0 && (
                        <div className="py-16 text-center font-sans text-sm text-slate-500">
                            No records found.
                        </div>
                    )}
                </div>

                {/* Modal Overlay */}
                {selectedRow && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-150"
                        onClick={closeDetails}
                    >
                        <div
                            className="w-full max-w-lg overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/60">
                                <h3 className="text-base font-bold text-white">Edit Details</h3>
                                <button
                                    type="button"
                                    onClick={closeDetails}
                                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                                    disabled={isSaving}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-6 font-sans text-sm text-slate-300">
                                <form onSubmit={handleSave} className="space-y-4">
                                    <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-4">
                                        {columns
                                            .filter(({ key }) => !EXCLUDED_EDIT_KEYS.includes(key))
                                            .map(({ key, label, type, options }) => {
                                                return (
                                                    <label key={key} className="block space-y-1.5 text-xs font-semibold text-slate-300">
                                                        <span>{label}</span>
                                                        {type === 'select' ? (
                                                            <select
                                                                name={key}
                                                                value={
                                                                    Array.isArray(editData?.[key])
                                                                        ? editData?.[key][0]?.propertyId || editData?.[key][0]?.id || ''
                                                                        : editData?.[key] ?? ''
                                                                }
                                                                onChange={(e) =>
                                                                    setEditData((prev) => ({
                                                                        ...prev,
                                                                        [key]: e.target.value,
                                                                    }))
                                                                }
                                                                className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-2.5 text-sm font-normal text-slate-100 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                                                            >
                                                                <option value="" className="bg-slate-900 text-slate-400">اختر...</option>
                                                                {options?.map((opt) => (
                                                                    <option key={String(opt.value)} value={opt.value} className="bg-slate-900 text-slate-100">
                                                                        {opt.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <input
                                                                name={key}
                                                                type={type || 'text'}
                                                                value={editData?.[key] ?? ''}
                                                                onChange={(e) =>
                                                                    setEditData((prev) => ({
                                                                        ...prev,
                                                                        [key]: e.target.value,
                                                                    }))
                                                                }
                                                                className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-2.5 text-sm font-normal text-slate-100 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                                                            />
                                                        )}
                                                    </label>
                                                );
                                            })
                                        }
                                    </div>

                                    {saveError && (
                                        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs font-medium text-rose-400">
                                            {saveError}
                                        </div>
                                    )}

                                    <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                                        <button
                                            type="button"
                                            onClick={closeDetails}
                                            disabled={isSaving}
                                            className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        {(action !== 'Add expense') && (<button
                                            type="submit"
                                            disabled={isSaving}
                                            className="rounded-xl bg-teal-400 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-teal-300 disabled:opacity-50 transition-colors shadow-md shadow-teal-500/10"
                                        >
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>)}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}