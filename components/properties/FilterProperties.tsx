'use client';

type FilterPropertiesProps = {
  currentFilters?: Record<string, string | string[] | undefined>;
};

export default function FilterProperties({ currentFilters = {} }: FilterPropertiesProps) {
  const status = typeof currentFilters.status === 'string' ? currentFilters.status : 'all';

  const handleStatusChange = (event) => {
    const value = event.target.value;
    window.location.href = value === 'all' ? '/' : `/?status=${value}`;
  };

  return (
    <div className="flex items-center gap-2 font-sans text-xs">
      <span className="text-[var(--muted)]">View</span>

      <select
        value={status}
        onChange={handleStatusChange}
        className="border-b border-[var(--line)] bg-transparent py-2 font-bold outline-none"
      >
        <option value="all">All properties</option>
        <option value="under_construction">Under construction</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
}