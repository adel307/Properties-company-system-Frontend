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
    X,
    Users
} from 'lucide-react';
import { propertiesApi } from '@/lib/api/properties';
import { employeesApi } from '@/lib/api/employees';
import { Employee } from '@/types/employees';
import { EditPropertyProps, PropertyEmployeeAssignment, PropertyFormData } from '@/types/properties';

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
                        ? data.employees.map((e: PropertyEmployeeAssignment) => e.employeeId || e.employee?.id || e.id).filter(Boolean)
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
            <div className="flex min-h-screen w-full items-center justify-center bg-neutral-950">
                <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 px-5 py-3.5 text-sm font-medium text-neutral-400 backdrop-blur-md shadow-2xl">
                    <Loader2 className="animate-spin text-teal-400" size={20} />
                    <span>Loading property data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 px-4 py-8 text-neutral-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl space-y-8">
                
                {/* Header & Back Action */}
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 flex flex-col gap-4 border-b border-neutral-900 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={`/${propertyId}`}
                            className="group mb-3 inline-flex items-center gap-2 rounded-lg bg-neutral-900/60 px-3 py-1.5 text-xs font-semibold text-neutral-400 ring-1 ring-neutral-800 transition-all hover:bg-neutral-800 hover:text-teal-400 hover:ring-teal-500/30"
                        >
                            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                            <span>Back to property</span>
                        </Link>
                        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                            Edit Property
                        </h1>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-xs font-medium text-red-300 backdrop-blur-md">
                        <AlertCircle size={18} className="shrink-0 text-red-400" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 1. Basic Details — Deep Dark Row (Top) */}
                    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-backwards delay-100 rounded-2xl border border-neutral-900 bg-neutral-950/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                        <div className="mb-6 flex items-center gap-2 border-b border-neutral-900 pb-4">
                            <Building2 size={18} className="text-teal-400" />
                            <h2 className="text-base font-bold text-white">Basic Details</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                    Property Name <span className="text-teal-400">*</span>
                                </label>
                                <div className="relative rounded-xl border border-neutral-900 bg-neutral-900/50 transition-all focus-within:border-teal-500/50 focus-within:ring-2 focus-within:ring-teal-500/20">
                                    <Building2 size={16} className="absolute left-3.5 top-3.5 text-neutral-500" />
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Palm Heights"
                                        className="w-full bg-transparent py-2.5 pl-10 pr-4 text-sm text-neutral-100 placeholder-neutral-600 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                    Status
                                </label>
                                <div className="relative rounded-xl border border-neutral-900 bg-neutral-900/50 transition-all focus-within:border-teal-500/50 focus-within:ring-2 focus-within:ring-teal-500/20">
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full bg-transparent px-3.5 py-2.5 text-sm text-neutral-100 outline-none dark:[color-scheme:dark]"
                                    >
                                        <option value="under_construction" className="bg-neutral-900 text-neutral-100">Under Construction</option>
                                        <option value="completed" className="bg-neutral-900 text-neutral-100">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                    Address <span className="text-teal-400">*</span>
                                </label>
                                <div className="relative rounded-xl border border-neutral-900 bg-neutral-900/50 transition-all focus-within:border-teal-500/50 focus-within:ring-2 focus-within:ring-teal-500/20">
                                    <MapPin size={16} className="absolute left-3.5 top-3.5 text-neutral-500" />
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="e.g. New Cairo, Egypt"
                                        className="w-full bg-transparent py-2.5 pl-10 pr-4 text-sm text-neutral-100 placeholder-neutral-600 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                    Started In <span className="text-teal-400">*</span>
                                </label>
                                <div className="relative rounded-xl border border-neutral-900 bg-neutral-900/50 transition-all focus-within:border-teal-500/50 focus-within:ring-2 focus-within:ring-teal-500/20">
                                    <Calendar size={16} className="absolute left-3.5 top-3.5 text-neutral-500" />
                                    <input
                                        type="date"
                                        name="startedIn"
                                        required
                                        value={formData.startedIn}
                                        onChange={handleChange}
                                        className="w-full bg-transparent py-2.5 pl-10 pr-4 text-sm text-neutral-100 outline-none dark:[color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                    Ended In
                                </label>
                                <div className="relative rounded-xl border border-neutral-900 bg-neutral-900/50 transition-all focus-within:border-teal-500/50 focus-within:ring-2 focus-within:ring-teal-500/20">
                                    <Calendar size={16} className="absolute left-3.5 top-3.5 text-neutral-500" />
                                    <input
                                        type="date"
                                        name="endedIn"
                                        value={formData.endedIn}
                                        onChange={handleChange}
                                        className="w-full bg-transparent py-2.5 pl-10 pr-4 text-sm text-neutral-100 outline-none dark:[color-scheme:dark]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Specifications — Slightly Lighter Intermediate Dark Row */}
                    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-backwards delay-200 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
                        <div className="mb-6 flex items-center gap-2 border-b border-neutral-800/80 pb-4">
                            <Layers size={18} className="text-teal-400" />
                            <h2 className="text-base font-bold text-white">Specifications</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                    Number of Floors <span className="text-teal-400">*</span>
                                </label>
                                <div className="relative rounded-xl border border-neutral-800 bg-neutral-900/50 transition-all focus-within:border-teal-500/50 focus-within:ring-2 focus-within:ring-teal-500/20">
                                    <Layers size={16} className="absolute left-3.5 top-3.5 text-neutral-500" />
                                    <input
                                        type="number"
                                        name="floorsNumber"
                                        min="1"
                                        required
                                        value={formData.floorsNumber}
                                        onChange={handleChange}
                                        placeholder="12"
                                        className="w-full bg-transparent py-2.5 pl-10 pr-4 text-sm text-neutral-100 placeholder-neutral-600 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                    Area (m²) <span className="text-teal-400">*</span>
                                </label>
                                <div className="relative rounded-xl border border-neutral-800 bg-neutral-900/50 transition-all focus-within:border-teal-500/50 focus-within:ring-2 focus-within:ring-teal-500/20">
                                    <Maximize size={16} className="absolute left-3.5 top-3.5 text-neutral-500" />
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="1"
                                        name="area"
                                        required
                                        value={formData.area}
                                        onChange={handleChange}
                                        placeholder="450.5"
                                        className="w-full bg-transparent py-2.5 pl-10 pr-4 text-sm text-neutral-100 placeholder-neutral-600 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Employee Assignments — Lighter Shade Row */}
                    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-backwards delay-300 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
                        <div className="mb-6 flex items-center gap-2 border-b border-neutral-800 pb-4">
                            <Users size={18} className="text-teal-400" />
                            <h2 className="text-base font-bold text-white">Assign Employees</h2>
                        </div>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                    Select Employee to Add
                                </label>
                                <div className="relative rounded-xl border border-neutral-800 bg-neutral-900/50 transition-all focus-within:border-teal-500/50 focus-within:ring-2 focus-within:ring-teal-500/20">
                                    <select
                                        onChange={handleAddEmployee}
                                        defaultValue=""
                                        className="w-full bg-transparent px-3.5 py-2.5 text-sm text-neutral-100 outline-none dark:[color-scheme:dark]"
                                    >
                                        <option value="" disabled className="bg-neutral-900 text-neutral-400">-- Choose an employee --</option>
                                        {employeesList.map((emp) => (
                                            <option 
                                                key={emp.id} 
                                                value={emp.id}
                                                disabled={formData.selectedEmployeeIds.includes(emp.id)}
                                                className="bg-neutral-900 text-neutral-100 disabled:text-neutral-600"
                                            >
                                                {emp.name} {formData.selectedEmployeeIds.includes(emp.id) ? '(Assigned)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                    Assigned Employees List
                                </label>
                                <div className="flex flex-wrap gap-2.5 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 min-h-[60px] items-center">
                                    {formData.selectedEmployeeIds.length > 0 ? (
                                        formData.selectedEmployeeIds.map((empId) => {
                                            const emp = employeesList.find((e) => e.id === empId);
                                            return (
                                                <span
                                                    key={empId}
                                                    className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1.5 text-xs font-semibold text-teal-300 backdrop-blur-sm transition-all hover:bg-teal-500/20"
                                                >
                                                    <UserCheck size={13} className="text-teal-400" />
                                                    <span>{emp?.name || empId}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveEmployee(empId)}
                                                        className="ml-1 text-neutral-400 transition-colors hover:text-red-400 focus:outline-none"
                                                    >
                                                        <X size={13} />
                                                    </button>
                                                </span>
                                            );
                                        })
                                    ) : (
                                        <span className="text-xs text-neutral-500 italic">No employees assigned yet.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Row */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards delay-500 flex items-center justify-end gap-3 pt-4">
                        <Link
                            href={`/${propertyId}`}
                            className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-5 py-3 text-xs font-semibold text-neutral-300 transition-all hover:bg-neutral-800 hover:text-white"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-7 py-3 text-xs font-bold text-neutral-950 shadow-lg shadow-teal-500/10 transition-all hover:bg-teal-400 hover:shadow-teal-500/25 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={15} className="animate-spin text-neutral-950" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={15} /> Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}