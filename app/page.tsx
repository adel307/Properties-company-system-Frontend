import Link from 'next/link';
import {
  ArrowUpRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  HardHat,
  Plus,
  Sparkles,
} from 'lucide-react';
import { propertiesApi } from '@/lib/api/properties';
import { employeesApi } from '@/lib/api/employees';
import { suppliersApi } from '@/lib/api/suppliers';

import ShowProperties from '@/components/properties/ShowProperties';
import FilterProperties from '@/components/Filters/FilterProperties';
import { PropertiesFilter } from '@/types/properties';
import type { LucideIcon } from 'lucide-react';

export default async function HomePage({ searchParams }) {
  const params = await searchParams;

  const filters: PropertiesFilter = {
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

  const employeesResponse = await employeesApi.getAll() || {data:[],pagination:[]}

  const employees = employeesResponse.data || []

  const employeesCount = employees.length || 0

  const getPageUrl = (pageNumber: number) => {
    const query = new URLSearchParams(params || {});
    query.set('page', pageNumber.toString());
    return `/?${query.toString()}`;
  };

  const TotalDebtRes = await suppliersApi.getTotalDebt() || {data:{total_debt:0}};

  const TotalDebt = TotalDebtRes.data.total_debt || 0;

  return (
    <div className="dark min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-8 font-sans selection:bg-teal-500 selection:text-black">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900/90 via-neutral-900/50 to-neutral-950 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-md">
          {/* Subtle Accent Glows */}
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -right-16 -bottom-20 hidden h-72 w-72 rounded-full border-[32px] border-amber-500/10 blur-2xl lg:block pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-teal-400 uppercase">
              <Sparkles size={12} />
              <span> الاثنين / 13 سبتمبر 2026 </span>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight">
              نظرة علي <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-200">أعمالك</span>
            </h1>

            <p className="mt-4 max-w-xl text-base text-neutral-400 sm:text-lg leading-relaxed">
              One grounded place for the properties, employees, materials, and decisions that move REC forward.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 text-sm font-medium">
              <Link
                href="/properties/new"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-neutral-950 font-semibold transition-all duration-200 hover:bg-teal-400 hover:shadow-lg hover:shadow-teal-500/20 active:scale-95"
              >
                Add property <Plus size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={Building2} label="Active properties" value={properties.length} />
          <Link href="/employees">
            <Stat icon={HardHat} label="Employee on site" value={employeesCount} />
          </Link>
          <Link href="/suppliers">
            <Stat icon={CircleDollarSign} label="Open supplier debt" value={TotalDebt} />
          </Link>
          <Stat icon={ArrowUpRight} label="This month" value={"+12.8%"} />
        </section>

        {/* Header & Filter Controls */}
        <div className="flex flex-col gap-6 pt-4">
          <div className="border-b border-neutral-800 pb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-400">Portfolio</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-white">Properties in motion</h2>
          </div>

          <FilterProperties currentFilters={params} />
        </div>

        {/* Properties List (Wider columns & Gradient/Fade rows) */}
        <div className="w-full overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/30">
          <ShowProperties properties={properties} />
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-800 pt-6 text-sm">
          <div className="text-neutral-400">
            Page <span className="font-semibold text-white">{currentPage}</span> of{' '}
            <span className="font-semibold text-white">{totalPages}</span>
          </div>

          <div className="flex items-center gap-3">
            {currentPage > 1 ? (
              <Link
                href={getPageUrl(currentPage - 1)}
                className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 font-medium text-neutral-200 transition-all hover:border-neutral-700 hover:bg-neutral-800 active:scale-95"
              >
                <ChevronLeft size={16} /> Previous
              </Link>
            ) : (
              <button
                disabled
                className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-neutral-900 bg-neutral-950 px-4 py-2 font-medium text-neutral-600"
              >
                <ChevronLeft size={16} /> Previous
              </button>
            )}

            {currentPage < totalPages ? (
              <Link
                href={getPageUrl(currentPage + 1)}
                className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 font-medium text-neutral-200 transition-all hover:border-neutral-700 hover:bg-neutral-800 active:scale-95"
              >
                Next <ChevronRight size={16} />
              </Link>
            ) : (
              <button
                disabled
                className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-neutral-900 bg-neutral-950 px-4 py-2 font-medium text-neutral-600"
              >
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for rendering statistics
function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number }) {
  return (
    <div className="group rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-900/80">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 transition-colors group-hover:bg-teal-500 group-hover:text-neutral-950">
        <Icon size={20} />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-white">{value}</p>
    </div>
  );
}