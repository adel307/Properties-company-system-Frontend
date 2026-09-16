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
    X
} from 'lucide-react';
import { propertiesApi } from '@/lib/api/properties';
import { employeesApi } from '@/lib/api/employees';

interface Employee {
    id: string;
    name: string;
}

interface Apartment {
    id: string;
    floor?: number;
    number?: string;
}

interface PropertyFormData {
    name: string;
    status: 'under_construction' | 'completed';
    address: string;
    startedIn: string;
    endedIn: string;
    floorsNumber: string;
    area: string;
    selectedEmployeeIds: string[];
    apartments: Apartment[];
}

interface EditPropertyProps {
    params: Promise<{
        propertyID: string;
    }>;
}

export default function EditPropertyPage({ params }: EditPropertyProps) {
    const { propertyID: propertyId } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [employeesList, setEmployeesList] = useState<Employee[]>([]);

    const [formData, setFormData] = useState<PropertyFormData>({
        name: '',
        status: 'under_construction',
        address: '',
        startedIn: '',
        endedIn: '',
        floorsNumber: '',
        area: '',
        selectedEmployeeIds: [],
        apartments: [],
    });

    useEffect(() => {
        let isMounted = true;

        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [propertyRes, empRes] = await Promise.all([
                    propertiesApi.getById(propertyId),
                    employeesApi.getAll().catch(() => ({ data: [] })),
                ]);

                if (!isMounted) return;

                const data = propertyRes?.data || propertyRes;
                const employees = empRes?.data || (Array.isArray(empRes) ? empRes : []);

                setEmployeesList(employees);

                if (data) {
                    const formatDate = (dateStr?: string) => 
                        dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';

                    // استخراج معرفات الموظفين المرتبطين حالياً
                    const extractedEmployeeIds = Array.isArray(data.employees)
                        ? data.employees.map((e: any) => e.employeeId || e.employee?.id || e.id).filter(Boolean)
                        : [];

                    setFormData({
                        name: data.name || '',
                        status: data.status || 'under_construction',
                        address: data.address || '',
                        startedIn: formatDate(data.startedIn),
                        endedIn: formatDate(data.endedIn),
                        floorsNumber: data.floorsNumber ? String(data.floorsNumber) : '',
                        area: data.area ? String(data.area) : '',
                        selectedEmployeeIds: extractedEmployeeIds,
                        apartments: Array.isArray(data.apartments) ? data.apartments : [],
                    });
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Error fetching property:', err);
                    setError('Failed to load property data. Please try again later.');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (propertyId) {
            fetchInitialData();
        }

        return () => {
            isMounted = false;
        };
    }, [propertyId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // إضافة موظف عند اختياره من الـ Select Box
    const handleAddEmployee = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        if (!selectedId) return;

        setFormData((prev) => {
            if (prev.selectedEmployeeIds.includes(selectedId)) return prev;
            return {
                ...prev,
                selectedEmployeeIds: [...prev.selectedEmployeeIds, selectedId],
            };
        });

        // إعادة ضبط الخيار المحدد في القائمة
        e.target.value = '';
    };

    // إزالة موظف من القائمة المختارة
    const handleRemoveEmployee = (empId: string) => {
        setFormData((prev) => ({
            ...prev,
            selectedEmployeeIds: prev.selectedEmployeeIds.filter((id) => id !== empId),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError(null);

            const toISOFormat = (dateStr: string) => {
                if (!dateStr) return '';
                return new Date(dateStr).toISOString();
            };

            if (formData.startedIn && formData.endedIn && new Date(formData.startedIn) > new Date(formData.endedIn)) {
                setError('End date cannot be earlier than start date.');
                setSubmitting(false);
                return;
            }

            // تجهيز البيانات بالشكل المحدد في API Request
            const payload = {
                name: formData.name.trim(),
                status: formData.status,
                address: formData.address.trim(),
                startedIn: toISOFormat(formData.startedIn),
                endedIn: toISOFormat(formData.endedIn),
                floorsNumber: formData.floorsNumber ? Number(formData.floorsNumber) : 0,
                area: formData.area ? String(formData.area) : '0',
                apartments: formData.apartments.map((apt) => ({ id: apt.id })),
                employees: formData.selectedEmployeeIds.map((id) => ({ id })),
            };

            await propertiesApi.update(propertyId, payload);

            router.push(`/${propertyId}`);
            router.refresh();
        } catch (err) {
            console.error('Failed to update property:', err);
            setError('An error occurred while saving changes. Please check the data and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] w-full items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-[var(--muted,#6b7280)]">
                    <Loader2 className="animate-spin" size={20} />
                    <span>Loading property data...</span>
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
                <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400">
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
                            <label className="mb-1 block font-sans text-xs font-medium">Property Name</label>
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
                            <label className="mb-1 block font-sans text-xs font-medium">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full rounded-md border border-[var(--line,#d1d5db)] bg-transparent px-3 py-2 text-sm focus:border-black focus:outline-none dark:focus:border-white"
                            >
                                <option value="under_construction">Under Construction</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block font-sans text-xs font-medium">Address</label>
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
                            <label className="mb-1 block font-sans text-xs font-medium">Started In</label>
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
                            <label className="mb-1 block font-sans text-xs font-medium">Ended In</label>
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
                            <label className="mb-1 block font-sans text-xs font-medium">Number of Floors</label>
                            <div className="relative">
                                <Layers size={16} className="absolute left-3 top-3 text-[var(--muted,#9ca3af)]" />
                                <input
                                    type="number"
                                    name="floorsNumber"
                                    min="1"
                                    required
                                    value={formData.floorsNumber}
                                    onChange={handleChange}
                                    placeholder="12"
                                    className="w-full rounded-md border border-[var(--line,#d1d5db)] bg-transparent py-2 pl-9 pr-3 text-sm focus:border-black focus:outline-none dark:focus:border-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block font-sans text-xs font-medium">Area (m²)</label>
                            <div className="relative">
                                <Maximize size={16} className="absolute left-3 top-3 text-[var(--muted,#9ca3af)]" />
                                <input
                                    type="number"
                                    step="0.1"
                                    min="1"
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

                {/* 3. Employee Assignments (Select Box + Badges) */}
                <div className="rounded-xl border border-[var(--line,#e5e7eb)] bg-[var(--bg,#ffffff)] p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-semibold">Assign Employees</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block font-sans text-xs font-medium">Select Employee to Add</label>
                            <select
                                onChange={handleAddEmployee}
                                defaultValue=""
                                className="w-full rounded-md border border-[var(--line,#d1d5db)] bg-transparent px-3 py-2 text-sm focus:border-black focus:outline-none dark:focus:border-white"
                            >
                                <option value="" disabled>-- Choose an employee --</option>
                                {employeesList.map((emp) => (
                                    <option 
                                        key={emp.id} 
                                        value={emp.id}
                                        disabled={formData.selectedEmployeeIds.includes(emp.id)}
                                    >
                                        {emp.name} {formData.selectedEmployeeIds.includes(emp.id) ? '(Assigned)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block font-sans text-xs font-medium">Assigned Employees List</label>
                            <div className="flex flex-wrap gap-2 rounded-md border border-[var(--line,#d1d5db)] p-3 min-h-[50px] items-center">
                                {formData.selectedEmployeeIds.length > 0 ? (
                                    formData.selectedEmployeeIds.map((empId) => {
                                        const emp = employeesList.find((e) => e.id === empId);
                                        return (
                                            <span
                                                key={empId}
                                                className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-1 text-xs text-white dark:bg-white dark:text-black"
                                            >
                                                <UserCheck size={12} />
                                                <span>{emp?.name || empId}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveEmployee(empId)}
                                                    className="ml-1 text-xs hover:text-red-400 dark:hover:text-red-600 focus:outline-none"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        );
                                    })
                                ) : (
                                    <span className="text-xs text-[var(--muted,#6b7280)]">No employees assigned yet.</span>
                                )}
                            </div>
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