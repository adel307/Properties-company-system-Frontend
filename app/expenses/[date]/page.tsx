import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { expensesApi } from '@/lib/api';
import DailyExpensesTable from '@/components/expenses/DailyExpensesTable';
export default async function ExpensesByDate({ params }) { const { date } = await params; const response = await expensesApi.getByDate(date); const expenses = Array.isArray(response) ? response : response?.data || []; return <div className="fade-up"><Link href="/expenses" className="flex items-center gap-2 font-sans text-xs text-[var(--muted)]"><ArrowLeft size={14} /> Expenses</Link><p className="mt-8 font-sans text-[10px] uppercase tracking-[.2em] text-[var(--teal)]">Daily ledger</p><h1 className="display mt-3 text-5xl">{date}</h1><div className="mt-10"><DailyExpensesTable expenses={expenses} /></div></div>; }
