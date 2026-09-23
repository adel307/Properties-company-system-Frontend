import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import RecordForm from '@/components/common/RecordForm';
import { expensesApi } from '@/lib/api/expenses';
import { ExpenseCategory } from '@/types/expenses';
import { FormValues } from '@/types/RecordForm';

export default async function NewExpensesPage() {

    const categoriesRes = await expensesApi.categories.getAll() || {data:[],pagination:[]}

    const categories = categoriesRes.data || []

    const categoryOptions = categories.map((cat: ExpenseCategory) => ({
        label: cat.name,
        value: cat.id,
    }));

    const paymentMethodOptions = [
        { label: 'Cash', value: 'CASH' },
        { label: 'Credit Card', value: 'credit_card' },
        { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
        { label: 'Cheque', value: 'CHECK' },
        { label: 'PETTY CASH', value: 'PETTY_CASH' },
    ];

    async function handleCreateExpense(rawData: FormValues) {
        'use server';

        try {
            const payload = {
            sender: rawData.sender,
            amount: Number(rawData.amount),
            expenseCategoryId: rawData.expenseCategoryId,
            expenseDate: rawData.expenseDate ? new Date(rawData.expenseDate).toISOString() : new Date().toISOString(),
            paidTo: rawData.paidTo,
            paymentMethod: rawData.paymentMethod || 'CASH',
            receiptNumber: rawData.receiptNumber || null,
            receiptImageUrl: rawData.receiptImageUrl || null,
            approvedBy: rawData.approvedBy || null,
            notes: rawData.notes || null,
        };
            await expensesApi.create(payload);
        } catch (error) {
            console.error('Failed to create material:', error);
            return { error: 'Failed to create material. Please try again.' };
        }

        revalidatePath('/expenses');
        redirect('/expenses');
    }

    return (
        <div className="max-w-2xl fade-up">
            <Link href="/expenses" className="flex items-center gap-2 font-sans text-xs text-[var(--muted)]">
                <ArrowLeft size={14} /> Expenses
            </Link>

            <h1 className="display mt-8 text-5xl">New expense</h1>
            <p className="mt-3 font-sans text-sm text-[var(--muted)]">
                Add a team member and keep their employment details available to the operation.
            </p>

            <div className="mt-8">
                <RecordForm
                fields={[
                    { name: 'sender', label: 'Sender', type: 'text', required: true },
                    { name: 'amount', label: 'Amount', type: 'number', required: true },
                    { name: 'expenseDate', label: 'Expense Date', type: 'date', required: true },
                    { name: 'paidTo', label: 'Paid To', type: 'text', required: true },
                    { name: 'receiptNumber', label: 'Receipt Number', type: 'text', required: false },
                    { name: 'receiptImageUrl', label: 'Receipt Image URL', type: 'text', required: false },
                    { name: 'approvedBy', label: 'Approved By', type: 'text', required: false },
                    { name: 'notes', label: 'Notes', type: 'textarea', required: false },
                    {
                        name: 'expenseCategoryId',
                        label: 'Expense Category',
                        type: 'select',
                        options: categoryOptions,
                        required: true,
                    },
                    {
                        name: 'paymentMethod',
                        label: 'Payment Method',
                        type: 'select',
                        options: paymentMethodOptions,
                        required: true,
                    },
                ]}
                submitLabel="Create expense"
                onSubmit={handleCreateExpense}
                />
            </div>
        </div>
    );
}