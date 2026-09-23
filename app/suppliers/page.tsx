import { suppliersApi } from '@/lib/api/suppliers';
import EntityPage from '@/components/common/EntityPage';
import DebtSummaryCard from '@/components/suppliers/DebtSummaryCard';
import { SupplierRecord, SuppliersFilter } from '@/types/suppliers';

export default async function SuppliersPage({ searchParams }) {
    const params = await searchParams;
    const filters :SuppliersFilter = {
        page: params?.page ? Number(params.page) : 1,
        limit: params?.limit ? Number(params.limit) : 10,
        has_debt: "all",
        ...(params?.has_debt && params.has_debt !== false && { has_debt: params.has_debt || "all" }),
        ...(params?.sort_by && { sort_by: params.sort_by }),
        ...(params?.search && { search: params.search }),
    }

    const response = await suppliersApi.getAll(filters);
    const rawRows = Array.isArray(response) ? response : response?.data || [];

    const debtResponse = await suppliersApi.getTotalDebt();
    const totalDebt = debtResponse?.data?.total_debt ?? debtResponse?.total_debt ?? 0;
    
    const rows = rawRows.map((supplier: SupplierRecord) => {

        const suppliersMaterials = supplier.materials.map((material)=>{
            return {
                totalPrice:material.totalPrice,
                paidPrice:material.paidPrice,
                paymentDate:material.paymentDate,

            };
        })

        let totalDebtAmount = 0
        suppliersMaterials.map(({totalPrice,paidPrice}) => {
            const Amount = totalPrice - paidPrice
            totalDebtAmount += Amount
        })
        return {
        ...supplier,
        total_debt: totalDebtAmount,
        updatedAt: supplier.updatedAt
            ? new Date(supplier.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
            : '—',
        };
    });

    return (
        <div>
            <DebtSummaryCard amount={totalDebt} />
            <div className="mt-10">
                <EntityPage
                title="Suppliers"
                eyebrow="Supply chain"
                description="Track who is owed, what arrived, and where every material is being used."
                rows={rows}
                action="Add supplier"
                actionHref="/suppliers/new"
                onDelete={async (id) => {
                    'use server';
                    await suppliersApi.delete(id);
                }}
                onSave={async (id, updatedData) => {
                    'use server';
                    const result = await suppliersApi.update(id, { name: `${updatedData.name}` });
                    return result;
                }}
                columns={[
                    { key: 'name', label: 'Supplier' , type:"text"},
                    { key: 'total_debt', label: 'Outstanding debt' , type:"number"},
                    { key: 'updatedAt', label: 'Updated' , type:"date"},
                    { key: 'materials', label: 'materials' , type:"text"},
                ]}
                />
            </div>
        </div>
    );
}