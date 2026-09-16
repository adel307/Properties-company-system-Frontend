import { suppliersApi } from '@/lib/api/suppliers';
import EntityPage from '@/components/common/EntityPage';
import DebtSummaryCard from '@/components/suppliers/DebtSummaryCard';

export default async function SuppliersPage() {
  const response = await suppliersApi.getAll({ page: 1, limit: 20, has_debt: false });
  const rawRows = Array.isArray(response) ? response : response?.data || [];

  const debtResponse = await suppliersApi.getTotalDebt();
  const totalDebt = debtResponse?.data?.total_debt ?? debtResponse?.total_debt ?? 0;

  const rows = rawRows.map((supplier: any) => {
    const totalDebtAmount =
      supplier.materials?.reduce((sum: number, material: any) => {
        return sum + Number(material.remainingAmount || 0);
      }, 0) ?? 0;

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
          detailHref="/suppliers" // سينقل المستخدم إلى /suppliers/[id] للتحكم الكامل بالمورد
          columns={[
            { key: 'name', label: 'Supplier' },
            { key: 'total_debt', label: 'Outstanding debt' },
            { key: 'updatedAt', label: 'Updated' },
          ]}
        />
      </div>
    </div>
  );
}