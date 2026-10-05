import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import RecordForm from '@/components/common/RecordForm';
import { leasePaymentsApi } from '@/lib/api/leasePayments';
import { leasesApi } from '@/lib/api/leases';
import { FormValues } from '@/types/RecordForm';

export const dynamic = 'force-dynamic';

export default async function NewLeasePaymentPage() {
  const leasesResponse = await leasesApi.getAll();
  const leases = leasesResponse?.data || [];
  const leaseOptions = leases.map((lease) => ({
    label: `${lease.tenant?.name || 'Tenant'} - ${lease.apartment?.number || 'Apartment'}`,
    value: lease.id,
  }));

  async function handleCreateLeasePayment(rawData: FormValues) {
    'use server';

    try {
      const leaseResponse = await leasesApi.getById(rawData.leaseId);
      const totalAmount = Number(leaseResponse?.data?.rentAmount);
      if (!Number.isFinite(totalAmount) || totalAmount < 0) {
        throw new Error('Unable to retrieve the selected lease rent amount.');
      }

      const paidAmountInput = rawData.paidAmount?.trim() || '';
      const paidAmount = paidAmountInput === '' ? 0 : Number(paidAmountInput);
      if (!Number.isFinite(paidAmount) || paidAmount < 0) {
        return { error: 'Paid amount must be a valid non-negative amount.' };
      }
      if (paidAmount > totalAmount) {
        return { error: 'Paid amount cannot exceed the lease rent amount.' };
      }

      const remainingAmount = totalAmount - paidAmount;
      if (remainingAmount < 0) {
        return { error: 'Remaining amount cannot be negative.' };
      }

      await leasePaymentsApi.create({
        leaseId: rawData.leaseId,
        dueDate: rawData.dueDate,
        totalAmount,
        paidAmount,
        remainingAmount,
        status: rawData.status || 'PENDING',
        notes: rawData.notes || null,
      });
    } catch (error) {
      console.error('Failed to create lease payment:', error);
      return { error: 'Failed to create lease payment. Please try again.' };
    }

    revalidatePath('/LeasePayment');
    redirect('/LeasePayment');
  }

  return (
    <div className="max-w-2xl fade-up">
      <Link href="/LeasePayment" className="flex items-center gap-2 font-sans text-xs text-[var(--muted)]">
        <ArrowLeft size={14} /> Lease payments
      </Link>

      <h1 className="display mt-8 text-5xl">New lease payment</h1>
      <p className="mt-3 font-sans text-sm text-[var(--muted)]">
        Record an installment and its current payment status.
      </p>

      <div className="mt-8">
        <RecordForm
          fields={[
            { name: 'leaseId', label: 'Lease', type: 'select', options: leaseOptions, required: true },
            { name: 'dueDate', label: 'Due date', type: 'date', required: true },
            { name: 'paidAmount', label: 'Paid amount', type: 'number' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { label: 'Pending', value: 'PENDING' },
                { label: 'Partial', value: 'PARTIAL' },
                { label: 'Paid', value: 'PAID' },
                { label: 'Overdue', value: 'OVERDUE' },
              ],
            },
            { name: 'notes', label: 'Notes', type: 'text' },
          ]}
          submitLabel="Create lease payment"
          onSubmit={handleCreateLeasePayment}
        />
      </div>
    </div>
  );
}