import Link from 'next/link';
import { ArrowLeft, PlusCircle, Building2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import RecordForm from '@/components/common/RecordForm';
import { propertiesApi } from '@/lib/api/properties';
import { FormValues } from '@/types/RecordForm';

export default function NewPropertyPage() {
    async function handleCreateProperty(rawData: FormValues) {
      'use server';

      try {
            const payload = {
                name: rawData.name,
                status: rawData.status,
                address: rawData.address,
                startedIn: new Date(rawData.started_in).toISOString() || null,
                endedIn: rawData.status === 'completed' && new Date(rawData.ended_in).toISOString() || null,
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
        <div className="min-h-screen bg-neutral-950 px-4 py-8 text-neutral-100 sm:px-6 lg:px-8">
            {/* Expanded container for wide columns */}
            <div className="mx-auto max-w-6xl space-y-8">
                
                {/* Back Link - Gradual Entrance */}
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <Link
                        href="/"
                        className="group inline-flex items-center gap-2 rounded-lg bg-neutral-900/60 px-3 py-1.5 text-xs font-semibold text-neutral-400 ring-1 ring-neutral-800 transition-all hover:bg-neutral-800 hover:text-teal-400 hover:ring-teal-500/30"
                    >
                        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                        <span>Back to properties</span>
                    </Link>
                </div>

                {/* Header Section - Deepest Dark Layer (Top Row Equivalent) */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards delay-100 relative overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-950 p-6 sm:p-10 shadow-2xl">
                    {/* Ambient Glows */}
                    <div className="pointer-events-none absolute -left-20 -top-20 -z-10 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute right-0 top-0 -z-10 h-48 w-48 rounded-full bg-teal-400/5 blur-2xl" />

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-teal-400">
                              <PlusCircle size={13} className="animate-pulse" />
                              <span>New Record</span>
                          </div>

                          <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
                              New property
                          </h1>

                          <p className="mt-3 max-w-2xl text-base text-neutral-400 leading-relaxed">
                              Start a new project record and give the team a shared source of truth.
                          </p>
                      </div>

                      <div className="hidden sm:block">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/50 text-neutral-700 shadow-inner">
                            <Building2 size={36} className="text-neutral-600" />
                        </div>
                      </div>
                    </div>
                </div>

                {/* Form Container - Slightly Lighter Layer (Sequential Vertical Stepping) */}
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-backwards delay-200 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-6 sm:p-10 shadow-xl backdrop-blur-xl">
                    {/* Wide field constraints grid inside RecordForm */}
                    <div className="[&_input]:w-full [&_input]:min-w-[280px] [&_select]:w-full [&_select]:min-w-[280px] [&_label]:text-xs [&_label]:font-semibold [&_label]:uppercase [&_label]:tracking-wider [&_label]:text-neutral-400 [&_input]:bg-neutral-950 [&_input]:border-neutral-800 [&_input]:text-neutral-100 [&_select]:bg-neutral-950 [&_select]:border-neutral-800 [&_select]:text-neutral-100">
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

            </div>
        </div>
    );
}