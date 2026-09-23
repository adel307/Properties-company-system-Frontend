import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Maximize2,
  Calendar,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { propertiesApi } from '@/lib/api/properties';
import ApartmentsList from '@/components/properties/ApartmentsList';
import PropertyActions from '@/components/properties/PropertyActions';
import AddApartmentForm from '@/components/properties/AddApartmentForm';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ propertyID: string }>;
}) {
  const { propertyID } = await params;

  if (!UUID_REGEX.test(propertyID)) {
    notFound();
  }

  let property = null;
  try {
    const propertyResponse = await propertiesApi.getById(propertyID);
    property = propertyResponse?.data || propertyResponse || null;
  } catch {
    notFound();
  }

  if (!property) {
    notFound();
  }

  const apartments = Array.isArray(property?.apartments)
    ? property.apartments
    : [];
  const employees = Array.isArray(property?.employees)
    ? property.employees
    : [];

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="fade-up space-y-8">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-sans text-xs font-semibold text-neutral-400 transition-colors hover:text-teal-400"
      >
        <ArrowLeft size={14} /> Back to all properties
      </Link>

      {/* Header & Overview Card */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 sm:p-8 backdrop-blur-md">
        {/* Subtle Ambient Background Accent */}
        <div className="absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-teal-400">
            <Sparkles size={12} />
            {property?.status
              ? property.status.replace('_', ' ')
              : 'Property unavailable'}
          </span>

          {property && <PropertyActions propertyID={propertyID} />}
        </div>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          {property?.name || 'Property unavailable'}
        </h1>

        <p className="mt-3 flex items-center gap-2 font-sans text-sm text-neutral-400">
          <MapPin size={16} className="text-teal-400 shrink-0" />
          {property?.address || 'No address available'}
        </p>

        {property && (
          <div className="mt-8 grid grid-cols-2 gap-4 rounded-xl border border-neutral-800 bg-neutral-950/60 p-5 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-teal-400 border border-neutral-800">
                <Building2 size={18} />
              </div>
              <div>
                <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  عدد الأدوار
                </p>
                <p className="font-sans text-base font-bold text-white mt-0.5">
                  {property.floorsNumber ?? '-'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-teal-400 border border-neutral-800">
                <Maximize2 size={18} />
              </div>
              <div>
                <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  المساحة
                </p>
                <p className="font-sans text-base font-bold text-white mt-0.5">
                  {property.area ? `${property.area} م²` : '-'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-teal-400 border border-neutral-800">
                <Calendar size={18} />
              </div>
              <div>
                <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  تاريخ البداية
                </p>
                <p className="font-sans text-base font-bold text-white mt-0.5">
                  {formatDate(property.startedIn)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-teal-400 border border-neutral-800">
                <Calendar size={18} />
              </div>
              <div>
                <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  تاريخ الانتهاء
                </p>
                <p className="font-sans text-base font-bold text-white mt-0.5">
                  {property.endedIn ? formatDate(property.endedIn) : 'قيد العمل'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content & Sidebar Layout */}
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Left: Apartments List & Action Form */}
        <div className="space-y-8 min-w-0">
          <AddApartmentForm propertyID={propertyID} />
          <ApartmentsList apartments={apartments} />
        </div>

        {/* Right: Assigned Team */}
        <aside className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 h-fit">
          <div className="border-b border-neutral-800 pb-3">
            <p className="font-sans text-xs font-bold uppercase tracking-widest text-teal-400">
              Assigned team
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {employees.map((e, index) => {
              // Dynamic lightening background for team members list
              const itemStyle = {
                backgroundColor: `rgba(255, 255, 255, ${0.02 + index * 0.02})`,
                animationDelay: `${index * 80}ms`,
                animationFillMode: 'forwards' as const,
              };

              return (
                <div
                  key={e.employeeId || e.employee?.id}
                  style={itemStyle}
                  className="rounded-xl border border-neutral-800/80 p-3.5 transition-colors hover:border-neutral-700 animate-fade-in-up"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-sans text-sm font-semibold text-neutral-200 truncate">
                      {e.employee?.name}
                    </p>
                    {e.role && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 font-sans text-[10px] font-medium text-teal-300 shrink-0">
                        <UserCheck size={10} /> {e.role}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-sans text-xs text-neutral-400">
                    {e.employee?.phone || 'No phone provided'}
                  </p>
                </div>
              );
            })}

            {!employees.length && (
              <p className="font-sans text-sm text-neutral-400 py-2">
                No team assigned yet.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}