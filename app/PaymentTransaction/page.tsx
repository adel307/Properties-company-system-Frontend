import EntityPage from '@/components/common/EntityPage';
import { paymentTransactionsApi } from '@/lib/api/paymentTransactions';

export const dynamic = 'force-dynamic';

const paymentMethods = [
  { label: 'Cash', value: 'CASH' },
  { label: 'Credit card', value: 'credit_card' },
  { label: 'Bank transfer', value: 'BANK_TRANSFER' },
  { label: 'Check', value: 'CHECK' },
  { label: 'Petty cash', value: 'PETTY_CASH' },
];

export default async function PaymentTransactionsPage() {
  const response = await paymentTransactionsApi.getAll();
  const transactions = response?.data || [];

  const rows = transactions.map((transaction) => ({
    id: transaction.id,
    tenant: transaction.leasePayment?.lease?.tenant?.name || '',
    apartment: transaction.leasePayment?.lease?.apartment?.number || '',
    dueDate: String(transaction.leasePayment?.dueDate || '').slice(0, 10),
    amountPaid: Number(transaction.amountPaid),
    paymentDate: String(transaction.paymentDate).slice(0, 10),
    paymentMethod: transaction.paymentMethod,
    receiptNumber: transaction.receiptNumber || '',
    receiptImageUrl: transaction.receiptImageUrl || '',
    receivedBy: transaction.receivedBy || '',
    notes: transaction.notes || '',
  }));

  return (
    <EntityPage
      title="Payment Transactions"
      eyebrow="Finance"
      description="Review recorded payments against tenant lease installments."
      rows={rows}
      action="Add transaction"
      actionHref="/PaymentTransaction/naw"
      onDelete={async (raw) => {
        'use server';
        await paymentTransactionsApi.delete(raw.id);
      }}
      onSave={async (id, updatedData) => {
        'use server';
        return paymentTransactionsApi.update(id, {
          amountPaid: Number(updatedData.amountPaid),
          paymentDate: updatedData.paymentDate,
          paymentMethod: updatedData.paymentMethod,
          receiptNumber: updatedData.receiptNumber || null,
          receiptImageUrl: updatedData.receiptImageUrl || null,
          receivedBy: updatedData.receivedBy || null,
          notes: updatedData.notes || null,
        });
      }}
      columns={[
        { key: 'tenant', label: 'Tenant', type: 'readonly' },
        { key: 'apartment', label: 'Apartment', type: 'readonly' },
        { key: 'dueDate', label: 'Installment due', type: 'readonly' },
        { key: 'amountPaid', label: 'Amount paid', type: 'number' },
        { key: 'paymentDate', label: 'Payment date', type: 'date' },
        { key: 'paymentMethod', label: 'Payment method', type: 'select', options: paymentMethods },
        { key: 'receiptNumber', label: 'Receipt number', type: 'text' },
        { key: 'receiptImageUrl', label: 'Receipt image URL', type: 'text' },
        { key: 'receivedBy', label: 'Received by', type: 'text' },
        { key: 'notes', label: 'Notes', type: 'text' },
      ]}
    />
  );
}