export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CREDIT_CARD';

export interface ExpenseCategory {
	id: string;
	name?: string;
	title?: string;
}

export interface ExpenseRecord {
	id: string;
	sender: string;
	amount: number;
	expenseCategoryId: string;
	expenseDate: string;
	paidTo: string;
	paymentMethod: PaymentMethod;
	receiptNumber?: string | null;
	receiptImageUrl?: string | null;
	approvedBy?: string | null;
	notes?: string | null;
	category?: ExpenseCategory;
}

export interface ExpenseFormData {
	sender: string;
	amount: number;
	expenseCategoryId: string;
	expenseDate: string;
	paidTo: string;
	paymentMethod: PaymentMethod;
	receiptNumber?: string;
	receiptImageUrl?: string;
	approvedBy?: string;
	notes?: string;
}
