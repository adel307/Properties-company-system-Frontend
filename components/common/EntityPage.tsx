'use client';

import Link from 'next/link';
import { useState, useEffect, MouseEvent, FormEvent, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { EntityPageProps, EntityRow } from '@/types/EntityPage';
import { EntityTableCell } from './EntityPage/EntityTableCell';
import { EntityTablePagination } from './EntityPage/EntityTablePagination';
import { EntityEditModal } from './EntityPage/EntityEditModal';
import { propertiesApi } from '@/lib/api/properties';
import JsonExporter from './EntityPage/ExportFileComponents/JsonExporter';

const PAGE_SIZE = 5;

// دالة فحص اتصال الـ Backend
const checkBackendStatus = async (): Promise<boolean> => {
  try {
    const response = await propertiesApi.getAll();

    if (!response.ok) {
      return true;
    }

    const data = await response.json();

    if (!data || (Array.isArray(data) && data.length === 0) || (typeof data === "object" && Object.keys(data).length === 0)) {
      return false;
    }

    return true;
  } catch (error) {
    console.log("API Fetch Error:", error);
    return false;
  }
};

export default function EntityPage({
    title,
    eyebrow,
    description,
    rows: initialRows = [],
    Suffixes = [],
    columns = [],
    action = 'Add record',
    actionHref,
    onAction,
    onSave,
    onDelete,
}: EntityPageProps) {
    const router = useRouter();

    const [tableRows, setTableRows] = useState<EntityRow[]>(initialRows);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selectedRow, setSelectedRow] = useState<EntityRow | null>(null);
    const [editData, setEditData] = useState<Partial<EntityRow> | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [saveError, setSaveError] = useState('');

    const [isBackendAvailable, setIsBackendAvailable] = useState<boolean | null>(null);

    const [exportFormat, setExportFormat] = useState<'pdf' | 'word' | 'excel' | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        let isMounted = true;
        
        checkBackendStatus().then((available) => {
            if (isMounted) {
                setIsBackendAvailable(available);
                if (available) {
                    console.log("Backend is available and returned data successfully.");
                } else {
                    console.warn("Backend is not available or returned empty data.");
                }
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        setTableRows(initialRows);
        setCurrentPage(1);
    }, [initialRows]);

    const totalPages = useMemo(() => Math.ceil(tableRows.length / PAGE_SIZE) || 1, [tableRows.length]);
    const startIndex = useMemo(() => (currentPage - 1) * PAGE_SIZE, [currentPage]);
    const currentRows = useMemo(() => tableRows.slice(startIndex, startIndex + PAGE_SIZE), [tableRows, startIndex]);

    const closeDetails = useCallback(() => {
        if (isSaving) return;
        setSelectedRow(null);
        setEditData(null);
        setSaveError('');
    }, [isSaving]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && selectedRow) closeDetails();
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

    const handleDelete = async (event: MouseEvent, row: EntityRow) => {
        event.stopPropagation();
        if (!onDelete || deletingId || !window.confirm(`Delete record: ${row.name || row.id}?`)) return;

        setDeletingId(row.id);
        setSaveError('');

        try {
            await onDelete(row);
            setTableRows((prev) => prev.filter((r) => r.id !== row.id));
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

            setTableRows((prev) => prev.map((r) => (r.id === selectedRow.id ? finalUpdatedRow : r)));
            setSelectedRow(finalUpdatedRow);
            closeDetails();
            router.refresh();
        } catch (error) {
            setSaveError(error instanceof Error ? error.message : 'Unable to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFieldChange = (key: string, value: unknown) => {
        setEditData((prev) => ({ ...prev, [key]: value }) as Partial<EntityRow>);
    };

    const formattedExportData = useMemo(() => {
        return tableRows.map((row) => {
            const reportItem: Record<string, any> = {};
            columns.forEach((col) => {
                reportItem[col.label || col.key] = row[col.key];
            });
            return reportItem;
        });
    }, [tableRows, columns]);

    const handleExportSelect = (format: 'pdf' | 'word' | 'excel') => {
        setExportFormat(format);
        setIsDropdownOpen(false);
    };

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
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
                    <div className="space-y-2">
                        {eyebrow && (
                            <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 px-3 py-1 rounded-md border border-teal-500/20">
                                {eyebrow}
                            </span>
                        )}
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{title}</h1>
                        {description && <p className="max-w-2xl text-sm text-slate-400 leading-relaxed">{description}</p>}
                    </div>

                    {isBackendAvailable && (
                        <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                            {exportFormat && (
                                <JsonExporter
                                    key={exportFormat}
                                    data={formattedExportData}
                                    format={exportFormat}
                                    savePath={`${title}_report`}
                                />
                            )}

                            <div
                                className="relative inline-block text-left"
                                onMouseEnter={() => setIsDropdownOpen(true)}
                                onMouseLeave={() => setIsDropdownOpen(false)}
                            >
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-200 border border-slate-700 shadow-md hover:bg-slate-700 hover:text-white transition-all"
                                >
                                    Export
                                    <svg className="ml-2 -mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 top-full w-40 rounded-xl bg-slate-900 border border-slate-800 shadow-xl z-50 overflow-hidden py-1">
                                        <button
                                            type="button"
                                            onClick={() => handleExportSelect('pdf')}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-teal-400 transition-colors"
                                        >
                                            PDF
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleExportSelect('word')}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-teal-400 transition-colors"
                                        >
                                            Word
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleExportSelect('excel')}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-teal-400 transition-colors"
                                        >
                                            Excel
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* عدم إظهار زر الإضافة إذا كانت قيمة action هي "don't add" */}
                            {action !== "don't add" && (
                                actionHref ? (
                                    <Link
                                        href={actionHref}
                                        className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-500/10 hover:bg-teal-300 transition-all"
                                    >
                                        <span className="text-lg leading-none">+</span>
                                        {action}
                                    </Link>
                                ) : onAction ? (
                                    <button
                                        onClick={onAction}
                                        className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-500/10 hover:bg-teal-300 transition-all"
                                    >
                                        <span className="text-lg leading-none">+</span>
                                        {action}
                                    </button>
                                ) : null
                            )}
                        </div>
                    )}
                </div>

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
                                    {action !== 'Add expense' && action !== 'Add AuditLog' && (
                                        <th className="py-4 px-6 min-w-[140px] max-w-[280px]">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {currentRows.map((row, index) => {
                                    // حساب الـ index الأصلي للصف بالاعتماد على الصفحة الحالية
                                    const globalIndex = startIndex + index;
                                    const currentSuffix = Suffixes[globalIndex];

                                    return (
                                        <tr
                                            key={row.id}
                                            style={getRowBackgroundStyle(index, currentRows.length)}
                                            className="group cursor-pointer transition-colors duration-150 hover:!bg-slate-800/60"
                                            onClick={() => openDetails(row)}
                                        >
                                            {columns.map((column) => (
                                                <td key={column.key} className="py-4 px-6 min-w-[140px] max-w-[280px] whitespace-normal break-words text-slate-300 group-hover:text-slate-100">
                                                    <EntityTableCell 
                                                        row={row} 
                                                        columnKey={column.key} 
                                                        Suffix={currentSuffix} 
                                                    />
                                                </td>
                                            ))}
                                            {action !== 'Add expense' && action !== 'Add AuditLog' && (
                                                <td className="py-4 px-6 text-right whitespace-nowrap w-[160px]">
                                                    <div className="flex items-center justify-end gap-4">
                                                        <button type="button" className="text-xs font-semibold text-teal-400 hover:text-teal-300">
                                                            Edit
                                                        </button>
                                                        {onDelete && action !== 'Add supplier' && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleDelete(e, row)}
                                                                disabled={deletingId === row.id}
                                                                className="text-xs font-semibold text-rose-400 hover:text-rose-300 disabled:opacity-50"
                                                            >
                                                                {deletingId === row.id ? 'Deleting...' : 'Delete'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <EntityTablePagination
                        startIndex={startIndex}
                        pageSize={PAGE_SIZE}
                        totalRows={tableRows.length}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPrevPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        onNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    />

                    {tableRows.length === 0 && (
                        <div className="py-16 text-center text-sm text-slate-500">
                            No records found.
                        </div>
                    )}
                </div>

                <EntityEditModal
                    isOpen={!!selectedRow}
                    columns={columns}
                    editData={editData}
                    isSaving={isSaving}
                    saveError={saveError}
                    actionType={action}
                    onClose={closeDetails}
                    onSave={handleSave}
                    onChangeField={handleFieldChange}
                />
            </div>
        </div>
    );
}