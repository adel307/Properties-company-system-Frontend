import { expensesApi } from '@/lib/api/expenses';
import EntityPage from '@/components/common/EntityPage';
import { Column, EntityRow } from '@/types/EntityPage';

export default async function ExpensesPage() {
    const response = await expensesApi.getAll();
    const rows = Array.isArray(response) ? response : response?.data || [];

    const EnteredRaws = rows.map((row) => ({
        id: row.id,
        sender: row.sender,
        amount: row.amount,
        expenseCategoryId: row.expenseCategoryId,
        expenseDate: row.expenseDate.split("T")[0],
        paidTo: row.paidTo,
        paymentMethod: row.paymentMethod,
        receiptNumber: row.receiptNumber,
        receiptImageUrl: row.receiptImageUrl,
        approvedBy: row.approvedBy,
        notes: row.notes,
        category: row.category,
    }));

    const columns: Column[] = [
        { key: 'sender', label: 'Sender', type: 'text' },
        { key: 'amount', label: 'Amount', type: 'number' },
        { key: 'expenseDate', label: 'Date', type: 'date' },
        { key: 'paidTo', label: 'paid to', type: 'text' },
        { key: 'paymentMethod', label: 'Sender', type: 'text' },
        { key: 'receiptNumber', label: 'receipt number', type: 'number' },
        { key: 'receiptImageUrl', label: 'receipt Image Url', type: 'text' },
        { key: 'approvedBy', label: 'approved by', type: 'text' },
        { key: 'notes', label: 'notes', type: 'text' },
        {
            key: 'category', label: 'Category', type: 'select',
            // options: 
        },
    ];

    const handleSave = async (id: string, updatedData: Partial<EntityRow>) => {
        'use server';
        return null;
    };

    const handleDelete = async (id: string) => {
        'use server';
        await null;
    };

    return (
        <EntityPage
        eyebrow="Finance"
        title="Expenses"
        description="A daily view of every payment, with the evidence attached."
        rows={EnteredRaws}
        columns={columns}
        action="Add expense"
        actionHref="/expenses/new" // أو يمكنك استخدام onAction إذا كنت تفتح Modal
        onSave={handleSave}
        onDelete={handleDelete}
        />
    );
}