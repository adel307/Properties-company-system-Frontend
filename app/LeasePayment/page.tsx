import EntityPage from '@/components/common/EntityPage';
import { leasePaymentsApi } from '@/lib/api/leasePayments';
import { leasesApi } from '@/lib/api/leases';

export const dynamic = 'force-dynamic';

const paymentStatuses = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Partial', value: 'PARTIAL' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Overdue', value: 'OVERDUE' },
];

export default async function LeasePaymentsPage() {
  const [paymentsResponse, leasesResponse] = await Promise.all([
    leasePaymentsApi.getAll(),
    leasesApi.getAll(),
  ]);
  const payments = paymentsResponse?.data || [];
  const leases = leasesResponse?.data || [];
  const leaseOptions = leases.map((lease) => ({
    label: `${lease.tenant?.name || 'Tenant'} - ${lease.apartment?.number || 'Apartment'}`,
    value: lease.id,
  }));

  const rows = payments.map((payment) => ({
    id: payment.id,
    leaseId: payment.leaseId,
    dueDate: String(payment.dueDate).slice(0, 10),
    totalAmount: Number(payment.totalAmount),
    paidAmount: Number(payment.paidAmount),
    remainingAmount: Number(payment.remainingAmount),
    status: payment.status,
    notes: payment.notes || '',
  }));

  return (
    <EntityPage
      title="Lease Payments"
      eyebrow="Finance"
      description="Track rent installments, payment status, and outstanding balances."
      rows={rows}
      action="Add lease payment"
      actionHref="/LeasePayment/new"
      onDelete={async (raw) => {
        'use server';
        await leasePaymentsApi.delete(raw.id);
      }}
      onSave={async (id, updatedData) => {
        'use server';
        return leasePaymentsApi.update(id, {
          leaseId: updatedData.leaseId,
          dueDate: updatedData.dueDate,
          paidAmount: Number(updatedData.paidAmount),
          remainingAmount: Number(updatedData.remainingAmount),
          status: updatedData.status,
          notes: updatedData.notes || null,
        });
      }}
      columns={[
        { key: 'leaseId', label: 'Lease', type: 'select', options: leaseOptions },
        { key: 'dueDate', label: 'Due date', type: 'date' },
        { key: 'totalAmount', label: 'Total amount', type: 'readonly' },
        { key: 'paidAmount', label: 'Paid amount', type: 'number' },
        { key: 'remainingAmount', label: 'Remaining', type: 'number' },
        { key: 'status', label: 'Status', type: 'select', options: paymentStatuses },
        { key: 'notes', label: 'Notes', type: 'text' },
      ]}
    />
  );
}