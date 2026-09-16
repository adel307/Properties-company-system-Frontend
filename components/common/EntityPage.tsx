'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function EntityPage({ title, eyebrow, description, rows = [], columns = [], action = 'Add record', actionHref = undefined }) {
  const [selectedRow, setSelectedRow] = useState(null);

  // دالة مساعدة لتنسيق الخلايا حسب نوع المفتاح
  const renderCellContent = (row, key) => {
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
          <button type="button" className="bg-[var(--teal)] px-4 py-3 font-sans text-sm text-white">
            + {action}
          </button>
        )}
      </div>

      <div className="mt-8 overflow-x-auto border-y border-[var(--line)]">
        <table className="w-full min-w-[640px] text-left font-sans text-sm">
          <thead className="border-b border-[var(--line)] text-[10px] uppercase tracking-wider text-[var(--muted)]">
            <tr>
              {columns.map(column => (
                <th key={column.key} className="py-3 px-2">{column.label}</th>
              ))}
              <th className="py-3 px-2 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {rows.map(row => (
              <tr 
                key={row.id} 
                className="hover:bg-white/50 cursor-pointer transition-colors"
                onClick={() => setSelectedRow(row)}
              >
                {columns.map(column => (
                  <td key={column.key} className="py-4 px-2">
                    {renderCellContent(row, column.key)}
                  </td>
                ))}
                <td className="py-4 px-2 text-right">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRow(row);
                    }}
                    className="text-xs text-[var(--teal)] underline font-semibold"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="py-10 text-center font-sans text-sm text-[var(--muted)]">No records found.</p>
      )}

      {/* Modal تفاصيل الموظف */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dir-rtl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-xl font-bold text-gray-800">{selectedRow.name}</h3>
              <button 
                onClick={() => setSelectedRow(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 font-sans text-sm text-gray-700">
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded">
                <p><strong>العمر:</strong> {selectedRow.age ? `${selectedRow.age} سنة` : '—'}</p>
                <p><strong>الهاتف:</strong> {selectedRow.phone || '—'}</p>
                <p><strong>الخبرة:</strong> {selectedRow.experienceYears ?? '—'} سنوات</p>
                <p><strong>الراتب:</strong> ${Number(selectedRow.salary ?? 0).toLocaleString()}</p>
              </div>

              <div className="mt-4">
                <h4 className="font-bold text-gray-900 border-b pb-1 mb-2">العقارات والمشاريع المسندة:</h4>
                {selectedRow.properties && selectedRow.properties.length > 0 ? (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {selectedRow.properties.map((item, idx) => (
                      <div key={idx} className="border rounded p-3 bg-white shadow-sm border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[var(--teal)]">{item.property?.name}</span>
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{item.role}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">العنوان: {item.property?.address}</p>
                        <p className="text-xs text-gray-500">الحالة: {item.property?.status}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">لا توجد عقارات مسندة حالياً.</p>
                )}
              </div>
            </div>

            <div className="mt-6 text-left">
              <button 
                onClick={() => setSelectedRow(null)}
                className="bg-gray-800 text-white px-4 py-2 rounded text-xs font-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}