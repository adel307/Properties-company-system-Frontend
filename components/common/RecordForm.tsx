'use client';

import { FormValues, RecordFormProps } from '@/types/RecordForm';
import { useState, useTransition } from 'react';


export default function RecordForm({ 
  fields = [],
  submitLabel = 'Save record',
  onSuccess,
  onSubmit
}: RecordFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formDataState, setFormDataState] = useState<FormValues>(() => {
    const initial: FormValues = {};
    fields.forEach((field) => {
      if (field.type === 'select' && field.options?.length) {
        initial[field.name] = field.options[0].value;
      }
    });
    return initial;
  });

  const handleChange = (name: string, value: string) => {
    setFormDataState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const rawValues:any = Object.fromEntries(formData.entries());

    startTransition(async () => {
      try {
        if (!onSubmit) {
          throw new Error('This form is not configured for submission.');
        }

        const result = await onSubmit(rawValues);

        if (result?.error) {
          setError(result.error);
          return;
        }

        if (onSuccess) onSuccess(result);
      } catch (err: any) {
        if ( err?.message === 'NEXT_REDIRECT' || err?.digest?.startsWith('NEXT_REDIRECT')) {
          return;
        }
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    });
  };

  // Filter fields according to conditional visibility rules
  const visibleFields = fields.filter((field) => {
    if (field.name === 'ended_in' && formDataState['status'] === 'under_construction') {
      return false;
    }
    return true;
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2"
    >
      {/* Error Banner with Staggered Entrance */}
      {error && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-xs font-medium text-red-300 backdrop-blur-md sm:col-span-2">
          {error}
        </div>
      )}

      {/* Fields with Progressive Staggered Animation & Dark Gradient Shading */}
      {visibleFields.map((field, index) => {
        if (field.name === 'paidPrice' && formDataState['status'] === 'paid') {
          field.value = formDataState['totalPrice'];
        }

        // Calculate staggered entrance delay for each field row
        const delayClass =
          index === 0 ? 'delay-75' :
          index === 1 ? 'delay-100' :
          index === 2 ? 'delay-150' :
          index === 3 ? 'delay-200' :
          index === 4 ? 'delay-300' :
          index === 5 ? 'delay-500' : 'delay-700';

        // Progressive lighting effect: earlier fields start darker, later fields lighten down the form
        const progressiveBgClass = 
          index < 2
            ? 'bg-neutral-950/80 border-neutral-900 focus-within:bg-neutral-900/90'
            : index < 4
            ? 'bg-neutral-900/60 border-neutral-800/80 focus-within:bg-neutral-900/90'
            : 'bg-neutral-900/40 border-neutral-800 focus-within:bg-neutral-900/80';

        return (
          <div
            key={field.name}
            className={`animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-backwards ${delayClass} group relative flex flex-col justify-between rounded-xl border p-4 shadow-md transition-all duration-300 focus-within:border-teal-500/50 focus-within:ring-2 focus-within:ring-teal-500/20 ${progressiveBgClass}`}
          >
            <label 
              htmlFor={field.name} 
              className="text-xs font-semibold uppercase tracking-wider text-neutral-400 group-focus-within:text-teal-400 transition-colors"
            >
              {field.label}
              {field.required && <span className="ml-1 text-teal-400">*</span>}
            </label>

            {field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                required={field.required}
                value={formDataState[field.name] || field.options?.[0]?.value || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="mt-2 w-full min-w-[240px] border-b border-neutral-800 bg-transparent py-2 text-sm text-neutral-100 outline-none transition-colors focus:border-teal-400 dark:[color-scheme:dark]"
              >
                {field.options?.map((opt) => (
                  <option 
                    key={opt.value} 
                    value={opt.value} 
                    className="bg-neutral-900 text-neutral-100 py-1"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type || 'text'}
                required={field.required}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="mt-2 w-full min-w-[240px] border-b border-neutral-800 bg-transparent py-2 text-sm text-neutral-100 placeholder-neutral-600 outline-none transition-colors focus:border-teal-400 dark:[color-scheme:dark]"
              />
            )}
          </div>
        );
      })}

      {/* Submit Button Row with Final Staggered Entrance */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards delay-700 sm:col-span-2 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-teal-500 px-8 py-3.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-teal-500/10 transition-all hover:bg-teal-400 hover:shadow-teal-500/25 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin text-neutral-950" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving record...
            </span>
          ) : (
            <span>{submitLabel}</span>
          )}
        </button>
      </div>
    </form>
  );
}