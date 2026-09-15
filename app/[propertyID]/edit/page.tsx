'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    ArrowLeft, 
    Building2, 
    MapPin, 
    Maximize,
    Loader2,
    Save,
    AlertCircle,
    Calendar,
    Layers,
    UserCheck,
    Home,
    Plus
} from 'lucide-react';
import { propertiesApi } from '@/lib/api/properties';
import { employeesApi } from '@/lib/api/employees';

// Types for Sub-Entities
interface Employee {
    id: string;
    name: string;
}

interface Apartment {
    id: string;
    unitNumber: string;
}

interface PropertyFormData {
    name: string;
    status: 'under_construction' | 'completed' | 'planned';
    address: string;
    startedIn: string;
    endedIn: string;
    floorsNumber: string;
    area: string;
    employeeIds: string[];
    apartmentId: string;
}

interface EditPropertyProps {
    params: Promise<{
        propertyID: string;
    }>;
}

export default function EditPropertyPage({ params }: EditPropertyProps) {
    const resolvedParams = use(params);
    const propertyId = resolvedParams.propertyID;
    
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Dropdown options state
    const [employeesList, setEmployeesList] = useState<Employee[]>([]);
    const [existingApartments, setExistingApartments] = useState<Apartment[]>([]);

    // Toggle for adding a new apartment
    const [isCreatingApartment, setIsCreatingApartment] = useState(false);

    // Primary Form State
    const [formData, setFormData] = useState<PropertyFormData>({
        name: '',
        status: 'under_construction',
        address: '',
        startedIn: '',
        endedIn: '',
        floorsNumber: '',
        area: '',
        employeeIds: [],
        apartmentId: '',
    });

    // New Apartment Form State
    const [newApartmentData, setNewApartmentData] = useState({
        unitNumber: '',
        rooms: '',
        price: '',
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);

                // Fetch property and metadata parallelly
                const [propertyRes, empRes] = await Promise.all([
                    propertiesApi.getById(propertyId),
                    employeesApi.getAll(),
                ]);

                const data = propertyRes?.data || propertyRes;
                if (empRes?.data) {
                    setEmployeesList(empRes.data);
                } else if (Array.isArray(empRes)) {
                    setEmployeesList(empRes);
                }

                if (data) {
                    const formatDate = (dateStr?: string) => 
                        dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';

                    setFormData({
                        name: data.name || '',
                        status: data.status || 'under_construction',
                        address: data.address || '',
                        startedIn: formatDate(data.startedIn),
                        endedIn: formatDate(data.endedIn),
                        floorsNumber: data.floorsNumber ? String(data.floorsNumber) : '',
                        area: data.area ? String(data.area) : '',
                        employeeIds: Array.isArray(data.employeeIds) 
                            ? data.employeeIds 
                            : data.employeeId ? [data.employeeId] : [],
                        apartmentId: data.apartmentId || '',
                    });
                }
            } catch (err) {
                console.error('Error fetching property:', err);
                setError('فشل في تحميل بيانات العقار. يرجى المحاولة لاحقاً.');
            } finally {
                setLoading(false);
            }
        };

        if (propertyId) {
            fetchInitialData();
        }
    }, [propertyId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEmployeeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
        setFormData((prev) => ({
            ...prev,
            employeeIds: selectedOptions,
        }));
    };

    const handleNewApartmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewApartmentData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError(null);

            const payload = {
                name: formData.name,
                status: formData.status,
                address: formData.address,
                startedIn: formData.startedIn,
                endedIn: formData.endedIn,
                floorsNumber: Number(formData.floorsNumber),
                area: Number(formData.area),
                employeeIds: formData.employeeIds,
                apartmentId: isCreatingApartment ? null : (formData.apartmentId || null),
                ...(isCreatingApartment && { 
                    newApartment: {
                        unitNumber: newApartmentData.unitNumber,
                        rooms: Number(newApartmentData.rooms),
                        price: Number(newApartmentData.price),
                    } 
                }),
            };

            await propertiesApi.update(propertyId, payload);

            router.push(`/${propertyId}`);
            router.refresh();
        } catch (err) {
            console.error('Failed to update property:', err);
            setError('حدث خطأ أثناء حفظ التغييرات. تحقق من البيانات وحاول مجدداً.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] w-full items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <Loader2 className="animate-spin" size={20} />
                    <span>جاري تحميل بيانات العقار...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between border-b border-[var(--line,#e5e7eb)] pb-4">
                <div>
                    <Link
                        href={`/${propertyId}`}
                        className="mb-2 inline-flex items-center gap-1.5 text-xs text-[var(--muted,#6b7280)] transition-colors hover:text-black dark:hover:text-white"
                    >
                        <ArrowLeft size={14} /> Back to property
                    </Link>
                    <h1 className="font-sans text-2xl font-bold">Edit Property</h1>
                </div>
            </div>

            {error && (
                <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Basic Details */}
                <div className="rounded-xl border border-[var(--line,#e5e7eb)] bg-[var(--bg,#ffffff)] p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-semibold">Basic Details</h2>
                    
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="mb-1 block font-sans text-xs font-medium">
                                Property Name
                            </label>
                            <div className="relative">
                                <Building2 size={16} className="absolute left-3 top-3 text-[var(--muted,#9ca3af)]" />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Palm Heights"
                                    className="w-full rounded-md border border-[var(--line,#d1d5db)] bg-transparent py-2 pl-9 pr-3 text-sm focus:border-black focus:outline-none dark:focus:border-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block font-sans text-xs font-medium">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full rounded-md border border-[var(--line,#d1d5db)] bg-transparent px-3 py-2 text-sm focus:border-black focus:outline-none dark:focus:border-white"
                            >
                                <option value="under_construction">Under Construction</option>
                                <option value="completed">Completed</option>
                                <option value="planned">Planned</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block font-sans text-xs font-medium">
                                Address
                            </label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3 top-3 text-[var(--muted,#9ca3af)]" />
                                <input
                                    type="text"
                                    name="address"
                                    required
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="e.g. New Cairo, Egypt"
                                    className="w-full rounded-md border border-[var(--line,#d1d5db)] bg-transparent py-2 pl-9 pr-3 text-sm focus:border-black focus:outline-none dark:focus:border-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block font-sans text-xs font-medium">
                                Started In
                            </label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-3 text-[var(--muted,#9ca3af)]" />
                                <input
                                    type="date"
                                    name="startedIn"
                                    required
                                    value={formData.startedIn}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-[var(--line,#d1d5db)] bg-transparent py-2 pl-9 pr-3 text-sm focus:border-black focus:outline-none dark:focus:border-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block font-sans text-xs font-medium">
                                Ended In
                            </label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-3 text-[var(--muted,#9ca3af)]" />
                                <input
                                    type="date"
                                    name="endedIn"
                                    required
                                    value={formData.endedIn}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-[var(--line,#d1d5db)] bg-transparent py-2 pl-9 pr-3 text-sm focus:border-black focus:outline-none dark:focus:border-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Physical Specifications */}
                <div className="rounded-xl border border-[var(--line,#e5e7eb)] bg-[var(--bg,#ffffff)] p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-semibold">Specifications</h2>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block font-sans text-xs font-medium">
                                Number of Floors
                            </label>
                            <div className="relative">
                                <Layers size={16} className="absolute left-3 top-3 text-[var(--muted,#9ca3af)]" />
                                <input
                                    type="number"
                                    name="floorsNumber"
                                    required
                                    value={formData.floorsNumber}
                                    onChange={handleChange}
                                    placeholder="12"
                                    className="w-full rounded-md border border-[var(--line,#d1d5db)] bg-transparent py-2 pl-9 pr-3 text-sm focus:border-black focus:outline-none dark:focus:border-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block font-sans text-xs font-medium">
                                Area (m²)
                            </label>
                            <div className="relative">
                                <Maximize size={16} className="absolute left-3 top-3 text-[var(--muted,#9ca3af)]" />
                                <input
                                    type="number"
                                    step="0.1"
                                    name="area"
                                    required
                                    value={formData.area}
                                    onChange={handleChange}
                                    placeholder="450.5"
                                    className="w-full rounded-md border border-[var(--line,#d1d5db)] bg-transparent py-2 pl-9 pr-3 text-sm focus:border-black focus:outline-none dark:focus:border-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Assignments (Employees & Apartment) */}
                <div className="rounded-xl border border-[var(--line,#e5e7eb)] bg-[var(--bg,#ffffff)] p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-semibold">Assignments & Unit Details</h2>
                    
                    <div className="space-y-4">
                        {/* Employee Selection */}
                        <div>
                            <label className="mb-1 block font-sans text-xs font-medium">
                                Assigned Employees
                            </label>
                            <div className="relative">
                                <UserCheck size={16} className="absolute left-3 top-3 text-[var(--muted,#9ca3af)]" />
                                <select
                                    name="employeeIds"
                                    multiple
                                    value={formData.employeeIds}
                                    onChange={handleEmployeeSelectChange}
                                    className="w-full rounded-md border border-[var(--line,#d1d5db)] bg-transparent py-2 pl-9 pr-3 text-sm focus:border-black focus:outline-none dark:focus:border-white min-h-[90px]"
                                >
                                    {employeesList.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <span className="mt-1 block text-[10px] text-[var(--muted,#6b7280)]">
                                Hold Ctrl (or Cmd) to select multiple employees.
                            </span>
                        </div>

                        {/* Apartment Link Section */}
                        <div className="pt-2 border-t border-[var(--line,#e5e7eb)]">
                            <div className="mb-3 flex items-center justify-between">
                                <label className="font-sans text-xs font-medium">
                                    Apartment Link
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingApartment(!isCreatingApartment)}
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                >
                                    {isCreatingApartment ? 'Select Existing Apartment' : '+ Create New Apartment'}
                                </button>
                            </div>

                            {!isCreatingApartment ? (
                                <div className="relative">
                                    <Home size={16} className="absolute left-3 top-3 text-[var(--muted,#9ca3af)]" />
                                    <select
                                        name="apartmentId"
                                        value={formData.apartmentId}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-[var(--line,#d1d5db)] bg-transparent py-2 pl-9 pr-3 text-sm focus:border-black focus:outline-none dark:focus:border-white"
                                    >
                                        <option value="">Select Existing Apartment...</option>
                                        {existingApartments.map((apt) => (
                                            <option key={apt.id} value={apt.id}>
                                                Unit #{apt.unitNumber}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed border-[var(--line,#d1d5db)] p-4 bg-neutral-50 dark:bg-neutral-900/50 space-y-3">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                        <Plus size={14} /> Add New Apartment Specs
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <div>
                                            <input
                                                type="text"
                                                name="unitNumber"
                                                placeholder="Unit Number (e.g. A-102)"
                                                value={newApartmentData.unitNumber}
                                                onChange={handleNewApartmentChange}
                                                className="w-full rounded-md border border-[var(--line,#d1d5db)] bg-white dark:bg-transparent px-3 py-1.5 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                name="rooms"
                                                placeholder="Rooms Count"
                                                value={newApartmentData.rooms}
                                                onChange={handleNewApartmentChange}
                                                className="w-full rounded-md border border-[var(--line,#d1d5db)] bg-white dark:bg-transparent px-3 py-1.5 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                name="price"
                                                placeholder="Price ($)"
                                                value={newApartmentData.price}
                                                onChange={handleNewApartmentChange}
                                                className="w-full rounded-md border border-[var(--line,#d1d5db)] bg-white dark:bg-transparent px-3 py-1.5 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Link
                        href={`/${propertyId}`}
                        className="rounded-md border border-[var(--line,#d1d5db)] px-4 py-2 font-sans text-xs font-medium hover:bg-[var(--line,#f3f4f6)] transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 rounded-md bg-black px-5 py-2 font-sans text-xs font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={14} className="animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                <Save size={14} /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}