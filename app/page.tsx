import Link from 'next/link';
import {
  ArrowUpRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  HardHat,
  Plus,
} from 'lucide-react';
import { propertiesApi } from '@/lib/api/properties';
import ShowProperties from '@/components/properties/ShowProperties';
import FilterProperties from '@/components/properties/FilterProperties';

export default async function HomePage({ searchParams }) {
  const params = await searchParams;

  const filters = {
    page: params?.page ? Number(params.page) : 1,
    limit: params?.limit ? Number(params.limit) : 10,
    ...(params?.status && params.status !== 'all' && { status: params.status }),
    ...(params?.min_area && { min_area: Number(params.min_area) }),
    ...(params?.max_area && { max_area: Number(params.max_area) }),
    ...(params?.started_after && { started_after: params.started_after }),
    ...(params?.ended_before && { ended_before: params.ended_before }),
    ...(params?.sort_by && { sort_by: params.sort_by }),
    ...(params?.search && { search: params.search }),
  };

  const propertiesResponse = await propertiesApi.getAll(filters);
  const properties = propertiesResponse?.data || [];
  const totalPages = propertiesResponse?.pagination?.pages || 1;
  const currentPage = filters.page;

  const getPageUrl = (pageNumber) => {
    const query = new URLSearchParams(params || {});
    query.set('page', pageNumber.toString());
    return `/?${query.toString()}`;
  };
return (
    <div className="fade-up">
      {/* Hero Section */}
      <section className="grid-paper relative overflow-hidden border border-[var(--line)] bg-[var(--card)] px-6 py-10 sm:px-10 lg:py-14">
        <div className="max-w-2xl">
          <p className="font-sans text-[10px] font-bold uppercase tracking-[.24em] text-[var(--teal)]">
            Monday / 13 September 2026
          </p>
          <h1 className="display mt-5 max-w-xl text-5xl leading-[.98] sm:text-7xl">
            A clearer view of the work.
          </h1>
          <p className="mt-6 max-w-lg font-sans text-sm leading-6 text-[var(--muted)]">
            One grounded place for the properties, people, materials, and
            decisions that move REC forward.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 font-sans text-sm">
            <Link
              href="/properties/new"
              className="flex items-center gap-2 bg-[var(--teal)] px-4 py-3 text-white"
            >
              Add property <Plus size={16} />
            </Link>
            <Link
              href="/audit-logs"
              className="flex items-center gap-2 border border-[var(--ink)] px-4 py-3"
            >
              View activity <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        <div className="absolute -right-16 -bottom-20 hidden h-64 w-64 rounded-full border-[32px] border-[var(--sun)] opacity-80 lg:block" />
      </section>

      {/* Stats Section */}
      <section className="mt-9 grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-4">
        <Stat
          icon={Building2}
          label="Active properties"
          value={properties.length}
        />
        <Stat icon={HardHat} label="People on site" value="48" />
        <Stat
          icon={CircleDollarSign}
          label="Open supplier debt"
          value="$184k"
        />
        <Stat icon={ArrowUpRight} label="This month" value="+12.8%" />
      </section>

      {/* Header & Filter Controls */}
      <div className="mt-12 flex flex-col gap-6">
        <div>
          <p className="font-sans text-[10px] font-bold uppercase tracking-[.2em] text-[var(--muted)]">
            Portfolio
          </p>
          <h2 className="display mt-2 text-3xl">Properties in motion</h2>
        </div>

        {/* تمرير كافة القيم الحالية لمكون الفلترة */}
        <FilterProperties currentFilters={params} />
      </div>

      {/* Properties List */}
      <div className="mt-6">
        <ShowProperties properties={properties} />
      </div>

      {/* Pagination Controls */}
      <div className="mt-10 flex items-center justify-between border-t border-[var(--line)] pt-6 font-sans text-sm">
        <div className="text-[var(--muted)]">
          Page <span className="font-bold text-[var(--ink)]">{currentPage}</span> of{' '}
          <span className="font-bold text-[var(--ink)]">{totalPages}</span>
        </div>

        <div className="flex items-center gap-2">
          {currentPage > 1 ? (
            <Link
              href={getPageUrl(currentPage - 1)}
              className="flex items-center gap-1 border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-sm hover:border-[var(--ink)]"
            >
              <ChevronLeft size={16} /> Previous
            </Link>
          ) : (
            <button
              disabled
              className="flex items-center gap-1 border border-[var(--line)] opacity-40 px-3 py-2 text-sm cursor-not-allowed"
            >
              <ChevronLeft size={16} /> Previous
            </button>
          )}

          {currentPage < totalPages ? (
            <Link
              href={getPageUrl(currentPage + 1)}
              className="flex items-center gap-1 border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-sm hover:border-[var(--ink)]"
            >
              Next <ChevronRight size={16} />
            </Link>
          ) : (
            <button
              disabled
              className="flex items-center gap-1 border border-[var(--line)] opacity-40 px-3 py-2 text-sm cursor-not-allowed"
            >
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component for rendering statistics
function Stat({ icon: Icon, label, value }) {
  return (
    <div className="bg-[var(--card)] p-4 sm:p-5">
      <Icon size={17} className="text-[var(--teal)]" />
      <p className="mt-5 font-sans text-[10px] uppercase tracking-wider text-[var(--muted)]">
        {label}
      </p>
      <p className="display mt-1 text-2xl">{value}</p>
    </div>
  );
}