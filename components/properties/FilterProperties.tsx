'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState, useEffect } from 'react';

type FilterPropertiesProps = {
  currentFilters?: Record<string, string | string[] | undefined>;
};

export default function FilterProperties({ currentFilters = {} }: FilterPropertiesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // حالة محلية (Local State) لتخزين كافة القيم قبل الإرسال
  const [filters, setFilters] = useState({
    status: typeof currentFilters.status === 'string' ? currentFilters.status : 'all',
    min_area: typeof currentFilters.min_area === 'string' ? currentFilters.min_area : '',
    max_area: typeof currentFilters.max_area === 'string' ? currentFilters.max_area : '',
    started_after: typeof currentFilters.started_after === 'string' ? currentFilters.started_after : '',
    ended_before: typeof currentFilters.ended_before === 'string' ? currentFilters.ended_before : '',
    sort_by: typeof currentFilters.sort_by === 'string' ? currentFilters.sort_by : '',
    search: typeof currentFilters.search === 'string' ? currentFilters.search : '',
  });

  // مزامنة الـ State المحلية في حال تغير الـ URL من الخارج (مثل أزرار التصفح Next/Prev)
  useEffect(() => {
    setFilters({
      status: typeof currentFilters.status === 'string' ? currentFilters.status : 'all',
      min_area: typeof currentFilters.min_area === 'string' ? currentFilters.min_area : '',
      max_area: typeof currentFilters.max_area === 'string' ? currentFilters.max_area : '',
      started_after: typeof currentFilters.started_after === 'string' ? currentFilters.started_after : '',
      ended_before: typeof currentFilters.ended_before === 'string' ? currentFilters.ended_before : '',
      sort_by: typeof currentFilters.sort_by === 'string' ? currentFilters.sort_by : '',
      search: typeof currentFilters.search === 'string' ? currentFilters.search : '',
    });
  }, [currentFilters]);

  // تحديث الـ State المحلية فقط
  const handleChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // عند ضغط Submit يتم التوجيه إلى المسار الرئيسي (/) مع إعادة ضبط رقم الصفحة إلى 1
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    // العودة للصفحة الأولى عند تغيير الفلاتر
    params.set('page', '1');

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/?${params.toString()}`);
  };

  // تفريغ جميع الفلاتر
  const handleReset = () => {
    setFilters({
      status: 'all',
      min_area: '',
      max_area: '',
      started_after: '',
      ended_before: '',
      sort_by: '',
      search: '',
    });
    router.push('/');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4 font-sans text-xs">
      {/* البحث (Search) */}
      <div className="flex flex-col gap-1">
        <span className="text-[var(--muted)]">Search</span>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          placeholder="Property name..."
          className="border-b border-[var(--line)] bg-transparent py-2 font-bold outline-none placeholder:font-normal"
        />
      </div>

      {/* الحالة (Status) */}
      <div className="flex flex-col gap-1">
        <span className="text-[var(--muted)]">Status</span>
        <select
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="border-b border-[var(--line)] bg-transparent py-2 font-bold outline-none"
        >
          <option value="all">All properties</option>
          <option value="under_construction">Under construction</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* المساحة (Area Range) */}
      <div className="flex flex-col gap-1">
        <span className="text-[var(--muted)]">Area (sqm)</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            placeholder="Min"
            value={filters.min_area}
            onChange={(e) => handleChange('min_area', e.target.value)}
            className="w-16 border-b border-[var(--line)] bg-transparent py-2 font-bold outline-none placeholder:font-normal"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.max_area}
            onChange={(e) => handleChange('max_area', e.target.value)}
            className="w-16 border-b border-[var(--line)] bg-transparent py-2 font-bold outline-none placeholder:font-normal"
          />
        </div>
      </div>

      {/* تواريخ البداية والنهاية */}
      <div className="flex flex-col gap-1">
        <span className="text-[var(--muted)]">Started After</span>
        <input
          type="date"
          value={filters.started_after}
          onChange={(e) => handleChange('started_after', e.target.value)}
          className="border-b border-[var(--line)] bg-transparent py-2 font-bold outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[var(--muted)]">Ended Before</span>
        <input
          type="date"
          value={filters.ended_before}
          onChange={(e) => handleChange('ended_before', e.target.value)}
          className="border-b border-[var(--line)] bg-transparent py-2 font-bold outline-none"
        />
      </div>

      {/* الترتيب (Sort By) */}
      <div className="flex flex-col gap-1">
        <span className="text-[var(--muted)]">Sort By</span>
        <select
          value={filters.sort_by}
          onChange={(e) => handleChange('sort_by', e.target.value)}
          className="border-b border-[var(--line)] bg-transparent py-2 font-bold outline-none"
        >
          <option value="">Default</option>
          <option value="name">Name</option>
          <option value="created_at">Date Created</option>
          <option value="area">Area</option>
        </select>
      </div>

      {/* أزرار التحكم */}
      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          className="bg-[var(--teal)] px-4 py-2 font-bold text-white transition-opacity hover:opacity-90"
        >
          Apply Filters
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="border border-[var(--line)] px-3 py-2 text-[var(--muted)] hover:text-[var(--ink)]"
        >
          Reset
        </button>
      </div>
    </form>
  );
}