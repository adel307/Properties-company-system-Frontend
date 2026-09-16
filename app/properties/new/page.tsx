import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import RecordForm from '@/components/common/RecordForm';
import { propertiesApi } from '@/lib/api/properties';

export default function NewPropertyPage() {
  async function handleCreateProperty(rawData: Record<string, any>) {
    'use server';

    try {
      const payload = {
        name: rawData.name,
        status: rawData.status,
        address: rawData.address,
        startedIn: rawData.started_in ? new Date(rawData.started_in).toISOString() : null,
        endedIn: rawData.status === 'completed' && rawData.ended_in ? new Date(rawData.ended_in).toISOString() : null,
        floorsNumber: rawData.floors_number ? Number(rawData.floors_number) : 0,
        area: rawData.area ? String(rawData.area) : '0',
      };

      await propertiesApi.create(payload);
    } catch (error) {
      console.log('Failed to create property:', error);
      return { error: 'Failed to create property. Please try again.' };
    }

    revalidatePath('/');
    redirect('/');
  }

  return (
    <div className="max-w-2xl fade-up">
      <Link
        href="/"
        className="flex items-center gap-2 font-sans text-xs text-[var(--muted)]"
      >
        <ArrowLeft size={14} /> Properties
      </Link>

      <h1 className="display mt-8 text-5xl">New property</h1>
      <p className="mt-3 font-sans text-sm text-[var(--muted)]">
        Start a new project record and give the team a shared source of truth.
      </p>

      <div className="mt-8">
        <RecordForm
          fields={[
            { name: 'name', label: 'Property name', required: true },
            { name: 'address', label: 'Address', required: true },
            { name: 'started_in', label: 'Started in', type: 'date' },
            { name: 'ended_in', label: 'Ended in', type: 'date' },
            { name: 'floors_number', label: 'Number of floors', type: 'number' },
            { name: 'area', label: 'Area in m²', type: 'number' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              required: true,
              options: [
                { label: 'Under Construction', value: 'under_construction' },
                { label: 'Completed', value: 'completed' },
              ],
            },
          ]}
          submitLabel="Create property"
          onSubmit={handleCreateProperty}
        />
      </div>
    </div>
  );
}