import { leasesApi } from '@/lib/api/leases';
import { leasePaymentsApi } from '@/lib/api/leasePayments';
import EntityPage from '@/components/common/EntityPage';
import { propertiesApi } from '@/lib/api/properties';
import { tenantsApi } from '@/lib/api/tenants';


export const dynamic = 'force-dynamic';

const outstandingStatuses = new Set(['PENDING', 'PARTIAL', 'OVERDUE']);
const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

async function getTotalOutstanding() {
    const firstPage = await leasePaymentsApi.getAll({ page: 1, limit: 100 });
    const pages = firstPage?.pagination?.pages || 1;
    const remainingPages = await Promise.all(
        Array.from({ length: Math.max(0, pages - 1) }, (_, index) =>
            leasePaymentsApi.getAll({ page: index + 2, limit: 100 })
        )
    );
    const payments = [
        ...(firstPage?.data || []),
        ...remainingPages.flatMap((page) => page?.data || []),
    ];

    return payments.reduce(
        (total, payment) => total + (
            outstandingStatuses.has(payment.status) ? Number(payment.remainingAmount) : 0
        ),
        0
    );
}

export default async function LeasesPage() {
    const [response, totalOutstanding] = await Promise.all([
        leasesApi.getAll(),
        getTotalOutstanding(),
    ]);
    const data = Array.isArray(response) ? response : response?.data || [];
    const rows = Array.isArray(data) ? data : [data];

    const apartments = await propertiesApi.apartments.getAll() || {data:[],pagination:[]}

    const apartmentsList = apartments.data || [];
    
    const tenants = await tenantsApi.getAll() || {data:[],pagination:[]}

    const tenantsList = tenants.data || [];
    
    const apartmentsOptions = apartmentsList.map((p) => {return {label:p.number,value:p.id}})

    const tenantsOptions = tenantsList.map((t) => {return {label:t.name,value:t.id}})


    const EnteredRaws = rows.map((row) => ({
        id: row.id as string,
        tenantId: row.tenantId as string,
        tenant: tenantsList.find((t) => t.id === row.tenantId)?.name || '',
        apartmentId: row.apartmentId as string,
        apartment: apartmentsList.find((a) => a.id === row.apartmentId)?.number || '',
        startDate: row.startDate as string,
        endDate: row.endDate as string | null,
        rentAmount: row.rentAmount as number,
        deposit: row.deposit as number | null,
        status:row.status as string,
    }));

    return (
        <>
        <section className="border-b border-slate-800 bg-slate-950 px-4 py-6 text-slate-100 sm:px-8 lg:px-10">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-teal-400">Receivables</p>
                    <h2 className="mt-1 text-lg font-semibold text-white">Total Outstanding Dues</h2>
                </div>
                <p className="text-2xl font-semibold text-white">{currencyFormatter.format(totalOutstanding)}</p>
            </div>
        </section>
        <EntityPage
            title="Leases"
            eyebrow="Contracts"
            description="Monitor occupancy, rent periods, and current lease status across units."
            rows={EnteredRaws}
            action="Add lease"
            actionHref="/leases/new"
            onDelete={async (raw) => {
                'use server';

                const { id } = raw;

                const apartmentID = raw.apartmentId as string;

                await leasesApi.delete(id);

                const apartment = await propertiesApi.apartments.getById(apartmentID);

                const ApartmentPayload = {
                    propertyId: apartment.data.propertyId,
                    number: apartment.data.number,
                    floor: Number(apartment.data.floor),
                    status: 'Available',
                };
                await propertiesApi.apartments.update(apartmentID, ApartmentPayload);
            }}
            onSave={async (id, updatedData) => {
                'use server';

                const currentLease = await leasesApi.getById(id);
                const currentApartmentId = currentLease?.data?.apartmentId as string;
                const currentApartment = await propertiesApi.apartments.getById(currentApartmentId);
                const selectedApartment = String(updatedData.apartment || '');
                const apartmentChanged =
                    selectedApartment !== '' &&
                    selectedApartment !== String(currentApartment?.data?.number) &&
                    selectedApartment !== currentApartmentId;
                const apartmentId = apartmentChanged ? selectedApartment : currentApartmentId;

                const payload = {
                    apartmentId,
                    tenantId: updatedData.tenantId,
                    startDate: updatedData.startDate,
                    endDate: updatedData.endDate,
                    rentAmount: Number(updatedData.rentAmount),
                    deposit: Number(updatedData.deposit) || null,
                    status: updatedData.status,
                };
                await leasesApi.update(id, payload);

                if (apartmentChanged) {
                    const newApartment = await propertiesApi.apartments.getById(apartmentId);
                    await Promise.all([
                        propertiesApi.apartments.update(currentApartmentId, {
                            propertyId: currentApartment.data.propertyId,
                            number: currentApartment.data.number,
                            floor: Number(currentApartment.data.floor),
                            status: 'Available',
                        }),
                        propertiesApi.apartments.update(apartmentId, {
                            propertyId: newApartment.data.propertyId,
                            number: newApartment.data.number,
                            floor: Number(newApartment.data.floor),
                            status: 'leased',
                        }),
                    ]);
                }
            }}
            columns={[
                { key: 'tenant', label: 'Tenant', type: 'select', options: tenantsOptions },
                { key: 'apartment', label: 'Apartment', type: 'select', options: apartmentsOptions },
                { key: 'startDate', label: 'Start date', type: 'date' },
                { key: 'endDate', label: 'End date', type: 'date' },
                { key: 'rentAmount', label: 'Rent amount', type: 'number' },
                { 
                    key: 'status',
                    label: 'Status',
                    type: 'select',
                    options: [
                        { label: 'Active', value: 'active' },
                        { label: 'EXPIRED', value: 'EXPIRED' },
                        { label: 'TERMINATED', value: 'TERMINATED' },
                        { label: 'PENDING', value: 'PENDING' },
                    ]
                },
            ]}
        />
                </>
  );
}
