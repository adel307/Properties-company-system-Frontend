import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import RecordForm from '@/components/common/RecordForm';
import { leasesApi } from '@/lib/api/leases';
import { tenantsApi } from '@/lib/api/tenants';
import { propertiesApi } from '@/lib/api/properties';
import { PropertyOption } from '@/types/properties';
import { Options } from '@/types/common';
import { tenants } from '@/types/tenants';


export default async function NewLeasePage() {
    let tenants = [];
    let apartments: PropertyOption[] = [];

    try {
        const [tenantsRes, apartmentsRes] = await Promise.all([
            tenantsApi.getAll().catch(() => null),
            propertiesApi.apartments.getAll().catch(() => null),
        ]);

        tenants = tenantsRes?.data || [];
        apartments = apartmentsRes?.data || [];
    } catch (error) {
        console.error('Failed to load form initial data:', error);
    }

    const tenantsOptions:Options = tenants.map((t: tenants) => ({
            label: t.name as string,
            value: t.id as string,
        }));
        
    const apartmentsOptions = apartments.map((a: PropertyOption) => ({
        label: a.number as string,
        value: a.id as string,
    }));

    async function handleCreateLease(rawData: Record<string, FormDataEntryValue>) {
        'use server';

        const apartment = await propertiesApi.apartments.getById(String(rawData.apartmentId));

        try {
        const payload = {
            apartmentId: String(rawData.apartmentId),
            tenantId: String(rawData.tenantId),
            startDate: String(rawData.startDate),
            endDate: rawData.endDate ? String(rawData.endDate) : null,
            rentAmount: Number(rawData.rentAmount),
            deposit: rawData.deposit ? Number(rawData.deposit) : null,
            status: rawData.status ? String(rawData.status) : 'ACTIVE',
        };
        
        // console.log('apartment:', apartment);
        
        await leasesApi.create(payload);


        const ApartmentPayload = {
            propertyId: apartment.data.propertyId,
            number: apartment.data.number,
            floor: Number(apartment.data.floor),
            status: 'leased',
        };
        await propertiesApi.apartments.update(rawData.apartmentId, ApartmentPayload);

        } catch (error) {
        console.error('Failed to create lease:', error);
        return { error: 'Failed to create lease. Please try again.' };
        }

        revalidatePath('/leases');
        redirect('/leases');
    }

    return (
        <div className="max-w-2xl fade-up">

            <Link href="/leases" className="flex items-center gap-2 font-sans text-xs text-[var(--muted)]">
                <ArrowLeft size={14} /> Leases
            </Link>

            <h1 className="display mt-8 text-5xl">New lease</h1>
            <p className="mt-3 font-sans text-sm text-[var(--muted)]">
                Create a contract and track the rent period for a tenant and apartment.
            </p>

            <div className="mt-8">
                <RecordForm
                fields={[
                    { name: 'startDate', label: 'Start date', type: 'date', required: true },
                    { name: 'endDate', label: 'End date', type: 'date' },
                    { name: 'rentAmount', label: 'Rent amount', type: 'number', required: true },
                    { name: 'deposit', label: 'Deposit', type: 'number' },
                    {
                        name: 'tenantId',
                        label: 'Tenant',
                        type: 'select', 
                        options: tenantsOptions,
                        required: true 
                    },
                    { 
                        name: 'apartmentId',
                        label: 'Apartment',
                        type: 'select',
                        options: apartmentsOptions,
                        required: true 
                    },
                    {
                    name: 'status',
                    label: 'Status',
                    type: 'select',
                    required: true,
                    options: [
                        { label: 'ACTIVE', value: 'ACTIVE' },
                        { label: 'PENDING', value: 'PENDING' },
                        { label: 'EXPIRED', value: 'EXPIRED' },
                        { label: 'TERMINATED', value: 'TERMINATED' },
                    ],
                    },
                ]}
                submitLabel="Create lease"
                onSubmit={handleCreateLease}
                />
            </div>
        </div>
    );
}
