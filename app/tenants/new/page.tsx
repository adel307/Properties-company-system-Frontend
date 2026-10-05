import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import RecordForm from '@/components/common/RecordForm';
import { tenantsApi } from '@/lib/api/tenants';

export default function NewTenantPage() {
  async function handleCreateTenant(rawData: Record<string, FormDataEntryValue>) {
    'use server';

    try {
      const payload = {
        name: String(rawData.name),
        nationalId: rawData.nationalId ? String(rawData.nationalId) : null,
        phone: String(rawData.phone),
        email: rawData.email ? String(rawData.email) : null,
      };

      await tenantsApi.create(payload);
    } catch (error) {
      console.error('Failed to create tenant:', error);
      return { error: 'Failed to create tenant. Please try again.' };
    }

    revalidatePath('/tenants');
    redirect('/tenants');
  }

  return (
    <div className="max-w-2xl fade-up">
      <Link href="/tenants" className="flex items-center gap-2 font-sans text-xs text-[var(--muted)]">
        <ArrowLeft size={14} /> Tenants
      </Link>

      <h1 className="display mt-8 text-5xl">New tenant</h1>
      <p className="mt-3 font-sans text-sm text-[var(--muted)]">
        Add a resident and keep their contact and national identification details available.
      </p>

      <div className="mt-8">
        <RecordForm
          fields={[
            { name: 'name', label: 'Full name', required: true },
            { name: 'nationalId', label: 'National ID' },
            { name: 'phone', label: 'Phone', required: true },
            { name: 'email', label: 'Email', type: 'email' },
          ]}
          submitLabel="Create tenant"
          onSubmit={handleCreateTenant}
        />
      </div>
    </div>
  );
}
