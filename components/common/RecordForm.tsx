'use client';

import { useState, useTransition } from 'react';

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
  onSubmit?: (formData: Record<string, any>) => Promise<any>;
}

export default function RecordForm({ 
  fields = [],
  submitLabel = 'Save record',
  onSuccess,
  onSubmit
}: RecordFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // إعداد الحالة المبدئية للنموذج من الخيارات المتاحة
  const [formDataState, setFormDataState] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach((field) => {
      if (field.type === 'select' && field.options?.length) {
        initial[field.name] = field.options[0].value;
      }
    });
    return initial;
  });

  const handleChange = (name: string, value: any) => {
    setFormDataState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const rawValues = Object.fromEntries(formData.entries());

    startTransition(async () => {
      try {
        if (!onSubmit) {
          throw new Error('This form is not configured for submission.');
        }

        const result = await onSubmit(rawValues);

        // إذا عادت الدالة ببيانات خطأ صريحة من Server Action
        if (result?.error) {
          setError(result.error);
          return;
        }

        if (onSuccess) onSuccess(result);
      } catch (err: any) {
        // تجاهل أخطاء إعادة التوجيه الخاصة بـ Next.js (redirect)
        if (err?.message === 'NEXT_REDIRECT' || err?.digest?.startsWith('NEXT_REDIRECT')) {
          return;
        }
        setError(err.message || 'An unexpected error occurred');
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 border border-[var(--line)] bg-[var(--card)] p-6 sm:grid-cols-2"
    >
      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700 sm:col-span-2 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {fields.map((field) => {
        // شرط إخفاء حقل تاريخ الانتهاء إذا كانت الحالة قيد الإنشاء
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
                value={formDataState[field.name] || field.options?.[0]?.value || ''}
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
        disabled={isPending}
        className="w-fit bg-[var(--teal)] px-5 py-3 font-sans text-sm text-white transition-opacity disabled:opacity-50 sm:col-span-2"
      >
        {isPending ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}