import { materialsApi } from '@/lib/api/materials';
import EntityPage from '@/components/common/EntityPage';
import { Column } from '@/types/EntityPage';

export default async function MaterialsPage() {
    const response = await materialsApi.getAll();
    const rows = Array.isArray(response) ? response : response?.data || [];

    const EnteredRaws = rows.map((row) => ({
        id: row.id,
        name: row.name,
        totalPrice: row.totalPrice,
        paidPrice: row.paidPrice,
        status: row.status,
        quantity: row.quantity,
        arriveDate: row.arriveDate.split("T")[0],
        remainingAmount: row.remainingAmount,
        paymentDate: row.paymentDate.split("T")[0],
        supplierId: row.supplierId,
        propertyId: row.propertyId,
        updatedAt: row.updatedAt,
        supplier: row.supplier,
        property: row.property,
    }));

    const columns: Column[] = [
        { key: 'name', label: 'Name', type:"text" },
        { key: 'totalPrice', label: 'Total price', type:"number" },
        { key: 'paidPrice', label: 'Paid price', type:"number" },
        { key: 'quantity', label: 'Quantity', type:"number" },
        { key: 'arriveDate', label: 'Arrive date', type:"date" },
        { key: 'remainingAmount', label: 'Remaining amount', type:"number" },
        { key: 'paymentDate', label: 'Payment date', type:"date" },
        {
            key: 'status', label: 'Status', type:"select",
            options: [
                { label: 'as dept', value: 'as_dept' },
                { label: 'paid', value: 'paid' },
            ],
        },
    ]

    return (
        <EntityPage 
            title="Materials"
            eyebrow="Material ledger"
            description="Know what is on site, what has been paid, and what still needs attention."
            rows={EnteredRaws}
            action="Add material"
            actionHref="/materials/new"
            onDelete={async (id) => {
                'use server';
                await materialsApi.delete(id);
            }}
            onSave={async (id, updatedData) => {
                'use server';
                const payload = {
                    name:updatedData.name,
                    totalPrice:updatedData.totalPrice,
                    paidPrice:updatedData.paidPrice,
                    quantity:updatedData.quantity,
                    status:updatedData.status,
                    arriveDate:updatedData.arriveDate,
                    paymentDate:updatedData.paymentDate,
                    supplierId:updatedData.supplierId,
                    propertyId:updatedData.propertyId,

                }
                const result = await materialsApi.update(id, payload);
                return result;
            }}
            columns={columns}
        />
    )
}
