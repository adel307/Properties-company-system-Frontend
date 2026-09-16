import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import RecordForm from '@/components/common/RecordForm';
import { suppliersApi } from '@/lib/api/suppliers';

export default function NewSupplierPage() {
  async function handleCreateSupplier(rawData: Record<string, FormDataEntryValue>) {
    'use server';

    try {
      const name = String(rawData.name || '').trim();
      if (!name) return { error: 'Supplier name is required.' };

      await suppliersApi.create({ name });
    } catch (error) {
      console.error('Failed to create supplier:', error);
      return { error: 'Failed to create supplier. Please try again.' };
    }

    revalidatePath('/suppliers');
    redirect('/suppliers');
  }

  return (
    <div className="max-w-2xl fade-up">
      <Link href="/suppliers" className="flex items-center gap-2 font-sans text-xs text-[var(--muted)]">
        <ArrowLeft size={14} /> Suppliers
      </Link>

      <h1 className="display mt-8 text-5xl">New supplier</h1>
      <p className="mt-3 font-sans text-sm text-[var(--muted)]">
        Add a supplier so materials and outstanding payments can be tracked against it.
      </p>

      <div className="mt-8">
        <RecordForm
          fields={[{ name: 'name', label: 'Supplier name', required: true }]}
          submitLabel="Create supplier"
          onSubmit={handleCreateSupplier}
        />
      </div>
    </div>
  );
}