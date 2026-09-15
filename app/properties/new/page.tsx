import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import RecordForm from '@/components/common/RecordForm';
import { propertiesApi } from '@/lib/api/properties';

export default function NewPropertyPage() {
  // تعريف Server Action خاصة بصفحة الإنشاء هذه
  async function handleCreateProperty(rawData: Record<string, any>) {
    'use server';

    const payload = {
      name: rawData.name,
      status: rawData.status,
      address: rawData.address,
      startedIn: rawData.started_in,
      endedIn: rawData.status === 'complete' ? rawData.ended_in : null,
      floorsNumber: Number(rawData.floors_number || 0),
      area: Number(rawData.area || 0),
    };

    return await propertiesApi.create(payload);
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
                { label: 'Complete', value: 'complete' },
                { label: 'Under Construction', value: 'under_construction' },
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