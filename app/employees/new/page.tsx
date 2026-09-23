import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import RecordForm from '@/components/common/RecordForm';
import { employeesApi } from '@/lib/api/employees';

export default function NewEmployeePage() {
  async function handleCreateEmployee(rawData: Record<string, FormDataEntryValue>) {
    'use server';

    try {
        const payload = {
            name: rawData.name,
            phone: rawData.phone || null,
            age: Number(rawData.age),
            experienceYears: Number(rawData.experienceYears),
            salary: Number(rawData.salary),
        }
        await employeesApi.create(payload);
    } catch (error) {
        console.error('Failed to create employee:', error);
        return { error: 'Failed to create employee. Please try again.' };
    }

    revalidatePath('/employees');
    redirect('/employees');
  }

  return (
    <div className="max-w-2xl fade-up">
        <Link href="/employees" className="flex items-center gap-2 font-sans text-xs text-[var(--muted)]">
            <ArrowLeft size={14} /> Employee
        </Link>

        <h1 className="display mt-8 text-5xl">New employee</h1>
        <p className="mt-3 font-sans text-sm text-[var(--muted)]">
            Add a team member and keep their employment details available to the operation.
        </p>

        <div className="mt-8">
            <RecordForm
            fields={[
                { name: 'name', label: 'Full name', required: true },
                { name: 'phone', label: 'Phone' },
                { name: 'age', label: 'Age', type: 'number', required: true },
                { name: 'experienceYears', label: 'Experience in years', type: 'number', required: true },
                { name: 'salary', label: 'Monthly salary', type: 'number', required: true },
            ]}
            submitLabel="Create employee"
            onSubmit={handleCreateEmployee}
            />
        </div>
    </div>
  );
}