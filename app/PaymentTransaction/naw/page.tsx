import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import RecordForm from '@/components/common/RecordForm';
import { leasePaymentsApi } from '@/lib/api/leasePayments';
import { paymentTransactionsApi } from '@/lib/api/paymentTransactions';
import { FormValues } from '@/types/RecordForm';

export const dynamic = 'force-dynamic';

const paymentMethods = [
  { label: 'Cash', value: 'CASH' },
  { label: 'Credit card', value: 'credit_card' },
  { label: 'Bank transfer', value: 'BANK_TRANSFER' },
  { label: 'Check', value: 'CHECK' },
  { label: 'Petty cash', value: 'PETTY_CASH' },
];

export default async function NewPaymentTransactionPage() {
  const response = await leasePaymentsApi.getAll();
  const leasePayments = response?.data || [];
  const leasePaymentOptions = leasePayments.map((payment) => ({
    label: `${payment.lease?.tenant?.name || 'Tenant'} - ${payment.lease?.apartment?.number || 'Apartment'} - due ${String(payment.dueDate).slice(0, 10)}`,
    value: payment.id,
  }));

  async function handleCreateTransaction(rawData: FormValues) {
    'use server';

    const rawAmountPaid = Number(rawData.amountPaid);
    if (!Number.isFinite(rawAmountPaid) || rawAmountPaid <= 0) {
      return { error: 'Amount paid must be greater than zero.' };
    }
    const amountPaidCents = Math.round(rawAmountPaid * 100);
    if (Math.abs(rawAmountPaid * 100 - amountPaidCents) > 0.000001) {
      return { error: 'Amount paid cannot have more than two decimal places.' };
    }
    const amountPaid = amountPaidCents / 100;

    const leasePaymentResponse = await leasePaymentsApi.getById(rawData.leasePaymentId);
    const leasePayment = leasePaymentResponse?.data;
    if (!leasePayment) {
      return { error: 'The selected lease installment could not be found.' };
    }

    const currentPaidAmount = Number(leasePayment.paidAmount);
    const currentRemainingAmount = Number(leasePayment.remainingAmount);
    if (!Number.isFinite(currentPaidAmount) || !Number.isFinite(currentRemainingAmount)) {
      return { error: 'The selected lease installment has an invalid balance.' };
    }
    const currentPaidCents = Math.round(currentPaidAmount * 100);
    const currentRemainingCents = Math.round(currentRemainingAmount * 100);
    if (
      Math.abs(currentPaidAmount * 100 - currentPaidCents) > 0.000001 ||
      Math.abs(currentRemainingAmount * 100 - currentRemainingCents) > 0.000001
    ) {
      return { error: 'The selected lease installment has an invalid balance.' };
    }
    if (amountPaidCents > currentRemainingCents) {
      return { error: 'Amount paid cannot exceed the installment remaining amount.' };
    }

    const paidAmount = (currentPaidCents + amountPaidCents) / 100;
    const remainingAmount = (currentRemainingCents - amountPaidCents) / 100;
    const payload: Record<string, unknown> = {
      leasePaymentId: rawData.leasePaymentId,
      amountPaid,
      paymentMethod: rawData.paymentMethod || 'CASH',
      receiptNumber: rawData.receiptNumber || null,
      receiptImageUrl: rawData.receiptImageUrl || null,
      receivedBy: rawData.receivedBy || null,
      notes: rawData.notes || null,
    };
    if (rawData.paymentDate) payload.paymentDate = rawData.paymentDate;

    try {
      const transactionResponse = await paymentTransactionsApi.create(payload);
      if (!transactionResponse?.data) {
        return { error: 'Failed to create payment transaction. Please try again.' };
      }

      const leasePaymentUpdate = await leasePaymentsApi.update(rawData.leasePaymentId, {
        leaseId: leasePayment.leaseId,
        dueDate: leasePayment.dueDate,
        paidAmount,
        remainingAmount,
        status: remainingAmount === 0 ? 'PAID' : 'PARTIAL',
        notes: leasePayment.notes || null,
      });
      if (!leasePaymentUpdate?.data) {
        revalidatePath('/LeasePayment');
        revalidatePath('/PaymentTransaction');
        return { error: 'The payment was recorded, but the installment balance could not be updated.' };
      }
    } catch (error) {
      console.error('Failed to create payment transaction:', error);
      return { error: 'Failed to create payment transaction. Please try again.' };
    }

    revalidatePath('/LeasePayment');
    revalidatePath('/PaymentTransaction');
    redirect('/PaymentTransaction');
  }

  return (
    <div className="max-w-2xl fade-up">
      <Link href="/PaymentTransaction" className="flex items-center gap-2 font-sans text-xs text-[var(--muted)]">
        <ArrowLeft size={14} /> Payment transactions
      </Link>

      <h1 className="display mt-8 text-5xl">New payment transaction</h1>
      <p className="mt-3 font-sans text-sm text-[var(--muted)]">
        Record a payment made toward a lease installment.
      </p>

      <div className="mt-8">
        <RecordForm
          fields={[
            { name: 'leasePaymentId', label: 'Lease installment', type: 'select', options: leasePaymentOptions, required: true },
            { name: 'amountPaid', label: 'Amount paid', type: 'number', required: true },
            { name: 'paymentDate', label: 'Payment date', type: 'date' },
            { name: 'paymentMethod', label: 'Payment method', type: 'select', options: paymentMethods, required: true },
            { name: 'receiptNumber', label: 'Receipt number', type: 'text' },
            { name: 'receiptImageUrl', label: 'Receipt image URL', type: 'text' },
            { name: 'receivedBy', label: 'Received by', type: 'text' },
            { name: 'notes', label: 'Notes', type: 'text' },
          ]}
          submitLabel="Create transaction"
          onSubmit={handleCreateTransaction}
        />
      </div>
    </div>
  );
}