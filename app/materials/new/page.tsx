import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import RecordForm from '@/components/common/RecordForm';
import { materialsApi } from '@/lib/api/materials';
import { suppliersApi } from '@/lib/api/suppliers';
import { propertiesApi } from '@/lib/api/properties';
import { SupplierRecord } from '@/types/suppliers';
import { PropertyOption } from '@/types/properties';
import { FormValues } from '@/types/RecordForm';

export default async function NewMaterialsPage() {
    const suppliersRes  = await suppliersApi.getAll()
    
    const propertiesRes = await propertiesApi.getAll()

    const suppliers  = suppliersRes.data || []
    
    const properties = propertiesRes.data || []

    const supplierOptions = suppliers.map((s: SupplierRecord) => ({
        label: s.name,
        value: s.id,
    }));
    
    const propertyOptions = properties.map((p: PropertyOption) => ({
        label: p.name,
        value: p.id,
    }));

    const statusOptions = [
        { label: 'Paid', value: 'paid' },
        { label: 'As Debt', value: 'as_dept' },
    ];

    async function handleCreateMaterial(rawData: FormValues) {
        'use server';

        try {
            const payload = {
                name: rawData.name,
                totalPrice: Number(rawData.totalPrice),
                paidPrice: Number(rawData.paidPrice) || 0,
                status: rawData.status || 'paid',
                quantity: Number(rawData.quantity) || 0,
                arriveDate: new Date(rawData.arriveDate).toISOString() || null,
                paymentDate: new Date(rawData.paymentDate).toISOString() || null,
                supplierId: rawData.supplierId,
                propertyId: rawData.propertyId,
            }
            await materialsApi.create(payload);
        } catch (error) {
            console.error('Failed to create material:', error);
            return { error: 'Failed to create material. Please try again.' };
        }

        revalidatePath('/materials');
        redirect('/materials');
    }

    return (
        <div className="max-w-2xl fade-up">
            <Link href="/materials" className="flex items-center gap-2 font-sans text-xs text-[var(--muted)]">
                <ArrowLeft size={14} /> Material
            </Link>

            <h1 className="display mt-8 text-5xl">New material</h1>
            <p className="mt-3 font-sans text-sm text-[var(--muted)]">
                Add a team member and keep their employment details available to the operation.
            </p>

            <div className="mt-8">
                <RecordForm
                fields={[
                { name: 'name', label: 'Material Name', type: 'text', required: true },
                { name: 'totalPrice', label: 'Total Price', type: 'number', required: true },
                { name: 'paidPrice', label: 'Paid Price', type: 'number', required: true },
                { name: 'quantity', label: 'Quantity', type: 'number', required: true },
                { 
                name: 'status', 
                label: 'Status', 
                type: 'select', 
                options: statusOptions, 
                required: true 
                },
                { name: 'arriveDate', label: 'Arrive Date', type: 'date', required: true },
                { name: 'paymentDate', label: 'Payment Date', type: 'date', required: true },
                { 
                    name: 'propertyId', 
                    label: 'Property', 
                    type: 'select', 
                    options: propertyOptions, 
                    required: true 
                },
                { 
                name: 'supplierId', 
                label: 'Supplier', 
                type: 'select', 
                options: supplierOptions, 
                required: true 
                },
            ]}
                submitLabel="Create material"
                onSubmit={handleCreateMaterial}
                />
            </div>
        </div>
    );
}