import { tenantsApi } from '@/lib/api/tenants';
import { leasesApi } from '@/lib/api/leases';
import { leasePaymentsApi } from '@/lib/api/leasePayments';
import EntityPage from '@/components/common/EntityPage';

export const dynamic = 'force-dynamic';

type PageResponse<T> = {
  data?: T[];
  pagination?: { pages?: number };
} | null;

type TenantRecord = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  nationalId?: string | null;
};

type LeaseRecord = {
  id: string;
  tenantId: string;
  status: string;
  apartment?: { number?: string };
};

type LeasePaymentRecord = {
  leaseId: string;
  status: string;
  totalAmount: number | string;
  paidAmount: number | string;
  remainingAmount: number | string;
};

const outstandingStatuses = new Set(['PENDING', 'PARTIAL', 'OVERDUE']);
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

async function fetchAllPages<T>(
  fetchPage: (params: Record<string, string | number | boolean>) => Promise<PageResponse<T>>
) {
  const firstPage = await fetchPage({ page: 1, limit: 100 });
  const pages = firstPage?.pagination?.pages || 1;
  if (pages <= 1) return firstPage?.data || [];

  const remainingPages = await Promise.all(
    Array.from({ length: pages - 1 }, (_, index) => fetchPage({ page: index + 2, limit: 100 }))
  );
  return [
    ...(firstPage?.data || []),
    ...remainingPages.flatMap((page) => page?.data || []),
  ];
}

export default async function TenantsPage() {
  const [tenants, leases, leasePayments] = await Promise.all([
    fetchAllPages<TenantRecord>(tenantsApi.getAll),
    fetchAllPages<LeaseRecord>(leasesApi.getAll),
    fetchAllPages<LeasePaymentRecord>(leasePaymentsApi.getAll),
  ]);

  const activeLeasesByTenant = new Map<string, LeaseRecord[]>();
  const activeLeaseIdsByTenant = new Map<string, Set<string>>();
  for (const lease of leases) {
    if (lease.status !== 'ACTIVE') continue;
    const tenantLeases = activeLeasesByTenant.get(lease.tenantId) || [];
    tenantLeases.push(lease);
    activeLeasesByTenant.set(lease.tenantId, tenantLeases);

    const leaseIds = activeLeaseIdsByTenant.get(lease.tenantId) || new Set<string>();
    leaseIds.add(lease.id);
    activeLeaseIdsByTenant.set(lease.tenantId, leaseIds);
  }

  const totalExpectedRent = leasePayments.reduce(
    (total, payment) => total + Number(payment.totalAmount),
    0
  );
  const totalCollected = leasePayments.reduce(
    (total, payment) => total + Number(payment.paidAmount),
    0
  );
  const totalRemaining = leasePayments.reduce(
    (total, payment) => total + (
      outstandingStatuses.has(payment.status) ? Number(payment.remainingAmount) : 0
    ),
    0
  );

  const rows = tenants.map((tenant) => {
    const activeLeases = activeLeasesByTenant.get(tenant.id) || [];
    const activeLeaseIds = activeLeaseIdsByTenant.get(tenant.id) || new Set<string>();
    const tenantPayments = leasePayments.filter((payment) => activeLeaseIds.has(payment.leaseId));
    const outstandingPayments = tenantPayments.filter((payment) => outstandingStatuses.has(payment.status));
    const remainingAmount = outstandingPayments.reduce(
      (total, payment) => total + Number(payment.remainingAmount),
      0
    );
    const status = activeLeases.length === 0
      ? 'NO ACTIVE LEASE'
      : tenantPayments.length === 0
        ? 'PENDING'
        : remainingAmount <= 0
          ? 'PAID'
          : outstandingPayments.some((payment) => payment.status === 'OVERDUE')
            ? 'OVERDUE'
            : outstandingPayments.some((payment) => payment.status === 'PARTIAL' || Number(payment.paidAmount) > 0)
              ? 'PARTIAL'
              : 'PENDING';

    return {
      ...tenant,
      activeApartment: activeLeases.map((lease) => lease.apartment?.number).filter(Boolean).join(', '),
      totalDue: currencyFormatter.format(remainingAmount),
      status,
    };
  });

  return (
    <>
      <section className="border-b border-slate-800 bg-slate-950 px-4 pb-8 pt-8 text-slate-100 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-400">Rent Overview</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Receivables</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryMetric label="Total Expected Rent" value={totalExpectedRent} />
            <SummaryMetric label="Total Collected" value={totalCollected} />
            <SummaryMetric label="Total Remaining Outstanding" value={totalRemaining} />
          </div>
        </div>
      </section>
      <EntityPage
        title="Tenants"
        eyebrow="Residents"
        description="Track active apartments and outstanding rent by tenant."
        rows={rows}
        action="Add tenant"
        actionHref="/tenants/new"
        onDelete={async (raw) => {
          'use server';
          const { id } = raw;

          const tenant = await tenantsApi.getById(id);
          const tenantLeases = tenant?.data?.leases || [];
          await Promise.all(tenantLeases.map((lease: { id: string }) => leasesApi.delete(lease.id)));
          await tenantsApi.delete(id);
        }}
        onSave={async (id, updatedData) => {
          'use server';
          const payload = {
            name: updatedData.name,
            nationalId: updatedData.nationalId || null,
            phone: updatedData.phone,
            email: updatedData.email || null,
          };
          return tenantsApi.update(id, payload);
        }}
        columns={[
          { key: 'name', label: 'Tenant Name', type: 'text' },
          { key: 'phone', label: 'Phone', type: 'text' },
          { key: 'activeApartment', label: 'Active Apartment', type: 'readonly' },
          { key: 'totalDue', label: 'Total Due Amount', type: 'readonly' },
          { key: 'status', label: 'Payment Status', type: 'readonly' },
        ]}
      />
    </>
  );
}

function SummaryMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-slate-800 bg-slate-900/70 px-5 py-4">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{currencyFormatter.format(value)}</p>
    </div>
  );
}
