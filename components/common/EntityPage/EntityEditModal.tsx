'use client';

import { EntityEditModalProps } from '@/types/EntityPage';

const EXCLUDED_EDIT_KEYS = ['total_debt', 'updatedAt', 'id', 'createdAt', 'properties', 'materials'];

export function EntityEditModal({
    isOpen,
    columns,
    editData,
    isSaving,
    saveError,
    actionType,
    onClose,
    onSave,
    onChangeField,
}: EntityEditModalProps) {
    if (!isOpen) return null;

    const editableColumns = columns.filter(({ key }) => !EXCLUDED_EDIT_KEYS.includes(key));

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-150"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/60">
                    <h3 className="text-base font-bold text-white">Edit Details</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                        disabled={isSaving}
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 font-sans text-sm text-slate-300">
                    <form onSubmit={onSave} className="space-y-4">
                        <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-4">
                            {editableColumns.map(({ key, label, type, options }) => {
                                const rawVal = editData?.[key];
                                const selectVal = Array.isArray(rawVal)
                                    ? rawVal[0]?.propertyId || rawVal[0]?.id || ''
                                    : rawVal ?? '';

                                return (
                                    <label key={key} className="block space-y-1.5 text-xs font-semibold text-slate-300">
                                        <span>{label}</span>
                                        {type === 'select' ? (
                                            <select
                                                name={key}
                                                value={String(selectVal)}
                                                onChange={(e) => onChangeField(key, e.target.value)}
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
                                                value={String(editData?.[key] ?? '')}
                                                onChange={(e) => onChangeField(key, e.target.value)}
                                                className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-2.5 text-sm font-normal text-slate-100 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                                            />
                                        )}
                                    </label>
                                );
                            })}
                        </div>

                        {saveError && (
                            <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs font-medium text-rose-400">
                                {saveError}
                            </div>
                        )}

                        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSaving}
                                className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            {actionType !== 'Add expense' && (
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="rounded-xl bg-teal-400 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-teal-300 disabled:opacity-50 transition-colors shadow-md shadow-teal-500/10"
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}