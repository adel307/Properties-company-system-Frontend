'use client';

import { useState } from 'react';

interface Option {
  label: string;
  value: string;
}

interface Field {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: Option[];
}

interface RecordFormProps {
  fields?: Field[];
  submitLabel?: string;
  onSuccess?: (data: any) => void;
  // الدالة أصبحت Server Action تقبل البيانات وترجع Promise بالنتيجة
  onSubmit: (formData: Record<string, any>) => Promise<any>;
}

export default function RecordForm({ 
  fields = [],
  submitLabel = 'Save record',
  onSuccess,
  onSubmit
}: RecordFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formDataState, setFormDataState] = useState<Record<string, any>>({
    status: 'under_construction',
  });

  const handleChange = (name: string, value: any) => {
    setFormDataState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const rawValues = Object.fromEntries(formData.entries());

    try {
      // تنفيذ الـ Server Action الممررة من الصفحة
      const result = await onSubmit(rawValues);

      alert('تم الحفظ بنجاح!');
      if (onSuccess) onSuccess(result);

    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 border border-[var(--line)] bg-[var(--card)] p-6 sm:grid-cols-2"
    >
      {error && (
        <div className="p-3 bg-red-100 text-red-700 text-xs sm:col-span-2">
          {error}
        </div>
      )}

      {fields.map((field) => {
        if (field.name === 'ended_in' && formDataState['status'] === 'under_construction') {
          return null;
        }

        return (
          <label key={field.name} className="font-sans text-xs font-bold text-[var(--muted)]">
            {field.label}
            
            {field.type === 'select' ? (
              <select
                name={field.name}
                required={field.required}
                defaultValue={field.options?.[0]?.value}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="mt-2 w-full border-b border-[var(--line)] bg-transparent py-2 text-sm font-normal text-[var(--ink)] outline-none focus:border-[var(--teal)]"
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={field.name}
                type={field.type || 'text'}
                required={field.required}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="mt-2 w-full border-b border-[var(--line)] bg-transparent py-2 text-sm font-normal text-[var(--ink)] outline-none focus:border-[var(--teal)]"
              />
            )}
          </label>
        );
      })}

      <button 
        type="submit" 
        disabled={loading}
        className="w-fit bg-[var(--teal)] px-5 py-3 font-sans text-sm text-white disabled:opacity-50 sm:col-span-2"
      >
        {loading ? 'جاري الحفظ...' : submitLabel}
      </button>
    </form>
  );
}