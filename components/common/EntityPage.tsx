'use client';

import Link from 'next/link';
import { useState, useEffect, MouseEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { employeesApi } from '@/lib/api/employees';

export interface Column {
  key: string;
  label: string;
}

export interface EntityProperty {
  role: string;
  property?: {
    id: string;
    name: string;
    address?: string;
    status?: string;
  };
}

export interface EntityRow {
  id: string;
  name?: string;
  phone?: string;
  age?: number | string;
  experienceYears?: number | string;
  salary?: number | string;
  status?: string;
  remaining_amount?: number;
  total_debt?: number;
  properties?: EntityProperty[];
  [key: string]: any;
}

interface EntityPageProps {
  title: string;
  eyebrow: string;
  description: string;
  rows?: EntityRow[];
  columns?: Column[];
  action?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EntityPage({
  title,
  eyebrow,
  description,
  rows: initialRows = [],
  columns = [],
  action = 'Add record',
  actionHref,
  onAction,
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

  const openDetails = (row: EntityRow) => {
    setSelectedRow(row);
    setSaveError('');
    setEditData({
      name: row.name ?? '',
      phone: row.phone ?? '',
      age: row.age ?? '',
      experienceYears: row.experienceYears ?? '',
      salary: row.salary ?? '',
    });
  };

  const closeDetails = () => {
    if (isSaving) return;
    setSelectedRow(null);
    setEditData(null);
    setSaveError('');
  };

  const isEmployee = selectedRow && (selectedRow.experienceYears !== undefined || selectedRow.salary !== undefined);

  const handleDeleteEmployee = async (event: MouseEvent, row: EntityRow) => {
    event.stopPropagation();
    if (deletingId || !window.confirm(`Delete employee ${row.name}?`)) return;

    setDeletingId(row.id);
    setSaveError('');

    try {
      await employeesApi.delete(row.id);
      setTableRows((prevRows) => prevRows.filter((currentRow) => currentRow.id !== row.id));
      if (selectedRow?.id === row.id) closeDetails();
      router.refresh();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to delete employee.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveEmployee = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedRow || !editData) return;

    setIsSaving(true);
    setSaveError('');

    try {
      const updatedResponse = await employeesApi.update(selectedRow.id, {
        name: editData.name,
        phone: editData.phone || null,
        age: Number(editData.age),
        experienceYears: Number(editData.experienceYears),
        salary: Number(editData.salary),
      });

      const updatedEmployee = updatedResponse?.data ?? updatedResponse;
      if (!updatedEmployee) throw new Error('Unable to save employee changes.');

      const newRowData: EntityRow = {
        ...selectedRow,
        ...updatedEmployee,
        properties: selectedRow.properties,
      };

      setTableRows((prevRows) =>
        prevRows.map((row) => (row.id === selectedRow.id ? newRowData : row))
      );

      setSelectedRow(newRowData);
      setEditData({
        name: updatedEmployee.name ?? '',
        phone: updatedEmployee.phone ?? '',
        age: updatedEmployee.age ?? '',
        experienceYears: updatedEmployee.experienceYears ?? '',
        salary: updatedEmployee.salary ?? '',
      });

      router.refresh();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save employee changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderCellContent = (row: EntityRow, key: string) => {
    switch (key) {
      case 'salary':
        return `$${Number(row.salary ?? 0).toLocaleString()}`;
      case 'experienceYears':
        return `${row.experienceYears ?? 0} years`;
      case 'status':
        return row.status === 'as_dept' ? 'On debt' : row.status === 'paid' ? 'Paid' : row.status ?? '—';
      case 'remaining_amount':
      case 'total_debt':
        return `$${Number(row[key] ?? 0).toLocaleString()}`;
      case 'properties':
        if (!row.properties || row.properties.length === 0) return '—';
        return row.properties
          .map((p) => `${p.property?.name || 'Unassigned'} (${p.role})`)
          .join(', ');
      default:
        return row[key] ?? '—';
    }
  };

  return (
    <div className="fade-up">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[var(--line)] pb-8">
        <div>
          <p className="font-sans text-[10px] font-bold uppercase tracking-[.2em] text-[var(--teal)]">{eyebrow}</p>
          <h1 className="display mt-3 text-5xl">{title}</h1>
          <p className="mt-3 max-w-xl font-sans text-sm text-[var(--muted)]">{description}</p>
        </div>
        {actionHref ? (
          <Link href={actionHref} className="bg-[var(--teal)] px-4 py-3 font-sans text-sm text-white">
            + {action}
          </Link>
        ) : (
          <button type="button" onClick={onAction} className="bg-[var(--teal)] px-4 py-3 font-sans text-sm text-white">
            + {action}
          </button>
        )}
      </div>

      <div className="mt-8 overflow-x-auto border-y border-[var(--line)]">
        <table className="w-full min-w-[640px] text-left font-sans text-sm">
          <thead className="border-b border-[var(--line)] text-[10px] uppercase tracking-wider text-[var(--muted)]">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="py-3 px-2">{column.label}</th>
              ))}
              <th className="py-3 px-2 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {tableRows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-white/50 cursor-pointer transition-colors"
                onClick={() => openDetails(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="py-4 px-2">
                    {renderCellContent(row, column.key)}
                  </td>
                ))}
                <td className="py-4 px-2 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-xs text-[var(--teal)] underline font-semibold">
                      View
                    </span>
                    {row.experienceYears !== undefined && row.experienceYears !== null && (
                      <button
                        type="button"
                        onClick={(event) => handleDeleteEmployee(event, row)}
                        disabled={deletingId === row.id}
                        className="text-xs font-semibold text-[var(--coral)] underline disabled:opacity-50"
                      >
                        {deletingId === row.id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tableRows.length === 0 && (
        <p className="py-10 text-center font-sans text-sm text-[var(--muted)]">No records found.</p>
      )}

      {selectedRow && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={closeDetails}
        >
          <div 
            className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-xl font-bold text-gray-800">Employee details</h3>
              <button 
                onClick={closeDetails}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                disabled={isSaving}
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 font-sans text-sm text-gray-700">
              {isEmployee ? (
                <form onSubmit={handleSaveEmployee} className="grid gap-3 bg-gray-50 p-3 rounded">
                  {[
                    ['name', 'Name', 'text'],
                    ['phone', 'Phone', 'tel'],
                    ['age', 'Age', 'number'],
                    ['experienceYears', 'Experience (years)', 'number'],
                    ['salary', 'Monthly salary', 'number'],
                  ].map(([name, label, type]) => (
                    <label key={name} className="grid gap-1 text-xs font-semibold text-gray-700">
                      {label}
                      <input
                        name={name}
                        type={type}
                        value={editData?.[name as keyof EntityRow] ?? ''}
                        onChange={(e) => setEditData((prev) => ({ ...prev, [name]: e.target.value }))}
                        required={name !== 'phone'}
                        min={type === 'number' ? '0' : undefined}
                        className="rounded border border-gray-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-[var(--teal)]"
                      />
                    </label>
                  ))}
                  {saveError && <p className="text-xs font-normal text-red-600">{saveError}</p>}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="mt-1 bg-[var(--teal)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save changes'}
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded">
                  <p><strong>Age:</strong> {selectedRow.age ? `${selectedRow.age} years` : '—'}</p>
                  <p><strong>Phone:</strong> {selectedRow.phone || '—'}</p>
                  <p><strong>Experience:</strong> {selectedRow.experienceYears ?? '—'} years</p>
                  <p><strong>Salary:</strong> ${Number(selectedRow.salary ?? 0).toLocaleString()}</p>
                </div>
              )}

              <div className="mt-4">
                <h4 className="font-bold text-gray-900 border-b pb-1 mb-2">Assigned Properties & Projects:</h4>
                {selectedRow.properties && selectedRow.properties.length > 0 ? (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {selectedRow.properties.map((item, idx) => (
                      <div key={item.property?.id || idx} className="border rounded p-3 bg-white shadow-sm border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[var(--teal)]">{item.property?.name}</span>
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{item.role}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Address: {item.property?.address}</p>
                        <p className="text-xs text-gray-500">Status: {item.property?.status}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">No properties currently assigned.</p>
                )}
              </div>
            </div>

            <div className="mt-6 text-right">
              <button 
                onClick={closeDetails}
                disabled={isSaving}
                className="bg-gray-800 text-white px-4 py-2 rounded text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}