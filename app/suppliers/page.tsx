import { suppliersApi } from '@/lib/api';
import EntityPage from '@/components/common/EntityPage';
import DebtSummaryCard from '@/components/suppliers/DebtSummaryCard';

export default async function SuppliersPage()
{
    const response = await suppliersApi.getAll({ page: 1, limit: 20, has_debt: true });
    const rows = Array.isArray(response) ? response : response?.data || [];
    const debtResponse = await suppliersApi.getTotalDebt();
    const totalDebt = debtResponse?.data?.total_debt ?? debtResponse?.total_debt ?? 0;

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
                    columns={[
                        { key: 'name', label: 'Supplier' },
                        { key: 'total_debt', label: 'Outstanding debt' },
                        { key: 'updated_at', label: 'Updated' }
                    ]}
                />
            </div>
        </div>
    )
}
